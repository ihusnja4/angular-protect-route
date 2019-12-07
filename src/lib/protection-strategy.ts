import {throwError} from 'rxjs';

import {StrategyConfig} from './strategy-config.i';
import {StrategyResolver} from './strategy-resolver.i';

/**
 * ProtectionStrategy is only used to define provider interface for actual strategy resolver.
 */
export class ProtectionStrategy<T = any> implements StrategyResolver {
    resolve(config: StrategyConfig<T>) {
        return throwError('Strategy not defined');
    }
}
