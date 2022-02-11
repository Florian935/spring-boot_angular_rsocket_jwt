import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'request-response',
        loadChildren: () =>
            import('./pages/request-response/request-response.module').then(
                (m) => m.RequestResponseModule
            ),
    },
    {
        path: 'fire-and-forget',
        loadChildren: () =>
            import('./pages/fire-and-forget/fire-and-forget.module').then(
                (m) => m.FireAndForgetModule
            ),
    },
    {
        path: 'request-stream',
        loadChildren: () =>
            import('./pages/request-stream/request-stream.module').then(
                (m) => m.RequestStreamModule
            ),
    },
    {
        path: 'channel',
        loadChildren: () =>
            import('./pages/channel/channel.module').then(
                (m) => m.ChannelModule
            ),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
