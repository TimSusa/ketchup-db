import type { User } from "../types/user.ts";
import { findInData } from "../utils/find.ts";
import { userData } from "../mocks/userData.ts";

// Add type annotation - change to User array
const data: User[] = userData;

// Example of deep nested searches
console.log(
  "Deep search examples:\n",

  // Find all matches containing 'Garden' anywhere in the data structure
  "1. Search for 'Garden' anywhere:",
  findInData(data, "Garden"),
  "\n",

  // Find nested event with partial title match
  "2. Search for partial event title 'Tea':",
  findInData(data, "Tea", { matchPartial: true }),
  "\n",

  // Find nested friend data
  "3. Search in nested friend data for 'Bob':",
  findInData(data, "Bob"),
  "\n",

  // Find by nested address
  "4. Search for address containing 'Elm':",
  findInData(data, "Elm", { matchPartial: true }),
  "\n",

  // Find all items with specific zip code
  "5. Search for zip code '12345':",
  findInData(data, "12345")
);
