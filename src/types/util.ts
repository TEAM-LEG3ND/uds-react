export type First<T> = T extends [infer R, ...args: unknown[]] ? R : never;

export type UnionToIntersection<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (T extends any ? (x: T) => any : never) extends (
    x: infer R
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any
    ? R
    : never;
