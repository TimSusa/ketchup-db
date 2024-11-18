import type { User } from "../types/user.ts";

export const userData: User[] = [
  {
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
  },
];
