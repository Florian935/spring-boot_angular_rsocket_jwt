import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FireAndForgetComponent } from './fire-and-forget.component';

const routes: Routes = [{ path: '', component: FireAndForgetComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FireAndForgetRoutingModule {}
