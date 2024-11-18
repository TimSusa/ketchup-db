export type SearchResult = {
  path: string[];
  value: unknown;
};

export type SearchTerm = string | number | RegExp;

export type SearchOptions = {
  findBy?: "key" | "value";
  matchPartial?: boolean;
  stopOnFirstMatch?: boolean;
  predicate?: (value: unknown, path: string[]) => boolean;
};
