import type { User } from "./types/user.ts";
import { findInData } from "./utils/find.ts";

const userData: User = {
  id: 1,
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Wonderland",
    zip: "12345",
  },
  friends: [
    {
      id: 2,
      name: "Bob",
      address: {
        street: "456 Elm St",
        city: "Wonderland",
        zip: "12345",
      },
      friends: [],
    },
  ],
};

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
