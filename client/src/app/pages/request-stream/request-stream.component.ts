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
import { ReactiveSocket, ISubscription } from 'rsocket-types';

@Component({
    selector: 'app-request-stream',
    templateUrl: './request-stream.component.html',
    styleUrls: ['./request-stream.component.scss'],
})
export class RequestStreamComponent implements OnInit, OnDestroy {
    client!: RSocketClient<Product, Encodable>;
    products: Array<Product> = [];

    ngOnInit(): void {
        this.createRSocketClient();
        this.connect();
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
            onComplete: (
                socket: ReactiveSocket<Product | string[], Encodable>
            ) => {
                socket
                    .requestStream({
                        data: ['1', '2', '4'],
                        metadata: this.getMetadata('request.stream'),
                    })
                    .subscribe({
                        onNext: ({ data }) => {
                            this.products = [...this.products, data as Product];
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

    private getMetadata(route: string): string {
        return `${String.fromCharCode(route.length)}${route}`;
    }

    ngOnDestroy(): void {
        if (this.client) {
            this.client.close();
        }
    }
}
