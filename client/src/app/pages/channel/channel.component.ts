import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    APPLICATION_JSON,
    IdentitySerializer,
    JsonSerializer,
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
    client!: RSocketClient<number, Encodable>;
    numbersSquared: Array<number> = [];
    flowable$ = new Flowable((subscriber) => {
        subscriber.onSubscribe({
            cancel: () => {},
            request: () => {},
        });
    });
    processor$ = new FlowableProcessor(this.flowable$);

    ngOnInit(): void {
        this.createRSocketClient();
        this.connect();
        fromEvent(this.button?.nativeElement, 'click').subscribe((value) => {
            this.processor$.onNext((value as PointerEvent).clientX);
        });
    }

    private createRSocketClient(): void {
        this.client = new RSocketClient({
            serializers: {
                data: JsonSerializer,
                metadata: IdentitySerializer,
            },
            setup: {
                keepAlive: 60000,
                lifetime: 180000,
                dataMimeType: APPLICATION_JSON.string,
                metadataMimeType: MESSAGE_RSOCKET_ROUTING.string,
            },
            transport: new RSocketWebSocketClient({
                debug: true,
                url: 'ws://localhost:7000',
                wsCreator: (url) => new WebSocket(url),
            }),
        });
    }

    private connect(): void {
        this.client.connect().subscribe({
            onComplete: (socket: ReactiveSocket<number, Encodable>) => {
                socket
                    .requestChannel(
                        this.processor$.map((i) => {
                            return {
                                data: i,
                                metadata: this.getMetadata('channel'),
                            };
                        }) as Flowable<Payload<number, Encodable>>
                    )
                    .subscribe({
                        onNext: ({ data }) => {
                            this.numbersSquared = [
                                ...this.numbersSquared,
                                data as number,
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

    private getMetadata(route: string): string {
        return `${String.fromCharCode(route.length)}${route}`;
    }

    ngOnDestroy(): void {
        this.client.close();
    }
}
