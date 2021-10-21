import rl     from 'readline';
import stream from 'stream';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function* readStream(
  stream: stream.Readable = process.stdin
): AsyncIterableIterator<string> {
  const readlineInterface = rl.createInterface({ input: stream });
  const readlineIterator = readlineInterface[Symbol.asyncIterator]();
  yield* readlineIterator;
}
