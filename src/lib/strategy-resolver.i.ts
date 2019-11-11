import {Type} from '@angular/core';
import {Observable} from 'rxjs';

import {StrategyConfig} from './strategy-config.i';

export interface StrategyResolver<T = any> {
    resolve(config: StrategyConfig<T>): Observable<Type<T>>;
}
