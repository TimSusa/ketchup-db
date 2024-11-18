import type { DbOptions } from "../types/database.ts";
import { OperationQueue } from "./queue.ts";
import { v4 as uuid } from "npm:uuid";

type SearchOptions = {
  matchPartial?: boolean;
  findBy?: "key" | "value";
  stopOnFirstMatch?: boolean;
};

export type Db<T> = {
  loadBatch: () => Promise<void>;
  saveBatch: () => Promise<void>;
  addItem: (item: T) => Promise<void>;
  addItems: (items: T[]) => Promise<void>;
  getAllItems: () => ReadonlyArray<T>;
  deepSearch: (predicate: (item: T) => boolean) => Set<T>;
  searchByPath: (searchTerm: string, options?: SearchOptions) => T[];
};

export function createDb<T extends { id?: string | number }>({
  _filePath,
  validateItem,
}: DbOptions<T>): Db<T> {
  const dataSet = new Set<T>();
  const operationQueue = new OperationQueue();

  async function loadBatch(): Promise<void> {
    await operationQueue.enqueue(async () => {
      try {
        const fileContent = await Deno.readTextFile(_filePath);
        const loadedItems: unknown[] = JSON.parse(fileContent);

        for (const item of loadedItems) {
          if (validateItem(item)) {
            dataSet.add(item);
          }
        }
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    });
  }

  async function saveBatch(): Promise<void> {
    await operationQueue.enqueue(async () => {
      const dataArray = Array.from(dataSet);
      await Deno.writeTextFile(_filePath, JSON.stringify(dataArray, null, 2));
    });
  }

  async function addItem(item: T): Promise<void> {
    await operationQueue.enqueue(async () => {
      const itemWithId = { ...item, id: item.id ?? String(uuid()) };
      if (validateItem(itemWithId)) {
        dataSet.add(itemWithId);
        await saveBatch();
      } else {
        console.error("Invalid item:", itemWithId);
      }
    });
  }

  async function addItems(items: T[]): Promise<void> {
    await operationQueue.enqueue(async () => {
      const itemsWithIds = items.map((item) => ({
        ...item,
        id: item.id ?? String(uuid()),
      }));
      const validItems = itemsWithIds.filter((item) => validateItem(item));
      if (validItems.length > 0) {
        validItems.forEach((item) => dataSet.add(item));
        await saveBatch();
      } else {
        console.error("No valid items in the batch.");
      }
    });
  }

  function getAllItems(): ReadonlyArray<T> {
    return Array.from(dataSet);
  }

  function deepSearch(predicate: (item: T) => boolean): Set<T> {
    const results = new Set<T>();
    for (const item of dataSet) {
      if (predicate(item)) {
        results.add(item);
      }
    }
    return results;
  }

  function searchByPath(searchTerm: string, options?: SearchOptions): T[] {
    const matches: T[] = [];
    const items = getAllItems();

    for (const item of items) {
      if (deepSearchObject(item, searchTerm, options)) {
        matches.push(item);
        if (options?.stopOnFirstMatch) break;
      }
    }

    return matches;
  }

  return {
    loadBatch,
    saveBatch,
    addItem,
    addItems,
    getAllItems,
    deepSearch,
    searchByPath,
  };
}

function deepSearchObject(
  obj: unknown,
  searchTerm: string,
  options?: SearchOptions
): boolean {
  if (!obj || typeof obj !== "object") return false;

  for (const [key, value] of Object.entries(obj)) {
    if (options?.findBy === "key" && key.includes(searchTerm)) return true;
    if (
      options?.findBy === "value" &&
      typeof value === "string" &&
      (options.matchPartial ? value.includes(searchTerm) : value === searchTerm)
    )
      return true;
    if (
      typeof value === "object" &&
      deepSearchObject(value, searchTerm, options)
    )
      return true;
  }

  return false;
}
