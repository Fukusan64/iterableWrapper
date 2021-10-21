type first = number;
type end   = number;
type count = number;

export default class LazyIterable<T>{
  private cache: T[] = [];

  constructor(public gen: Generator<T>) {
  }

  $map<U>(cb:(val: T, index: number) => U): LazyIterable<U> {
    const gen = this[Symbol.iterator]();
    return new LazyIterable(
      (function* nextGenerator() {
        let current = gen.next();
        let index = 0;
        while (!current.done) {
          yield cb(current.value, index++);
          current = gen.next();
        }
      })()
    );
  }

  /**
   * ```
   * // count is the number of items from index 0
   * $take(...args:
   *  [count] |
   *  [first, end]
   * )
   *```
   */
  $take(...args: [count] | [first, end]): LazyIterable<T> {
    const [first, end] =
      args.length === 2 ? args : [0, args[0]]
    ;

    if (first < 0 || end < 0)
      new Error('Out of range Error')
    ;
    const gen = this[Symbol.iterator]();
    return new LazyIterable(
      (function* nextGenerator() {
        let current = gen.next();
        let index = 0;
        while (!current.done) {
          if (index >= end)   break;// !(index < end)
          if (index >= first) yield current.value;
          index++;
          current = gen.next();
        }
      })()
    );
  }

  $filter(cb: (value: T, index: number) => boolean): LazyIterable<T> {
    const gen = this[Symbol.iterator]();
    return new LazyIterable(
      (function* nextGenerator() {
        let current = gen.next();
        let index = 0;
        while (!current.done) {
          if (cb(current.value, index++)) yield current.value;
          current = gen.next();
        }
      })()
    );
  }

  get(index: number): T {
    if (index < 0) throw new Error('Out of range Error');
    const gen = this[Symbol.iterator]();
    let current = gen.next();
    let currentIndex = 0;
    while (!current.done && currentIndex < index) {
      currentIndex++;
      current = gen.next();
    }
    if (current.done) throw new Error('Out of range Error');
    return this.cache[index] = current.value;
  }

  find(cb: (value: T, index: number) => boolean): T | null {
    const gen = this[Symbol.iterator]();
    let current = gen.next();
    let index = 0;
    while (!current.done) {
      if (cb(current.value, index++)) return current.value;
      current = gen.next();
    }
    return null;
  }

  findIndex(cb: (value: T, index: number) => boolean): number {
    const gen = this[Symbol.iterator]();
    let current = gen.next();
    let index = 0;
    while (!current.done) {
      if (cb(current.value, index++)) return index;
      current = gen.next();
    }
    return -1;
  }

  * [Symbol.iterator](): Iterator<T> {
    yield* this.cache;
    let current = this.gen.next();
    while (!current.done) {
      this.cache.push(current.value);
      yield current.value;
      current = this.gen.next();
    }
  }

  evaluate():Array<T> {
    return [...this];
  }

}
