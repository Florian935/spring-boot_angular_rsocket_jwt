import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    APPLICATION_JSON,
    BufferEncoders,
    encodeBearerAuthMetadata,
    encodeCompositeMetadata,
    encodeRoute,
    IdentitySerializer,
    JsonSerializer,
    MESSAGE_RSOCKET_AUTHENTICATION,
    MESSAGE_RSOCKET_COMPOSITE_METADATA,
    MESSAGE_RSOCKET_ROUTING,
    RSocketClient,
} from 'rsocket-core';
import { Flowable, FlowableProcessor } from 'rsocket-flowable';
import {
    Encodable,
    ISubscription,
    Payload,
    ReactiveSocket,
} from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { fromEvent } from 'rxjs';
@Component({
    selector: 'app-channel',
    templateUrl: './channel.component.html',
    styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent implements OnInit, OnDestroy {
    @ViewChild('channelButton', { static: true }) button?: ElementRef;
    jwt: string = 'GENERATED_JWT';
    client!: RSocketClient<Buffer, Buffer>;
    numbersSquared: Array<number> = [];
    flowable$ = new Flowable<number>((subscriber) => {
        subscriber.onSubscribe({
            cancel: () => {},
            request: () => {},
        });
    });
    processor$ = new FlowableProcessor<number, number>(this.flowable$);

    ngOnInit(): void {
        this.createRSocketClient();
        this.connect();
        fromEvent(this.button?.nativeElement, 'click').subscribe((value) => {
            this.processor$.onNext((value as PointerEvent).clientX);
        });
    }

    private createRSocketClient(): void {
        this.client = new RSocketClient({
            setup: {
                keepAlive: 60000,
                lifetime: 180000,
                dataMimeType: APPLICATION_JSON.string,
                metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
            },
            transport: new RSocketWebSocketClient(
                {
                    debug: true,
                    url: 'ws://localhost:7000/rsocket',
                    wsCreator: (url) => new WebSocket(url),
                },
                BufferEncoders
            ),
        });
    }

    private connect(): void {
        this.client.connect().subscribe({
            onComplete: (socket: ReactiveSocket<Buffer, Buffer>) => {
                socket
                    .requestChannel(
                        this.processor$.map((numberToSquare: number) => {
                            return {
                                data: Buffer.from(numberToSquare.toString()),
                                metadata: encodeCompositeMetadata([
                                    [
                                        MESSAGE_RSOCKET_ROUTING,
                                        encodeRoute('product.channel'),
                                    ],
                                    [
                                        MESSAGE_RSOCKET_AUTHENTICATION,
                                        encodeBearerAuthMetadata(this.jwt),
                                    ],
                                ]),
                            };
                        }) as Flowable<Payload<Buffer, Buffer>>
                    )
                    .subscribe({
                        onNext: (payload: Payload<Buffer, Buffer>) => {
                            const numberSquaredReceived: number =
                                this.parseObject<number>(
                                    payload.data!.toString()
                                );
                            this.numbersSquared = [
                                ...this.numbersSquared,
                                numberSquaredReceived,
                            ];
                        },
                        onComplete: () => {
                            console.log('complete');
                        },
                        onError: (error) => {
                            console.log(
                                'Connection has been closed due to:: ' + error
                            );
                        },
                        onSubscribe: (subscription: ISubscription) => {
                            subscription.request(100000);
                        },
                    });
            },
            onError: (error) => {
                console.log('Connection has been refused due to:: ' + error);
            },
            onSubscribe: () => {
                console.log('Subcribed successfully !');
            },
        });
    }

    private parseObject<T>(stringToObject: string): T {
        return JSON.parse(stringToObject);
    }

    ngOnDestroy(): void {
        this.client.close();
    }
}
