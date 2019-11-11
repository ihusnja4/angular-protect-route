import {of} from 'rxjs';

import {StrategyConfig} from './strategy-config.i';
import {StrategyResolver} from './strategy-resolver.i';

export class ProtectionStrategy<T = any> implements StrategyResolver {
    resolve(config: StrategyConfig<T>) {
        return of(config.component);
    }
}
