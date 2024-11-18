export type SearchOptions = {
  findBy?: "key" | "value";
  stopOnFirstMatch?: boolean;
  matchPartial?: boolean;
};

export type SearchResult = {
  path: string[];
  value: unknown;
};

export type SearchTerm = string | number | RegExp;
