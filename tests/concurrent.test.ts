/// <reference lib="deno.ns" />

import { assertEquals } from "./test_deps.ts";
import { createTestDb } from "./database/database.test.ts";

// Add this type definition before the test
type TestItem = {
  id: number;
  name: string;
};

// Make the test synchronous at the top level
Deno.test({
  name: "Database - Concurrent Operations",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t: Deno.TestContext) => {
    const tempFilePath = await Deno.makeTempFile();
    const db = createTestDb(tempFilePath);

    try {
      await t.step("should handle concurrent reads and writes", async () => {
        // Setup initial data
        await db.addItems([
          { id: 1, name: "initial-1" },
          { id: 2, name: "initial-2" },
        ]);

        // Create and execute operations sequentially in chunks
        type OperationResult =
          | { type: "write"; id: number }
          | { type: "read"; count: number };

        const results: OperationResult[] = [];
        const chunkSize = 10;

        for (let i = 0; i < 100; i += chunkSize) {
          const chunk = Array.from(
            { length: Math.min(chunkSize, 100 - i) },
            async (_, j) => {
              const index = i + j;
              if (index % 2 === 0) {
                await db.addItem({
                  id: index + 100,
                  name: `concurrent-${index}`,
                });
                return { type: "write" as const, id: index + 100 };
              }
              const items = db.getAllItems();
              return { type: "read" as const, count: items.length };
            }
          );

          const chunkResults = await Promise.all(chunk);
          results.push(...chunkResults);
          await db.saveBatch(); // Save after each chunk
        }

        // Verify results
        const finalItems = db.getAllItems();
        const writeOps = results.filter((r) => r.type === "write");

        assertEquals(writeOps.length, 50);
        assertEquals(
          new Set(finalItems.map((item: TestItem) => item.id)).size,
          52 // 2 initial + 50 writes
        );

        const readCounts = results
          .filter(
            (r): r is Extract<(typeof results)[number], { type: "read" }> =>
              r.type === "read"
          )
          .map((r) => r.count);

        for (let i = 1; i < readCounts.length; i++) {
          assertEquals(
            readCounts[i] >= readCounts[i - 1],
            true,
            `Read operation ${i} saw fewer items than previous read`
          );
        }
      });
    } finally {
      // Ensure cleanup happens
      try {
        await db.saveBatch();
      } finally {
        await Deno.remove(tempFilePath);
      }
    }
  },
});
