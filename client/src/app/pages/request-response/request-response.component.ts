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
import { Payload, ReactiveSocket } from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Product } from 'src/app/shared/product.model';

@Component({
    selector: 'app-request-response',
    templateUrl: './request-response.component.html',
    styleUrls: ['./request-response.component.scss'],
})
export class RequestResponseComponent implements OnInit, OnDestroy {
    jwt: string = 'GENERATED_JWT';
    client!: RSocketClient<Buffer, Buffer>;
    product?: Product;

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
                    .requestResponse({
                        data: Buffer.from(
                            JSON.stringify({ label: 'Computer', price: 998 })
                        ),
                        metadata: encodeCompositeMetadata([
                            [
                                MESSAGE_RSOCKET_ROUTING,
                                encodeRoute('product.request.response.1'),
                            ],
                            [
                                MESSAGE_RSOCKET_AUTHENTICATION,
                                encodeBearerAuthMetadata(this.jwt),
                            ],
                        ]),
                    })
                    .subscribe({
                        onComplete: (payload: Payload<Buffer, Buffer>) => {
                            this.product = this.parseObject<Product>(
                                payload.data!.toString()
                            );
                        },
                        onError: (error: any) => {
                            console.log(
                                'Connection has been closed due to:: ' + error
                            );
                        },
                        onSubscribe: () => {
                            console.log('Subscribed !');
                        },
                    });
            },
            onError: (error: any) => {
                console.log('Connection has been refused due to:: ' + error);
            },
            onSubscribe: (cancel: any) => {
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
