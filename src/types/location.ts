import { AddressComponent, AdInfo } from './map';

export interface AddLocationRequest {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    adInfo: AdInfo | null;
    addressComponent: AddressComponent | null;
    isPetFriendly: boolean;
    petSize: string;
    petType: string;
    zone: string;
    description: string;
    category: string; // Add category field
}

// Define location categories
export enum LocationCategory {
    RESTAURANT = 'restaurant',
    PARK = 'park',
    CAFE = 'cafe',
    PET_STORE = 'pet_store',
    VET = 'vet',
    HOTEL = 'hotel',
    OTHER = 'other',
}

export const CategoryDisplayNames = {
    [LocationCategory.RESTAURANT]: 'Restaurant',
    [LocationCategory.PARK]: 'Park',
    [LocationCategory.CAFE]: 'Cafe',
    [LocationCategory.PET_STORE]: 'Pet Store',
    [LocationCategory.VET]: 'Veterinarian',
    [LocationCategory.HOTEL]: 'Hotel',
    [LocationCategory.OTHER]: 'Other',
};
