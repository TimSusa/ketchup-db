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

  return findInObject(
    data,
    search,
    findBy,
    [],
    [],
    stopOnFirstMatch,
    matchPartial
  );
}

function findInObject(
  obj: unknown,
  search: SearchTerm,
  findBy: "key" | "value",
  results: SearchResult[] = [],
  path: string[] = [],
  stopOnFirstMatch: boolean,
  matchPartial: boolean
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
      results,
      [...path, `${i}`],
      stopOnFirstMatch,
      matchPartial
    );
    if (stopOnFirstMatch && nestedResults.length > 0) {
      return nestedResults;
    }
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
  for (const key in obj) {
    const currentPath = [...path, key];
    const currentValue = obj[key as keyof typeof obj];

    if (isMatch(key, currentValue, search, findBy, matchPartial)) {
      results.push({ path: currentPath, value: currentValue });
      if (stopOnFirstMatch) {
        return results;
      }
    }

    const nestedResults = findInObject(
      currentValue,
      search,
      findBy,
      results,
      currentPath,
      stopOnFirstMatch,
      matchPartial
    );
    if (stopOnFirstMatch && nestedResults.length > 0) {
      return nestedResults;
    }
  }
  return results;
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

function isPartialMatch(target: string, search: SearchTerm): boolean {
  if (search instanceof RegExp) {
    return search.test(target);
  }

  const searchStr = String(search);
  return target.toLowerCase().includes(searchStr.toLowerCase());
}

export async function readItemsFromFile<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return [];
    }
    throw error;
  }
}
