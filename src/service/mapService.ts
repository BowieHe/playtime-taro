import {
    AddPlaceRequest,
    PetFriendlyPlace,
    PetFriendlyPlaceWithDistance,
    PlaceSearchParams,
} from '@/types/place';
import { GeocodingResult } from '@/types/map';
import { getRequest, postRequest } from '@/utils/httpRequest';

// Function to handle reverse geocoding through your backend
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<GeocodingResult> => {
    try {
        // This should be replaced with your actual backend API endpoint
        const response = getRequest<GeocodingResult>(
            `/wechat/map/reverseGeocode?lat=${latitude}&lng=${longitude}`
        );
        return response;
    } catch (error) {
        console.error('Failed to reverse geocode:', error);
        // Return a simple default response when geocoding fails
        return {
            address: 'Unknown location',
            location: { lat: latitude, lng: longitude },
            poi_count: 0,
            pois: [],
            address_component: null,
            ad_info: null,
            formatted_addresses: null,
        };
    }
};

export const getNearbyPetFriendlyPlaces = async (
    params: PlaceSearchParams
): Promise<PetFriendlyPlaceWithDistance[]> => {
    try {
        // Create query string from params
        const queryParams = new URLSearchParams();
        queryParams.append('latitude', params.latitude.toString());
        queryParams.append('longitude', params.longitude.toString());

        if (params.radius) queryParams.append('radius', params.radius.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.petSize) queryParams.append('petSize', params.petSize);
        if (params.petType) queryParams.append('petType', params.petType);
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());

        const response = await getRequest<PetFriendlyPlaceWithDistance[]>(
            `/map/search?${queryParams.toString()}`
        );
        if (!response) {
            return [];
        }
        console.log('get nearby pet friendly places response', response);
        return response;
    } catch (error) {
        console.error('Failed to get nearby pet-friendly places:', error);
        throw error;
    }
};
