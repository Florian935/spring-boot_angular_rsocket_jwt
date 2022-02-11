import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    APPLICATION_JSON,
    Encodable,
    IdentitySerializer,
    JsonSerializer,
    MESSAGE_RSOCKET_ROUTING,
    RSocketClient,
} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { Product } from 'src/app/shared/product.model';
import { ReactiveSocket } from 'rsocket-types';

@Component({
    selector: 'app-fire-and-forget',
    templateUrl: './fire-and-forget.component.html',
    styleUrls: ['./fire-and-forget.component.scss'],
})
export class FireAndForgetComponent implements OnInit, OnDestroy {
    client!: RSocketClient<string, Encodable>;

    ngOnInit(): void {
        this.createRSocketClient();
        this.connect();
    }

    private createRSocketClient(): void {
        this.client = new RSocketClient<string, Encodable>({
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
            onComplete: (socket: ReactiveSocket<string, Encodable>) => {
                socket.fireAndForget({
                    data: 'Hello World !',
                    metadata: this.getMetadata('fire.and.forget'),
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

    private getMetadata(route: string): string {
        return `${String.fromCharCode(route.length)}${route}`;
    }

    ngOnDestroy(): void {
        if (this.client) {
            this.client.close();
        }
    }
}
