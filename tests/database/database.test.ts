import { assertEquals, assertRejects } from "../test_deps.ts";
import { createDb } from "../../src/database/database.ts";
import { createValidator } from "../../src/types/validator.ts";

export type TestItem = {
  id: number;
  name: string;
  nested?: {
    value: string;
    items: Array<{ id: number; text: string }>;
  };
};

export function createTestDb(filePath: string) {
  const testValidator = createValidator<TestItem>(["id", "name"]);
  return createDb<TestItem>({
    _filePath: filePath,
    validateItem: testValidator,
  });
}

Deno.test({
  name: "Database Operations",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn(t) {
    const tempFilePath = await Deno.makeTempFile();
    const db = createTestDb(tempFilePath);

    try {
      // Basic Operations
      await t.step("should add single item", async () => {
        await db.addItem({ id: 1, name: "test" });
        const items = db.getAllItems();
        assertEquals(items.length, 1);
        assertEquals(items[0], { id: 1, name: "test" });
      });

      await t.step("should add multiple items", async () => {
        await db.addItems([
          { id: 2, name: "test2" },
          { id: 3, name: "test3" },
        ]);
        assertEquals(db.getAllItems().length, 3);
      });

      // Validation Tests
      await t.step("should reject invalid items", async () => {
        await assertRejects(
          async () => {
            await db.addItem({ id: 1 } as TestItem);
          },
          Error,
          "Invalid item"
        );
      });

      await t.step("should filter invalid items in batch", async () => {
        await db.addItems([
          { id: 1, name: "valid" },
          { id: 2 } as TestItem, // invalid
          { id: 3, name: "valid2" },
        ]);
        assertEquals(db.getAllItems().length, 2);
      });

      // Search Operations
      await t.step("should perform deep search", async () => {
        const testData: TestItem = {
          id: 1,
          name: "test",
          nested: {
            value: "searchable",
            items: [
              { id: 1, text: "findme" },
              { id: 2, text: "findmetoo" },
            ],
          },
        };

        await db.addItem(testData);

        const results = db.deepSearch(
          (item) =>
            item.nested?.items.some((i) => i.text.includes("find")) ?? false
        );

        assertEquals(results.size, 1);
      });

      await t.step("should search by path", async () => {
        const results = db.searchByPath("findme", {
          matchPartial: true,
          findBy: "value",
        });

        assertEquals(results.length, 2);
      });

      await t.step("should respect search options", async () => {
        const results = db.searchByPath("findme", {
          stopOnFirstMatch: true,
          matchPartial: true,
        });

        assertEquals(results.length, 1);
      });

      // Bulk Operations
      await t.step("should handle bulk load/save", async () => {
        await db.addItems([
          { id: 1, name: "bulk1" },
          { id: 2, name: "bulk2" },
          { id: 3, name: "bulk3" },
        ]);

        await db.saveBatch();

        const newDb = createTestDb(tempFilePath);
        await newDb.loadBatch();

        assertEquals(newDb.getAllItems().length, 3);
      });

      await t.step("should handle empty database", async () => {
        const emptyDb = createTestDb(tempFilePath + "_empty");
        await emptyDb.loadBatch();
        assertEquals(emptyDb.getAllItems().length, 0);
        await Deno.remove(tempFilePath + "_empty");
      });

      // Concurrency Tests
      await t.step("should handle concurrent writes", async () => {
        const numberOfOperations = 100;
        const concurrentWrites = Array.from(
          { length: numberOfOperations },
          (_, i) => ({
            id: i,
            name: `concurrent-${i}`,
          })
        );

        // Wait for all writes to complete before proceeding
        await Promise.all(concurrentWrites.map((item) => db.addItem(item)));
        await db.saveBatch(); // Ensure all writes are saved

        // Verify results
        const items = db.getAllItems();
        assertEquals(items.length, numberOfOperations);

        const uniqueIds = new Set(items.map((item) => item.id));
        assertEquals(uniqueIds.size, numberOfOperations);

        for (const item of items) {
          assertEquals(item.name, `concurrent-${item.id}`);
        }
      });

      await t.step("should handle concurrent batch operations", async () => {
        // Create new instances with unique file paths
        const tempFile1 = await Deno.makeTempFile();
        const tempFile2 = await Deno.makeTempFile();
        const db1 = createTestDb(tempFile1);
        const db2 = createTestDb(tempFile2);

        try {
          // Perform operations on separate files
          await Promise.all([
            db1.addItems([
              { id: 1000, name: "batch1-1" },
              { id: 1001, name: "batch1-2" },
            ]),
            db2.addItems([
              { id: 2000, name: "batch2-1" },
              { id: 2001, name: "batch2-2" },
            ]),
          ]);

          await Promise.all([db1.saveBatch(), db2.saveBatch()]);

          // Merge results into final DB
          const finalDb = createTestDb(tempFilePath);
          await finalDb.loadBatch();
          const finalItems = finalDb.getAllItems();

          // Should contain items from both batches
          assertEquals(finalItems.filter((item) => item.id >= 1000).length, 4);
        } finally {
          await Deno.remove(tempFile1);
          await Deno.remove(tempFile2);
        }
      });

      // Concurrent Reads and Writes
      await t.step("should handle concurrent reads and writes", async () => {
        // Setup initial data
        await db.addItems([
          { id: 1, name: "initial-1" },
          { id: 2, name: "initial-2" },
        ]);

        const operations = [];
        for (let i = 0; i < 100; i++) {
          if (i % 2 === 0) {
            operations.push(
              db
                .addItem({ id: i + 100, name: `concurrent-${i}` })
                .then(() => ({ type: "write" as const, id: i + 100 }))
            );
          } else {
            operations.push(
              Promise.resolve({
                type: "read" as const,
                count: db.getAllItems().length,
              })
            );
          }
        }

        const results = await Promise.all(operations);

        // Verify results
        const finalItems = db.getAllItems();
        const writeOps = results.filter((r) => r.type === "write");

        assertEquals(writeOps.length, 50);
        assertEquals(
          new Set(finalItems.map((item) => item.id)).size,
          52 // 2 initial + 50 writes
        );

        const readCounts = results
          .filter(
            (r): r is Extract<(typeof results)[number], { type: "read" }> =>
              r.type === "read"
          )
          .map((r) => r.count);

        readCounts.forEach((count, i) => {
          if (i > 0) {
            assertEquals(
              count >= readCounts[i - 1],
              true,
              `Read operation ${i} saw fewer items than previous read`
            );
          }
        });

        // Force cleanup and wait for it
        await db.saveBatch();
      });
    } finally {
      await Deno.remove(tempFilePath);
    }
  },
});
