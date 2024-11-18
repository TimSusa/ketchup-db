import type { Validator } from "./validator.ts";

export type DbOptions<T> = {
  _filePath: string;
  validateItem: Validator<T>;
};

export type User = {
  id: string;
  name: string;
  address?: string;
  friends?: User[];
  events?: { title: string }[];
};

export const userData: User[] = [
  {
    id: "1",
    name: "Alice",
    address: "123 Elm Street",
    events: [{ title: "Tea Party" }],
    friends: [{ id: "2", name: "Bob" }],
  },
];
