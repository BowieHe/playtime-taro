import { PetSize } from '@/utils/EnumUtil';

export interface Pet {
    id?: string;
    ownerId: string;
    name: string;
    gender: PetGender;
    size: PetSize;
    breed: string;
    character: string;
    avatar: string;
    age: number;
}

export type PetGender = 'male' | 'female';
