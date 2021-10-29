type first = number;
type end   = number;
type count = number;

export default class AsyncLazyIterable<T>{
  private cache: T[] = [];

  constructor(
    private gen: AsyncGenerator<T>,
    private callback: (value: void) => unknown = () => undefined,
    private shouldUseCache: boolean = true,
  ) {}

  /**
   * index is 0 indexed index from next item, when use do not use cache mode
   */
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
      })(),
      this.callback,
      this.shouldUseCache,
    );
  }

  /**
   * ```
   * // count is the number of items from index 0 or next item(use do not use cache mode)
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
      })(),
      this.callback,
      this.shouldUseCache,
    );
  }

  /**
   * index is 0 indexed index from next item, when use do not use cache mode
   */
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
      })(),
      this.callback,
      this.shouldUseCache,
    );
  }

   /**
   * index is 0 indexed index from next item, when use do not use cache mode
   */
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
    return current.value;
  }

  /**
   * index is 0 indexed index from next item, when use do not use cache mode
   */
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

  /**
   * index is 0 indexed index from next item, when use do not use cache mode
   */
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
    if (this.shouldUseCache) yield* this.cache;
    let current = await this.gen.next();
    while (!current.done) {
      if (this.shouldUseCache) this.cache.push(current.value);
      yield current.value;
      current = await this.gen.next();
    }
    this.callback();
  }

  async evaluate():Promise<Array<T>> {
    const output = [];
    for await (const val of this) {
      output.push(val);
    }
    return output;
  }
}
