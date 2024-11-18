# Ketchup-DB
Super simple JSON database for Deno in TypeScript.

### Batch Loading
Batch loading will read multiple items from a JSON file at once and add them to the `Set`. It will ensure that all items loaded are validated and then added to the set in one operation.

### Batch Saving
Batch saving will allow us to write all the items in the `Set` to the JSON file in one go, making it more efficient compared to saving individual items.

### Updated Implementation with Batch Operations

```typescript
import { exists } from "https://deno.land/std@0.206.0/fs/exists.ts";

// Generic validator type
type Validator<T> = (item: any) => item is T;

// Generic function to validate an item using its type keys
function validateItem<T>(item: any, keys: (keyof T)[]): item is T {
  return keys.every(key => key in item);
}

// Database class to manage items of type T
class SetDatabase<T> {
  private dataSet: Set<T>;

  constructor(
    private filePath: string,
    private validateItem: Validator<T>
  ) {
    this.dataSet = new Set<T>();
  }

  // Load data from the JSON file in batch
  async loadBatch(): Promise<void> {
    if (await exists(this.filePath)) {
      const fileContent = await Deno.readTextFile(this.filePath);
      const dataArray: any[] = JSON.parse(fileContent);
     
      // Add items in batch after validation
      dataArray.forEach(item => {
        if (this.validateItem(item)) {
          this.dataSet.add(item);
        }
      });
    }
  }

  // Save the Set to the JSON file in batch
  async saveBatch(): Promise<void> {
    const dataArray = Array.from(this.dataSet);
    await Deno.writeTextFile(this.filePath, JSON.stringify(dataArray, null, 2));
  }

  // Add a new item to the Set
  async addItem(item: T): Promise<void> {
    if (this.validateItem(item)) {
      this.dataSet.add(item);
      await this.saveBatch();
    } else {
      console.error("Invalid item:", item);
    }
  }

  // Add multiple items to the Set in a batch
  async addItems(items: T[]): Promise<void> {
    const validItems = items.filter(item => this.validateItem(item));
    if (validItems.length > 0) {
      validItems.forEach(item => this.dataSet.add(item));
      await this.saveBatch();
    } else {
      console.error("No valid items in the batch.");
    }
  }

  // Get all items as a readonly array
  getAllItems(): ReadonlyArray<T> {
    return Array.from(this.dataSet);
  }
}

// Create an initializer object for User (no need to define User type separately)
const userInitializer = { id: 0, name: "", email: "" };

// Derive the User type from the initializer object
type User = typeof userInitializer;  // Automatically infers the User type

// Automatically extract the keys from the initializer
const userKeys = Object.keys(userInitializer) as (keyof User)[];

// Create a validator using the extracted keys
const validateUser: Validator<User> = (item: any): item is User =>
  validateItem<User>(item, userKeys);

// Usage example
async function main() {
  const db = new SetDatabase<User>("users.json", validateUser);

  // Load existing data from file in batch
  await db.loadBatch();
  console.log("Loaded Users:", db.getAllItems());

  // Add new users in a batch
  await db.addItems([
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
    { id: 3, name: "Charlie", email: "charlie@example.com" }
  ]);

  console.log("After Adding Users:", db.getAllItems());

  // Optionally save in batch (after additions)
  await db.saveBatch();
}

await main();
```

### Key Changes

1. **Batch Loading (`loadBatch`)**:
   - The `loadBatch()` function loads all items from the JSON file and validates them in bulk.
   - After validating, each valid item is added to the `Set` in one go.

2. **Batch Saving (`saveBatch`)**:
   - The `saveBatch()` function saves the entire `Set` to the JSON file all at once.
   - We convert the `Set` into an array (`Array.from(this.dataSet)`) and serialize it into JSON.

3. **Batch Adding Items (`addItems`)**:
   - The `addItems()` function takes an array of items and validates them all before adding them to the `Set`.
   - After adding the valid items, it saves the updated `Set` to the file in one batch operation.

### Benefits of Batch Operations
- **Performance**: Loading and saving multiple items at once is much more efficient than doing it individually.
- **Reduced File Access**: Instead of writing to the file every time a new item is added, we can batch all changes and write them at once.
- **Ease of Use**: The API now supports batch adding, which is convenient when dealing with large datasets.

### Running the Code
To run the code in Deno, you can use:

```bash
deno run --allow-read --allow-write your_script.ts
```

With these batch operations in place, your `SetDatabase` class becomes much more efficient for handling large numbers of items!

Sent from my iPad