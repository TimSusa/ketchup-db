import type { Validator } from "./validator.ts";

export type DbOptions<T> = {
  _filePath: string;
  validateItem: Validator<T>;
  autoIndex?: boolean;
};
