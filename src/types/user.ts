type Address = {
  street: string;
  city: string;
  zip: string;
};

export type User = {
  id: number;
  name: string;
  address: Address;
  friends: User[];
};

export const userKeys: (keyof User)[] = ["id", "name", "address", "friends"];
