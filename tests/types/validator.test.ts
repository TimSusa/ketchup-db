/// <reference lib="deno.ns" />

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { createValidator } from "../../src/types/validator.ts";

Deno.test("createValidator", async (t) => {
  await t.step("should validate correct object structure", async () => {
    type TestType = { id: number; name: string };
    const validator = createValidator<TestType>(["id", "name"]);

    const validItem = { id: 1, name: "test" };
    const invalidItem = { id: 1 };

    assertEquals(validator(validItem), true);
    assertEquals(validator(invalidItem), false);
  });

  await t.step("should handle null and non-objects", async () => {
    const validator = createValidator<{ id: number }>(["id"]);

    assertEquals(validator(null), false);
    assertEquals(validator(undefined), false);
    assertEquals(validator("string"), false);
  });
});
