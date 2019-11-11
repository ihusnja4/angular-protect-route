import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DynamicModule} from 'ng-dynamic-component';

import {AngularProtectRouteComponent} from './angular-protect-route.component';
import {ProtectionStrategy} from './protection-strategy';

@NgModule({
    declarations: [AngularProtectRouteComponent],
    imports: [CommonModule, RouterModule, DynamicModule],
    providers: [ProtectionStrategy],
    exports: [AngularProtectRouteComponent]
})
export class AngularProtectRouteModule {
}
