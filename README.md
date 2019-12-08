# AngularProtectRoute

Protect route components with access abstraction layer.

This library provides alternative to [Angular Router's `CanActivate`](https://angular.io/guide/router#canactivate-requiring-authentication) guard use.

## Shortcomings of Angular Router `CanActivate`

You can redirect to some other route by returning/emitting `string` from guard, or by returning/emitting boolean `false` you may choose to show custom indication of route being inaccessible i.e. _alert_ modal or _toast_ message or calling `router.navigate()` manually in guard while returning `false`.

The amount of available scenarios you can support in the event when `User` goes to route `/x` and has no access to it:

1. redirect to `/error` (maybe with optional `?type=403` or `?type=401`)
2. stay on same route and `toast` the message or show `alert` dialog with "Not allowed"
3. redirect to `/login` (probably with `?return-url=/x`) so user could authenticate

Neither is without some problems:

1. Having an "error" route in your app **is a really bad idea**:
    - it is included in _browser history_ so user may recreate `erroneous` state of app simply by pressing "back" button
    - user may _bookmark address_ and visit error route later
    - user may _copy address_ and share it and let everyone visit the error route, so you may think that the showing alert or toast message is better?
2. Showing _alert_ or _toast_ message will only work if user already loaded the application on an "non-protected" or "allowed" route, where there is some kind of view shown
    - if user opens `/x` directly by following a link, instead of seeing your nice application, he may see blank screen with _alert_/_toast_ on top of it
3. Redirecting user to `/login` though better than just showing error on blank screen it has same caveats as `/error` and needs extra handling:
    - pressing "back"/clicking link/bookmark, while user is already logged in means you must handle `/login` route to redirect to somewhere
    - probably having extra handler to remove it from browser history
    - you should also handle the `return-url` so user can be redirected to `/x` route after successful login
    
> Beware of using `?return-url={path}`!  
> You may notice that double url encoding of the `{path}` value is required

So what if you do not want to redirect? What if you would not want to have /login and /error routes polluting browsers history? What if on "User not logged in" and "User is logged but is not granted access" you would either show login screen or "Forbidden" error message respectively without changing url? Regardless of rest of routes ever being activated before.

Unfortunately, `CanActivate` cannot provide you with that.


## Benefits of AngularProtectRoute

1. Choose between using `CanActivate` or `AngularProtectRoute`
    - `AngularProtectRoute` is in no conflict with other Angular Router guards/hooks
2. Choose protection strategy:
    - build your own simple role based strategy
    - build your own complex role based or some other strategy
    - customize strategy to use 3rd-party authentication (OAuth, JWT, Facebook) or access control or both
3. Choose how to resolve unauthenticated and unauthorized:
    - different views
    - toast/alerts
    - redirection to internal or external content
4. Choose how to govern components based on something loosely or not even user-related like: particular country or particular time period


## Installation

```shell script
npm install angular-protect-route --save
```

Version <1.0.0 works only with Angular 8 and requires [ng-dynamic-component](https://github.com/gund/ng-dynamic-component) ^5.0.0


## Usage


### Create your protection strategy

In your project create a service which implements `StrategyResolver` interface
```typescript
import {StrategyConfig, StrategyResolver} from 'angular-protect-route';

// its always good to define additional parameters our strategy config should contain while setting up route
interface MyStrategyConfig extends StrategyConfig {
    mustMatchRole: string;
}

@Injectable()
export class MyStrategyResolverService implements StrategyResolver {
    constructor(private user: CurrentUser) {}

    resolve(config: MyStrategyConfig) {
        if (this.user.role === config.mustMatchRole) {
            return of(config.component); // allow component to be rendered
        }
        // or prevent user from seeing the component by returning some other component like custom 403 Forbidden
        return of(Error403Component);
    }
}
```

`resolve()` method returns observable, which is convenient as you may choose to emit a sequence of components for various situations. I.e. while still unable to determine users identity, you may emit component with info "Please wait while we check your identity", then when identity is determined, emit desired component or emit error component if identification fails.

Strategy used in above example is a small scale **Role-Based Access Control (RBAC)** where we rely on user role (or roles) to determine should some route be rendered into view or some other instead like Login or Error.

There are other strategies like **Attribute-Based Access Control (ABAC)** where we might create large mappings of Role/User to Resource, or base resolving upon some other factor like time of day, geo-location etc.


### Create/modify your routes

Define routes that need protection in your existing `app-routing.module.ts`.

#### Option 1 - direct configuration using `AngularProtectRouteComponent` proxy component:
```typescript
// ... other imports
import {AngularProtectRouteComponent} from 'angular-protect-route';

export const routes: Routes = [
    { // route without protection
        path: '',
        component: DashboardComponent,
    },
    { // route protected by checking user role
        path: 'administration',
        component: AngularProtectRouteComponent, // proxy component
        // strategy configuration is passed via data prop, as is the component we are protecting
        data: {component: AdminComponent, mustMatchRole: 'Administrator'},
    },
    {
        path: '**',
        component: Error404Component,
    }
];
```
`AngularProtectRouteComponent` is called proxy because it sits between the router and your component. This component will dynamically render any component that your `StrategyResolver` emits via observable.  
This is very convenient as it allows you to immediately upon receiving a logout signal from your Auth/User service, just emit a different component (i.e. LoginComponent) or while making the token processing you may emit custom component which displays info to the user that his identity is being checked or something else.  


#### Option 2 - using `protectRoute()` helper:
```typescript
// ... other imports
import {protectRoute} from 'angular-protect-route';

const protectWithRole = protectRoute(mustMatchRole => ({mustMatchRole}));
// signature:
// protectWithRole(route, component, mustMatchRole) or
// protectWithRole(routePath, component, mustMatchRole)

export const routes: Routes = [
    { // route without protection
        path: '',
        component: DashboardComponent,
    },
    protectWithRole('administration', AdminComponent, 'Administrator'),
    {
        path: '**',
        component: Error404Component,
    }
];
```
`protectRoute()` is what is called _Higher Order Function (HOF)_. It returns prepared function that can be used to create routes with more semantics and less code.  
Using helper is more flexible when dealing with multiple protection options i.e. when alongside "must match role", we would also like to protect routes with alternative options like "must be logged in", "public only", "time period", "geo-location" etc.

### Use routes, register module dependency and provide resolver service

All that in your `app-routing.module.ts`
```typescript
// ... other imports
import {AngularProtectRouteModule, ProtectionStrategy} from 'angular-protect-route';

@NgModule({
    imports: [
        AngularProtectRouteModule, // register protection module
        RouterModule.forRoot(routes) // register routes
    ],
    exports: [RouterModule],
    providers: [
        // provide protection strategy resolver for your routes
        {provide: ProtectionStrategy, useClass: MyStrategyResolverService}
    ]
})
export class AppRoutingModule { }
``` 

> Failing to provide custom ProtectionStrategy service will cause resolution error:  
> `ERROR Strategy not resolved`


## Resolve Strategies

Angular Protect Route is agnostic in terms which strategy you want to use, so you can implement any strategy that works best for your project.  
It also abstracts away the backend like LDAP/Windows login, JWT, OAuth... Resolver is de-facto the backend where you may check if user is authenticated or not, token is valid or use custom service.

## Limitations

- Every child component must be protected individually (unlike [`CanActivateChildren`](https://angular.io/guide/router#canactivatechild-guarding-child-routes) does for `CanActivate`)
- For Angular 8, components that should be protected must be defined as `entryComponents` in their respective module.
