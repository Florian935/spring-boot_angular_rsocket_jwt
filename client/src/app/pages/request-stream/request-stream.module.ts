import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestStreamRoutingModule } from './request-stream-routing.module';
import { RequestStreamComponent } from './request-stream.component';


@NgModule({
  declarations: [
    RequestStreamComponent
  ],
  imports: [
    CommonModule,
    RequestStreamRoutingModule
  ]
})
export class RequestStreamModule { }
