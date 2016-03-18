// Under Chrome it's faster to allocate an object using new, probably because if it's hidden classes optimization.


import {ResultCallback} from "./callback";

/**
 * Class representing an error-first synchronous result analogous to Node's callback pattern.
 * @hidden
 */
export class Result<T> {

    constructor(public error: Error, public value?: T) {

    }

    handleCallback(callback: ResultCallback<T>): void {
        process.nextTick(() => callback(this.error, this.value));
    }
}
