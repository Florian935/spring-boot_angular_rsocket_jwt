import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestResponseRoutingModule } from './request-response-routing.module';
import { RequestResponseComponent } from './request-response.component';


@NgModule({
  declarations: [
    RequestResponseComponent
  ],
  imports: [
    CommonModule,
    RequestResponseRoutingModule
  ]
})
export class RequestResponseModule { }
