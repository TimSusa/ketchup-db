/// <reference lib="deno.ns" />

import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { findInData } from "../../src/utils/find.ts";
import userData from "./../examples/mocks/users.json" assert { type: "json" };

Deno.test("findInData - key search", async (t) => {
  await t.step("should find exact key match", () => {
    const results = findInData(userData, "name");
    assertEquals(results.length, 2);
    assertEquals(results[0].value, "Alice");
    assertEquals(results[1].value, "Bob");
  });
});
