/// <reference lib="deno.ns" />

import { assertEquals } from "./test_deps.ts";
import { findInData } from "../src/utils/find.ts";
import { userData } from "./examples/mocks/userData.ts";

Deno.test("findInData - key search", async (t) => {
  await t.step("should find exact key match", () => {
    const results = findInData(userData, "name");
    assertEquals(results.length, 4);
    assertEquals(results[0].value, "Alice");
    assertEquals(results[1].value, "Mad Hatter");
  });
});
