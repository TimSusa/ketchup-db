import type { User } from "../src/types/database.ts";
import { findInData } from "../src/utils/find.ts";
import { userData } from "./examples/mocks/userData.ts";

const data: User[] = userData;

console.log(
  "Deep search examples:\n",

  "1. Search for 'Garden' anywhere:",
  findInData(data, "Garden"),
  "\n",

  "2. Search for partial event title 'Tea':",
  findInData(data, "Tea", { matchPartial: true }),
  "\n",

  "3. Search in nested friend data for 'Bob':",
  findInData(data, "Bob"),
  "\n",

  "4. Search for address containing 'Elm':",
  findInData(data, "Elm", { matchPartial: true }),
  "\n",

  "5. Search for zip code '12345':",
  findInData(data, "12345")
);
