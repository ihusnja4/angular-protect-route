import {Component, OnInit, Type} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';

import {ProtectionStrategy, StrategyConfig} from '.';

@Component({
    selector: 'ih-protect-route',
    template: `<ndc-dynamic [ndcDynamicComponent]="component | async"></ndc-dynamic>`
})
export class AngularProtectRouteComponent<T = any> implements OnInit {
    component: Observable<Type<T>>;

    constructor(
        private route: ActivatedRoute,
        private strategyResolver: ProtectionStrategy<T>
    ) {}

    ngOnInit() {
        this.component = this.strategyResolver.resolve(this.route.snapshot.data as StrategyConfig);
    }
}
