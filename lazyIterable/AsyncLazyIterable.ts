type first = number;
type end   = number;
type count = number;

export default class AsyncLazyIterable<T>{
  private cache: T[] = [];

  constructor(public gen: AsyncGenerator<T>) {
  }

  $map<U>(cb: (val: T, index: number) => U): AsyncLazyIterable<U> {
    const gen = this[Symbol.asyncIterator]();
    return new AsyncLazyIterable(
      (async function* nextGenerator() {
        let current = await gen.next();
        let index = 0;
        while (!current.done) {
          yield cb(current.value, index++);
          current = await gen.next();
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
  $take(...args: [count] | [first, end]): AsyncLazyIterable<T> {
    const [first, end] =
      args.length === 2 ? args : [0, args[0]]
      ;

    if (first < 0 || end < 0)
      new Error('Out of range Error')
        ;
    const gen = this[Symbol.asyncIterator]();
    return new AsyncLazyIterable(
      (async function* nextGenerator() {
        let current = await gen.next();
        let index = 0;
        while (!current.done) {
          if (index >= end) break;// !(index < end)
          if (index >= first) yield current.value;
          index++;
          current = await gen.next();
        }
      })()
    );
  }

  $filter(cb: (value: T, index: number) => boolean): AsyncLazyIterable<T> {
    const gen = this[Symbol.asyncIterator]();
    return new AsyncLazyIterable(
      (async function* nextGenerator() {
        let current = await gen.next();
        let index = 0;
        while (!current.done) {
          if (cb(current.value, index++)) yield current.value;
          current = await gen.next();
        }
      })()
    );
  }

  async get(index: number): Promise<T> {
    if (index < 0) throw new Error('Out of range Error');
    const gen = this[Symbol.asyncIterator]();
    let current = await gen.next();
    let currentIndex = 0;
    while (!current.done && currentIndex < index) {
      currentIndex++;
      current = await gen.next();
    }
    if (current.done) throw new Error('Out of range Error');
    return this.cache[index] = current.value;
  }

  async find(cb: (value: T, index: number) => boolean): Promise<T | null> {
    const gen = this[Symbol.asyncIterator]();
    let current = await gen.next();
    let index = 0;
    while (!current.done) {
      if (cb(current.value, index++)) return current.value;
      current = await gen.next();
    }
    return null;
  }

  async findIndex(cb: (value: T, index: number) => boolean): Promise<number> {
    const gen = this[Symbol.asyncIterator]();
    let current = await gen.next();
    let index = 0;
    while (!current.done) {
      if (cb(current.value, index++)) return index;
      current = await gen.next();
    }
    return -1;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    yield* this.cache;
    let current = await this.gen.next();
    while (!current.done) {
      this.cache.push(current.value);
      yield current.value;
      current = await this.gen.next();
    }
  }

  async evaluate():Promise<Array<T>> {
    const output = [];
    for await (const val of this) {
      output.push(val);
    }
    return output;
  }
}
