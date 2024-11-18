import { findInData } from "../../src/database/utils/find.ts";
import { userData } from "./mocks/userData.ts";
import { assertEquals } from "../test_deps.ts";
import { assertArrayIncludes } from "https://deno.land/std/assert/mod.ts";

Deno.test("findInData examples", async (t) => {
  await t.step("find by title key", () => {
    const result = findInData(userData, "title");
    assertEquals(result.length, 3);
    const titles = result.map((r) => r.value);
    assertArrayIncludes(titles, [
      "Tea Party",
      "Croquet Tournament",
      "Birthday Party",
    ]);
  });

  await t.step("find first Wonderland address", () => {
    const result = findInData(userData, "Mad Hatter", {
      findBy: "value",
      stopOnFirstMatch: true,
      predicate: (_, path) => path.includes("address"),
    });
    assertEquals(result.length, 1);
    assertEquals(result[0].value, "Mad Hatter");
  });

  await t.step("find Mad Hatter references", () => {
    const result = findInData(userData, /Mad Hatter/, {
      findBy: "value",
      matchPartial: true,
    });

    assertEquals(result.length, 2);
    const values = result.map((r) => r.value);
    assertArrayIncludes(values, ["Mad Hatter", "Mad Hatter's House"]);
  });

  await t.step("find event with many attendees", () => {
    const result = findInData(userData, "attendees", {
      findBy: "key",
      predicate: (value) => Array.isArray(value) && value.length > 5,
    });

    assertEquals(result.length, 3);
    assertEquals((result[0].value as unknown[]).length, 6);
  });

  await t.step("find all event locations", () => {
    const result = findInData(userData, "location", {
      findBy: "key",
    });
    assertEquals(result.length, 3);
    const locations = result.map((r) => r.value);
    assertArrayIncludes(locations, [
      "Mad Hatter's House",
      "Queen's Garden",
      "Town Hall",
    ]);
  });

  await t.step("find all 2024 dates", () => {
    const result = findInData(userData, "2024", {
      findBy: "value",
      matchPartial: true,
      predicate: (_, path) => path.includes("date"),
    });
    assertEquals(result.length, 3);
    const dates = result.map((r) => r.value);
    assertArrayIncludes(dates, ["2024-03-15", "2024-03-20", "2024-04-01"]);
  });
});
