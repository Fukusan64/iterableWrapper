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

function $<T>(
  value: Generator<T> | Iterable<T>,
  callback?: () => unknown,
  shouldUseCache?: boolean
): LazyIterable<T>;
function $<T>(
  value: AsyncGenerator<T> | AsyncIterable<T>,
  callback?: () => unknown,
  shouldUseCache?: boolean
): AsyncLazyIterable<T>;
function $<T>(
  value: Generator<T> | Iterable<T> | AsyncGenerator<T> | AsyncIterable<T>,
  callback: () => unknown = () => undefined,
  shouldUseCache = true,
): LazyIterable<T> | AsyncLazyIterable<T> {
  if (isGenerator(value)) {
    return new LazyIterable(
      value,
      callback,
      shouldUseCache,
    );
  } else if (isIterable(value)) {
      return new LazyIterable((
        function* () { yield* value; }
      )(),
      callback,
      shouldUseCache,
    );
  } else if (isAsyncGenerator(value)) {
    return new AsyncLazyIterable(
      value,
      callback,
      shouldUseCache,
    );
  } else if (isAsyncIterable(value)) {
      return new AsyncLazyIterable((
        // eslint-disable-next-line @typescript-eslint/require-await
        async function* () { yield* value; }
      )(),
      callback,
      shouldUseCache,
    );
  }
  throw new TypeError('value is not generator or iterator');
}

export default $;
