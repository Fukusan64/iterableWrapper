type first = number;
type step  = number;
type end   = number;

/**
 * ```
 * // first, end and step is alias of number
 * function range(...args:
 *   [end] |
 *   [first, end] |
 *   [first, end, step]
 * )
 * ```
 */
export default function* range(
  ...args: [end] | [first, end] | [first, end, step]
): Generator<number, void, unknown>{
  switch (args.length) {
    case 1: {
      const [end] = args;
      for (let i = 0; i < end; i++) yield i;
      break;
    }

    case 2: {
      const [first, end] = args;
      for (let i = first; i < end; i++) yield i;
      break;
    }

    case 3: {
      const [first, end, step] = args;
      if (step > 0) {
        for (let i = first; i < end; i += step) yield i;
      } else {
        for (let i = first; i > end; i += step) yield i;
      }
      break;
    }

    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const check: never = args;
    }
  }
}
