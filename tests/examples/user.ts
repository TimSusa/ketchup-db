import type { Event } from "./event.ts";

type Address = {
  street: string;
  city: string;
  zip: string;
};

export type User = {
  id: number;
  name: string;
  address: Address;
  events: Event[];
  friends: User[];
};

export const userKeys: (keyof User)[] = [
  "id",
  "name",
  "address",
  "events",
  "friends",
];
