export type Validator<T> = (item: unknown) => item is T;

export function createValidator<T>(keys: (keyof T)[]): Validator<T> {
  return (item: unknown): item is T => {
    if (typeof item !== "object" || item === null) return false;
    return keys.every((key) => key in item);
  };
}
