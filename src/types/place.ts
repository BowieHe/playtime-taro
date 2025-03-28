import { AddressComponent, AdInfo } from './map';

export interface AddPlaceRequest {
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
export enum PlaceCategory {
    RESTAURANT = 'restaurant',
    PARK = 'park',
    CAFE = 'cafe',
    PET_STORE = 'pet_store',
    MALL = 'mall',
    HOTEL = 'hotel',
    OTHER = 'other',
}

export const CategoryDisplayNames = {
    [PlaceCategory.RESTAURANT]: 'Restaurant',
    [PlaceCategory.PARK]: 'Park',
    [PlaceCategory.CAFE]: 'Cafe',
    [PlaceCategory.PET_STORE]: 'Pet Store',
    [PlaceCategory.MALL]: 'Shopping Mall',
    [PlaceCategory.HOTEL]: 'Hotel',
    [PlaceCategory.OTHER]: 'Other',
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
    category: PlaceCategory;
    rating?: number;
    reviews?: number;
    facilities: Facilities;
    photos?: string[];
    createdAt?: string;
    updatedAt?: string;
    distance?: number; // Distance from user's current location
}

interface Facilities {
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
    category?: PlaceCategory;
    petSize?: string;
    petType?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
}

export interface Review {
    placeId: string;
    userId: string;
    username: string;
    userAvatar: string;
    content: string;
    rating: number;
    date: Date;
}
