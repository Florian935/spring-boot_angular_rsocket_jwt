import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    APPLICATION_JSON,
    BufferEncoders,
    encodeBearerAuthMetadata,
    encodeCompositeMetadata,
    encodeRoute,
    MESSAGE_RSOCKET_AUTHENTICATION,
    MESSAGE_RSOCKET_COMPOSITE_METADATA,
    MESSAGE_RSOCKET_ROUTING,
    RSocketClient,
} from 'rsocket-core';
import { ISubscription, Payload, ReactiveSocket } from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Product } from 'src/app/shared/product.model';

@Component({
    selector: 'app-request-stream',
    templateUrl: './request-stream.component.html',
    styleUrls: ['./request-stream.component.scss'],
})
export class RequestStreamComponent implements OnInit, OnDestroy {
    jwt: string = 'GENERATED_JWT';
    client!: RSocketClient<Buffer, Buffer>;
    products: Array<Product> = [];

    ngOnInit(): void {
        this.createRSocketClient();
        this.connect();
    }

    private createRSocketClient(): void {
        this.client = new RSocketClient<Buffer, Buffer>({
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
                    .requestStream({
                        data: Buffer.from(JSON.stringify([1, 2, 5, 10, 12])),
                        metadata: encodeCompositeMetadata([
                            [
                                MESSAGE_RSOCKET_ROUTING,
                                encodeRoute('product.request.stream'),
                            ],
                            [
                                MESSAGE_RSOCKET_AUTHENTICATION,
                                encodeBearerAuthMetadata(this.jwt),
                            ],
                        ]),
                    })
                    .subscribe({
                        onNext: (payload: Payload<Buffer, Buffer>) => {
                            const productReceived: Product =
                                this.parseObject<Product>(
                                    payload.data!.toString()
                                );
                            this.products = [...this.products, productReceived];
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
                            subscription.request(1000000);
                        },
                    });
            },
            onError: (error) => {
                console.log('Connection has been refused due to:: ' + error);
            },
            onSubscribe: (cancel) => {
                console.log('Subcribed successfully !');
            },
        });
    }

    private parseObject<T>(stringToObject: string): T {
        return JSON.parse(stringToObject);
    }

    ngOnDestroy(): void {
        if (this.client) {
            this.client.close();
        }
    }
}
