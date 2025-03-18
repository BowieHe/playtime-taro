export interface Pet {
  id?: string;
  ownerId: string;
  name: string;
  gender: PetGender;
  size: PetSize;
  breed: string;
  desc: string;
  avatar: string;
  age: number;
}

export type PetGender = "male" | "female";
export type PetSize = "small" | "medium" | "large";
