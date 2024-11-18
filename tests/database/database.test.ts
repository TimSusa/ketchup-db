import { assertEquals } from "../test_deps.ts";
import { createDb } from "../../src/database/database.ts";
import { createValidator } from "../../src/types/validator.ts";

type TestItem = {
  id: number;
  name: string;
};

const testValidator = createValidator<TestItem>(["id", "name"]);

Deno.test("SetDatabase", async (t) => {
  const tempFilePath = await Deno.makeTempFile();
  const db = createDb<TestItem>({
    _filePath: tempFilePath,
    validateItem: testValidator,
  });

  try {
    await t.step("should add and retrieve items", async () => {
      const testItem = { id: 1, name: "test" };
      await db.addItem(testItem);
      await db.saveBatch();
      const items = db.getAllItems();
      assertEquals(items.length, 1);
      assertEquals(items[0], testItem);
    });

    await t.step("should add multiple items", async () => {
      const testItems = [
        { id: 2, name: "test2" },
        { id: 3, name: "test3" },
      ];
      await db.addItems(testItems);
      await db.saveBatch();
      const items = db.getAllItems();
      assertEquals(items.length, 3);
    });
  } finally {
    // Cleanup - Make sure to await the cleanup
    await Deno.remove(tempFilePath).catch(() => {
      // Ignore cleanup errors
    });
  }
});
