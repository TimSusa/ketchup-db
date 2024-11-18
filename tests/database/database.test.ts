import { assertEquals, assertRejects } from "../test_deps.ts";
import { createDb } from "../../src/database/database.ts";
import { createValidator } from "../../src/types/validator.ts";

type TestItem = {
  id: number;
  name: string;
  nested?: {
    value: string;
    items: Array<{ id: number; text: string }>;
  };
};

function createTestDb(filePath: string) {
  const testValidator = createValidator<TestItem>(["id", "name"]);
  return createDb<TestItem>({
    _filePath: filePath,
    validateItem: testValidator,
  });
}

Deno.test("Database - Basic Operations", async (t) => {
  const tempFilePath = await Deno.makeTempFile();
  const db = createTestDb(tempFilePath);

  try {
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

    await t.step("should persist data", async () => {
      await db.saveBatch();
      const newDb = createTestDb(tempFilePath);
      await newDb.loadBatch();
      assertEquals(newDb.getAllItems().length, 3);
    });
  } finally {
    await Deno.remove(tempFilePath);
  }
});

Deno.test("Database - Validation", async (t) => {
  const tempFilePath = await Deno.makeTempFile();
  const db = createTestDb(tempFilePath);

  try {
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
  } finally {
    await Deno.remove(tempFilePath);
  }
});

Deno.test("Database - Search Operations", async (t) => {
  const tempFilePath = await Deno.makeTempFile();
  const db = createTestDb(tempFilePath);

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

  try {
    await t.step("should perform deep search", async () => {
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
  } finally {
    await Deno.remove(tempFilePath);
  }
});

Deno.test("Database - Bulk Operations", async (t) => {
  const tempFilePath = await Deno.makeTempFile();
  const db = createTestDb(tempFilePath);

  try {
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
  } finally {
    await Deno.remove(tempFilePath);
  }
});
