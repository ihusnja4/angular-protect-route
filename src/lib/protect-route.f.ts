import {Type} from '@angular/core';
import {Route} from '@angular/router';

export function protectRoute<TConfig = any, TComponent = any>() {
    return (routeSettings: Route | string, component: Type<TComponent>, strategyConfig: TConfig) => ({
        ...(typeof routeSettings === 'string' ? {path: routeSettings} : routeSettings),
        data: { component, strategyConfig }
    });
}
