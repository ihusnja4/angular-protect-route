import {Component, Input} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';

import {AngularProtectRouteComponent} from './angular-protect-route.component';
import {ProtectionStrategy} from './protection-strategy';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ndc-dynamic',
    template: ''
})
class FakeNdcDynamicComponent {
    @Input() ndcDynamicComponent: any;
}

class FooComponent {}

describe('AngularProtectRouteComponent', () => {
    let component: AngularProtectRouteComponent;
    let fixture: ComponentFixture<AngularProtectRouteComponent>;
    let activatedRouteService: any;
    let strategyResolveService: jasmine.SpyObj<ProtectionStrategy<FooComponent>>;

    beforeEach(async(() => {
        activatedRouteService = {
            snapshot: {
                data: 'dummy data'
            }
        };
        strategyResolveService = jasmine.createSpyObj('ProtectionStrategy', ['resolve']);
        strategyResolveService.resolve = jasmine.createSpy('resolve').and.returnValue(of(FooComponent));

        TestBed.configureTestingModule({
            declarations: [AngularProtectRouteComponent, FakeNdcDynamicComponent],
            providers: [
                {provide: ActivatedRoute, useValue: activatedRouteService},
                {provide: ProtectionStrategy, useValue: strategyResolveService}
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AngularProtectRouteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should use protection strategy resolver to pass proper component to be rendered', () => {
        const dynamic: FakeNdcDynamicComponent = fixture.debugElement.query(By.directive(FakeNdcDynamicComponent)).componentInstance;
        expect(dynamic.ndcDynamicComponent).toBe(FooComponent);
    });
});
