import {Type} from '@angular/core';
import {Route} from '@angular/router';

import {AngularProtectRouteComponent} from './angular-protect-route.component';

/**
 * This High Order Function (HOF) prepares function that is to be used to create protected route by simplifying the input.
 *
 * @param mapper Mapper function that converts (simplified) input into strategy protection config
 */
export function protectRoute<TConfig, TInput, TComponent = any>(mapper: (input: TInput) => Omit<TConfig, 'component'>) {
    /**
     * @param routeSettings path or route config (minus the component and data)
     * @param component Component that needs to be protected
     * @param input Simplified input that will be converted into full strategy protection config
     */
    return (routeSettings: Omit<Route, 'component' | 'data'> | string, component: Type<TComponent>, input: TInput) => ({
        ...(typeof routeSettings === 'string' ?
                {path: routeSettings} :
                routeSettings
        ),
        component: AngularProtectRouteComponent,
        data: { component, ...mapper(input) } // mapper should return rest of the configuration options
    });
}
