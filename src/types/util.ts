export type First<T> = T extends [infer R, ...args: unknown[]] ? R : never;
