# AngularProtectRoute

Protect route components with access abstraction layer.

## Installation

```shell script
npm install angular-protect-route --save
```

Version <1.0.0 works only with Angular 8 and requires [ng-dynamic-component](https://github.com/gund/ng-dynamic-component) ^5.0.0

## Usage

### Create your protection strategy

In your project create a service which implements `StrategyResolver` interface
```typescript
// ... other imports
import {StrategyConfig, StrategyResolver} from 'angular-protect-route';

// its always good to define additional parameters our strategy config should contain while setting up route
interface MyStrategyConfig extends StrategyConfig {
    mustMatchRole: string;
}

@Injectable()
export class MyStrategyResolverService implements StrategyResolver {
    // ... constructor

    resolve(config: MyStrategyConfig) {
        if (this.user.role === config.mustMatchRole) {
            return of(config.component); // allow component to be rendered
        }
        // or prevent user from seeing the component by returning some other component like custom 403 Forbidden
        return of(Error403Component);
    }
}
```

### Create your routes with AngularProtectRouteComponent

Define routes that need protection in your existing app-routing.module.ts:
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
        component: AngularProtectRouteComponent,
        data: {component: AdminComponent, mustMatchRole: 'Administrator'},
    },
    {
        path: '**',
        component: Error404Component,
    }
];
```

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

Strategy used in above example is a small scale Role-Based Access Control (RBAC) where we rely on user role (or roles) to determine should some route be rendered into view or some other instead (Login/Error).

There are others like Attribute-Based Access Control (ABAC) where we might create large mappings of Role/User to Resource, or base resolving upon some other factor like time of day or GeoLocation.


## Resolve Strategies

Angular Protect Route is agnostic in terms which strategy you want to use, so you can implement any strategy that works best for your project.  
It also abstracts away the backend like LDAP/Windows login, JWT, OAuth... Resolver is de-facto the backend where you may check if user is authenticated or not, token is valid or use custom service.

## Limitations

- Lazy loaded routes: At this point we do not support lazy loaded routes.
- For Angular 8, components that should be protected must be defined as `entryComponents` in their respective module.
