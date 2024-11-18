import { findInData } from "../../src/database/utils/find.ts";
import { userData } from "./mocks/userData.ts";

// Examples
console.log(
  "Partial key match:",
  findInData(userData, "ad", { matchPartial: true })
);

console.log(
  "First value match only:",
  findInData(userData, "Wonderland", {
    findBy: "value",
    stopOnFirstMatch: true,
  })
);

console.log(
  "Regex search:",
  findInData(userData, /^na/, {
    findBy: "key",
    matchPartial: true,
  })
);

// Examples of deep nested property searches
console.log(
  "Find all events with more than 5 attendees:",
  findInData(userData, 5, {
    findBy: "value",
    matchPartial: false,
    predicate: (value) => typeof value === "number" && value > 5,
  })
);

console.log(
  "Find all locations in events:",
  findInData(userData, "location", {
    findBy: "key",
    matchPartial: false,
  })
);

console.log(
  "Find friends in Wonderland:",
  findInData(userData, "Wonderland", {
    findBy: "value",
    matchPartial: false,
    predicate: (_, path) => path.includes("friends"),
  })
);

console.log(
  "Find all dates in events:",
  findInData(userData, "2024", {
    findBy: "value",
    matchPartial: true,
  })
);
