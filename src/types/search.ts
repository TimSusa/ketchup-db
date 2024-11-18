/** Represents a search result with path to the found item and its value */
export type SearchResult = {
  path: string[];
  value: unknown;
};

/** Valid search term types */
export type SearchTerm = string | number | RegExp;

/** Configuration options for search operations */
export type SearchOptions = {
  findBy?: "key" | "value";
  matchPartial?: boolean;
  stopOnFirstMatch?: boolean;
  predicate?: (value: unknown, path: string[]) => boolean;
};
