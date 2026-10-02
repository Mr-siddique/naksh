import type { ReactTestInstance } from 'react-test-renderer';

export const isHost = (node: ReactTestInstance, name: string): boolean =>
  (node.type as unknown) === name;

export function findPressable(
  root: ReactTestInstance,
  label: string,
): ReactTestInstance {
  return root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );
}

export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
};

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
