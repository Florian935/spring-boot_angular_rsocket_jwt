import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FireAndForgetRoutingModule } from './fire-and-forget-routing.module';
import { FireAndForgetComponent } from './fire-and-forget.component';


@NgModule({
  declarations: [
    FireAndForgetComponent
  ],
  imports: [
    CommonModule,
    FireAndForgetRoutingModule
  ]
})
export class FireAndForgetModule { }
