import type { Validator } from "../types/validator.ts";
import { readItemsFromFile } from "../utils/fileUtils.ts";

export type SetDatabaseOptions<T> = {
  _filePath: string;
  validateItem: Validator<T>;
};

export type SetDatabase<T> = {
  loadBatch: () => Promise<void>;
  saveBatch: () => Promise<void>;
  addItem: (item: T) => void;
  addItems: (items: T[]) => void;
  getAllItems: () => ReadonlyArray<T>;
};

export function createSetDatabase<T>({
  _filePath,
  validateItem,
}: SetDatabaseOptions<T>): SetDatabase<T> {
  const dataSet = new Set<T>();

  async function loadBatch() {
    const loadedItems = await readItemsFromFile(_filePath);
    for (const item of loadedItems) {
      validateItem(item);
      dataSet.add(item as T);
    }
  }

  async function saveBatch() {
    // Implementation to save batch of items
  }

  function addItem(item: T) {
    validateItem(item);
    dataSet.add(item);
  }

  function addItems(items: T[]) {
    for (const item of items) {
      validateItem(item);
    }
    items.forEach((item) => dataSet.add(item));
  }

  function getAllItems(): ReadonlyArray<T> {
    return Array.from(dataSet);
  }

  return {
    loadBatch,
    saveBatch,
    addItem,
    addItems,
    getAllItems,
  };
}
