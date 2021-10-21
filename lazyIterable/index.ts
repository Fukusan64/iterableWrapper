import LazyIterable      from './lazyIterable';
import AsyncLazyIterable from './AsyncLazyIterable';

const isIterable = (value: unknown): value is Iterable<unknown> => {
  if ((typeof value !== 'object') || (value === null)) return false;
  const wObj: { [Symbol.iterator]?: unknown } = value;
  return typeof wObj[Symbol.iterator] === 'function';
};

const isAsyncIterable = <T>(value: unknown): value is AsyncIterable<T> => {
  if ((typeof value !== 'object') || (value === null)) return false;
  const wObj: { [Symbol.asyncIterator]?: unknown } = value;
  return typeof wObj[Symbol.asyncIterator] === 'function';
};

const isGenerator = <T>(value: unknown): value is Generator<T> => {
  if ((typeof value !== 'object') || (value === null)) return false;
  const wObj: { constructor?: unknown } = value;
  return wObj.constructor instanceof (function * () {/* */}).constructor;
};

const isAsyncGenerator = <T>(value: unknown): value is AsyncGenerator<T> => {
  if ((typeof value !== 'object') || (value === null)) return false;
  const wObj: { constructor?: unknown } = value;
  return wObj.constructor instanceof (async function * () {/* */}).constructor;
};

function $<T>(value: Generator<T>      | Iterable<T>     ): LazyIterable<T>;
function $<T>(value: AsyncGenerator<T> | AsyncIterable<T>): AsyncLazyIterable<T>;
function $<T>(
  value: Generator<T> | Iterable<T> | AsyncGenerator<T> | AsyncIterable<T>
): LazyIterable<T> | AsyncLazyIterable<T> {
  if (isGenerator(value)) {
    return new LazyIterable(value);
  } else if (isIterable(value)) {
    return new LazyIterable((
      function* () { yield* value; }
    )());
  } else if (isAsyncGenerator(value)) {
    return new AsyncLazyIterable(value);
  } else if (isAsyncIterable(value)) {
    return new AsyncLazyIterable((
      // eslint-disable-next-line @typescript-eslint/require-await
      async function* () { yield* value; }
    )());
  }
  throw new TypeError('value is not generator or iterator');
}

export default $;
