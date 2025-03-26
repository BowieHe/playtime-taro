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
    MALL = 'mall',
    HOTEL = 'hotel',
    OTHER = 'other',
}

export const CategoryDisplayNames = {
    [LocationCategory.RESTAURANT]: 'Restaurant',
    [LocationCategory.PARK]: 'Park',
    [LocationCategory.CAFE]: 'Cafe',
    [LocationCategory.PET_STORE]: 'Pet Store',
    [LocationCategory.MALL]: 'Shopping Mall',
    [LocationCategory.HOTEL]: 'Hotel',
    [LocationCategory.OTHER]: 'Other',
};

export interface PetFriendlyPlaceWithDistance {
    distance: number;
    location: PetFriendlyPlace;
}

// todo)) add operation hours
export interface PetFriendlyPlace {
    id: string;
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
    category: LocationCategory;
    rating?: number;
    reviews?: number;
    facilities: facilities;
    photos?: string[];
    createdAt?: string;
    updatedAt?: string;
    distance?: number; // Distance from user's current location
}

interface facilities {
    wifi: boolean;
    parking: boolean;
    petSnacks: boolean;
    PetToys: boolean;
    PetToilet: boolean;
}

export interface PlaceSearchParams {
    latitude: number;
    longitude: number;
    radius?: number;
    category?: LocationCategory;
    petSize?: string;
    petType?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
}

export interface Review {
    title: string;
    content: string;
    username: string;
    userAvatar: string;
    date: Date;
    rating: number;
}
