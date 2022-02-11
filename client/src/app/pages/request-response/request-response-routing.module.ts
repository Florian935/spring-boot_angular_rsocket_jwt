import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestResponseComponent } from './request-response.component';

const routes: Routes = [{ path: '', component: RequestResponseComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RequestResponseRoutingModule {}
