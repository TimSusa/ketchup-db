import type {
  SearchOptions,
  SearchResult,
  SearchTerm,
} from "../types/search.ts";

export function findInData(
  data: unknown,
  search: SearchTerm,
  options: SearchOptions = {}
): SearchResult[] {
  const {
    findBy = "key",
    stopOnFirstMatch = false,
    matchPartial = false,
  } = options;

  return findInObject(data, search, findBy, stopOnFirstMatch, matchPartial);

  function findInObject(
    obj: unknown,
    search: SearchTerm,
    findBy: "key" | "value",
    stopOnFirstMatch: boolean,
    matchPartial: boolean,
    path: string[] = [],
    results: SearchResult[] = []
  ): SearchResult[] {
    if (!obj || typeof obj !== "object") {
      return results;
    }

    if (Array.isArray(obj)) {
      return handleArray(
        obj,
        search,
        findBy,
        results,
        path,
        stopOnFirstMatch,
        matchPartial
      );
    }

    return handleObject(
      obj,
      search,
      findBy,
      results,
      path,
      stopOnFirstMatch,
      matchPartial
    );
  }

  function handleArray(
    arr: unknown[],
    search: SearchTerm,
    findBy: "key" | "value",
    results: SearchResult[],
    path: string[],
    stopOnFirstMatch: boolean,
    matchPartial: boolean
  ): SearchResult[] {
    for (let i = 0; i < arr.length; i++) {
      const nestedResults = findInObject(
        arr[i],
        search,
        findBy,
        stopOnFirstMatch,
        matchPartial,
        [...path, `${i}`],
        results
      );
      if (stopOnFirstMatch && nestedResults.length > results.length) {
        return nestedResults;
      }
      results = nestedResults;
    }
    return results;
  }

  function handleObject(
    obj: object,
    search: SearchTerm,
    findBy: "key" | "value",
    results: SearchResult[],
    path: string[],
    stopOnFirstMatch: boolean,
    matchPartial: boolean
  ): SearchResult[] {
    const newResults = [...results];

    for (const key in obj) {
      const currentPath = [...path, key];
      const currentValue = obj[key as keyof typeof obj];

      if (isMatch(key, currentValue, search, findBy, matchPartial)) {
        newResults.push({ path: currentPath, value: currentValue });
        if (stopOnFirstMatch) {
          return newResults;
        }
      }

      const nestedResults = findInObject(
        currentValue,
        search,
        findBy,
        stopOnFirstMatch,
        matchPartial,
        currentPath,
        newResults
      );
      if (stopOnFirstMatch && nestedResults.length > results.length) {
        return nestedResults;
      }
      return nestedResults;
    }
    return newResults;
  }

  function isMatch(
    key: string,
    value: unknown,
    search: SearchTerm,
    findBy: "key" | "value",
    matchPartial: boolean
  ): boolean {
    if (findBy === "key") {
      return matchPartial ? isPartialMatch(key, search) : key === search;
    }

    if (typeof value === "string" || typeof value === "number") {
      return matchPartial
        ? isPartialMatch(String(value), search)
        : value === search;
    }

    return false;
  }
}

function isPartialMatch(target: string, search: SearchTerm): boolean {
  if (search instanceof RegExp) {
    return search.test(target);
  }

  return false;
}
