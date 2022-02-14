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
import { ReactiveSocket } from 'rsocket-types';
import RSocketWebSocketClient from 'rsocket-websocket-client';

@Component({
    selector: 'app-fire-and-forget',
    templateUrl: './fire-and-forget.component.html',
    styleUrls: ['./fire-and-forget.component.scss'],
})
export class FireAndForgetComponent implements OnInit, OnDestroy {
    jwt: string = 'GENERATED_JWT';
    client!: RSocketClient<Buffer, Buffer>;

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
                socket.fireAndForget({
                    data: Buffer.from('Hello World !'),
                    metadata: encodeCompositeMetadata([
                        [
                            MESSAGE_RSOCKET_ROUTING,
                            encodeRoute('product.fire.and.forget'),
                        ],
                        [
                            MESSAGE_RSOCKET_AUTHENTICATION,
                            encodeBearerAuthMetadata(this.jwt),
                        ],
                    ]),
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

    ngOnDestroy(): void {
        if (this.client) {
            this.client.close();
        }
    }
}
