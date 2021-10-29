import rl     from 'readline';
import stream from 'stream';

export default function readStream(
  stream: stream.Readable = process.stdin
): [AsyncIterableIterator<string>, () => void] {
  const readlineInterface = rl.createInterface({ input: stream });
  const readlineIterator = readlineInterface[Symbol.asyncIterator]();
  return [readlineIterator, readlineInterface.close.bind(readlineInterface)];
}
