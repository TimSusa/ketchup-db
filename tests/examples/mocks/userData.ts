export type User = {
  id: string;
  name: string;
  address?: string;
  friends?: User[];
  events?: {
    title: string;
    date?: string;
    location?: string;
    attendees?: string[];
  }[];
};

export const userData: User[] = [
  {
    id: "1",
    name: "Alice",
    address: "123 Elm Street, Wonderland",
    events: [
      {
        title: "Tea Party",
        date: "2024-03-15",
        location: "Mad Hatter's House",
        attendees: [
          "Mad Hatter",
          "March Hare",
          "Dormouse",
          "White Rabbit",
          "Cheshire Cat",
          "Queen of Hearts",
        ],
      },
      {
        title: "Croquet Tournament",
        date: "2024-03-20",
        location: "Queen's Garden",
        attendees: ["Queen of Hearts", "White Rabbit", "King of Hearts"],
      },
    ],
    friends: [
      { id: "2", name: "Mad Hatter", address: "Tea Party Lane, Wonderland" },
      { id: "3", name: "White Rabbit", address: "Rabbit Hole, Wonderland" },
    ],
  },
  {
    id: "2",
    name: "Bob",
    address: "456 Oak Road",
    events: [
      {
        title: "Birthday Party",
        date: "2024-04-01",
        location: "Town Hall",
        attendees: ["Alice", "Charlie", "David"],
      },
    ],
  },
];
