import {Type} from '@angular/core';
import {Data} from '@angular/router';

export interface StrategyConfig<T = any> extends Data {
    component: Type<T>;
}
