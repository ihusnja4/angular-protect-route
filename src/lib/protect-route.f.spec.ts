import {Route} from '@angular/router';

import {protectRoute} from './protect-route.f';
import {AngularProtectRouteComponent} from './angular-protect-route.component';

class PseudoComponent {}

describe('protectRoute', () => {
    const mapper = foo => ({bar: foo}); // maps foo param under the bar key

    it('accepts mapper and returns a function', () => {
        expect(protectRoute(mapper)).toEqual(jasmine.any(Function));
    });

    describe('returned function', () => {
        const component = PseudoComponent;
        let path: string;

        beforeEach(() => {
            path = 'pseudo-path';
        });

        it('accepts path (string), component and input and returns Route object', () => {
            const route = protectRoute(mapper)(path, component, 123);

            expect(route).toEqual({
                path,
                component: AngularProtectRouteComponent,
                data: { component, ...mapper(123) }
            });
        });

        it('accepts route setting, component and input and returns Route object', () => {
            const routeSetting: Omit<Route, 'component' | 'data'> = {
                path,
                canActivate: [() => true] // for testing purposes not required to be actual @CanActivate() service
            };

            const route = protectRoute(mapper)(routeSetting, component, '123');

            expect(route).toEqual({
                ...routeSetting,
                component: AngularProtectRouteComponent,
                data: { component, ...mapper('123') }
            });
        });
    });
});
