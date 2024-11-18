# Ketchup-DB
Super simple JSON database for Deno in TypeScript, which uses a `Set` to store the items.

### Auto-Generated IDs
Items automatically receive a UUID if no ID is provided. You can focus on your data without worrying about ID management.

```typescript
// Create items without IDs - they'll be auto-generated
await db.addItems([
  { name: "Alice", email: "alice@example.com" },     // ID will be auto-generated
  { name: "Bob", email: "bob@example.com" },         // ID will be auto-generated
  { id: 3, name: "Charlie", email: "charlie@example.com" }  // Uses provided ID
]);
```

### Loading Multiple Items
Reads multiple items from a JSON file at once and adds them to the `Set`. All items are validated before being added in a single operation.

### Bulk Saving
Writes all items in the `Set` to the JSON file in one operation, making it more efficient than individual saves.

### Implementation with Bulk Operations

```typescript
// Create an initializer object for User (no need to define User type separately)
const userInitializer = { name: "", email: "" };  // Note: no id required!

// Derive the User type from the initializer
type User = typeof userInitializer;  // Automatically infers the User type

// Automatically extract the keys from the initializer
const userKeys = Object.keys(userInitializer) as (keyof User)[];

// Create a validator using the extracted keys
const validateUser: Validator<User> = (item: any): item is User =>
  validateItem<User>(item, userKeys);

// Usage example
async function main() {
  const db = createDb<User>({
    _filePath: "users.json",
    validateItem: validateUser
  });

  // Load existing data from file in batch
  await db.loadBatch();
  console.log("Loaded Users:", db.getAllItems());

  // Add new users - IDs are optional!
  await db.addItems([
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" }
  ]);

  console.log("After Adding Users:", db.getAllItems());
  // Output will show auto-generated UUIDs for Alice and Bob

  await db.saveBatch();
}

await main();
```

### Key Features

1. **Efficient Loading**:
   - Loads all items from the JSON file and validates them at once
   - Valid items are added to the `Set` in a single operation

2. **Optimized Saving**:
   - Saves the entire `Set` to the JSON file in one operation
   - Converts the `Set` to an array and serializes to JSON

3. **Bulk Item Addition**:
   - Handles multiple items simultaneously
   - Validates all items before adding to the `Set`
   - Single file write after processing

### Benefits
- **Performance**: Processing multiple items at once is more efficient
- **Reduced File Access**: Minimizes disk operations by combining writes
- **Ease of Use**: Simple API for handling large datasets

### Running the Code
```bash
deno run --allow-read --allow-write your_script.ts
```

These optimizations make your `SetDatabase` class efficient for handling large datasets!

# Deep Search Functionality

The database includes powerful deep search capabilities that can traverse through nested objects, arrays, and recursive structures.

### Example User Data Structure
```typescript
// Example data from users.json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "tel": "+1-555-123-4567",
      "address": "123 Main St",
      "events": [
        {
          "id": 101,
          "title": "Team Meetup",
          "date": "2024-03-20",
          "type": "work"
        },
        {
          "id": 102,
          "title": "Birthday Party",
          "date": "2024-04-15",
          "type": "personal"
        }
      ]
    }
  ]
}
```

### Deep Search Examples

```typescript
// Find users with work events
const workEvents = db.deepSearch(user => 
  user.events.some(event => event.type === "work")
);

// Search through nested event titles
const birthdayEvents = db.deepSearch(user =>
  user.events.some(event => 
    event.title.toLowerCase().includes("birthday")
  )
);

// Complex search combining multiple criteria
const complexSearch = db.deepSearch(user => 
  user.address.includes("Main St") &&
  user.events.some(event => 
    new Date(event.date) > new Date("2024-03-01")
  )
);
```

### Search Capabilities

- **Nested Objects**: Searches through all object properties at any depth
- **Arrays**: Traverses through array elements
- **Type Safe**: Full TypeScript support with type inference
- **Flexible Matching**: Supports custom predicates for complex search conditions
