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
  events: [
    {
      id: 1,
      title: "Tea Party",
      date: "2024-03-20",
      location: "Garden",
      attendees: 5,
    },
    {
      id: 2,
      title: "Croquet Game",
      date: "2024-03-21",
      location: "Palace Grounds",
      attendees: 8,
    },
  ],
  friends: [
    {
      id: 2,
      name: "Bob",
      address: {
        street: "456 Elm St",
        city: "Wonderland",
        zip: "12345",
      },
      events: [],
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
