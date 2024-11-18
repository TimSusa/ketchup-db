import type { Validator } from "../types/validator.ts";
import { OperationQueue } from "./queue.ts";

export type SetDatabaseOptions<T> = {
  _filePath: string;
  validateItem: Validator<T>;
};

export type SetDatabase<T> = {
  loadBatch: () => Promise<void>;
  saveBatch: () => Promise<void>;
  addItem: (item: T) => Promise<void>;
  addItems: (items: T[]) => Promise<void>;
  getAllItems: () => ReadonlyArray<T>;
};

export function createSetDatabase<T>({
  _filePath,
  validateItem,
}: SetDatabaseOptions<T>): SetDatabase<T> {
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
      if (validateItem(item)) {
        dataSet.add(item);
        await saveBatch();
      } else {
        console.error("Invalid item:", item);
      }
    });
  }

  async function addItems(items: T[]): Promise<void> {
    await operationQueue.enqueue(async () => {
      const validItems = items.filter((item) => validateItem(item));
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

  return {
    loadBatch,
    saveBatch,
    addItem,
    addItems,
    getAllItems,
  };
}
