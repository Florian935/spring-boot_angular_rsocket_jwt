import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestStreamComponent } from './request-stream.component';

const routes: Routes = [{ path: '', component: RequestStreamComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RequestStreamRoutingModule {}
