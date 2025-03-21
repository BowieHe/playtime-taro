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

export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] in GeoJSON order
}

// export type LocationCoordinates =
//     | {
//           latitude: number;
//           longitude: number;
//       }
//     | GeoJSONPoint;

export interface PetFriendlyPlaceWithDistance {
    distance: number;
    location: PetFriendlyPlace;
}

export interface PetFriendlyPlace {
    id: string;
    name: string;
    address: string;
    // location: {
    //     latitude: number;
    //     longitude: number;
    // };
    location: GeoJSONPoint;
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
    amenities?: string[];
    photos?: string[];
    createdAt?: string;
    updatedAt?: string;
    distance?: number; // Distance from user's current location
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
