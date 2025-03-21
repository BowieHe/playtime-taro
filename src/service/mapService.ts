import { AddLocationRequest } from '@/types/location';
import { GeocodingResult } from '@/types/map';
import { getRequest, postRequest } from '@/utils/httpRequest';
import Taro from '@tarojs/taro';

// For security reasons, complex map operations that require an API key
// should be processed through your backend server
export const searchNearbyPOI = async (latitude: number, longitude: number, keyword: string) => {
    try {
        // TODO - Replace with your actual backend API URL
        // Instead of exposing API keys in frontend code, make a request to your backend
        const response = await Taro.request({
            url: 'https://your-backend-api.com/map/search',
            method: 'GET',
            data: {
                latitude,
                longitude,
                keyword,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to search for POIs:', error);
        throw error;
    }
};

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
            address_format: null,
            address_component: null,
            ad_info: null,
            formatted_addresses: null,
        };
    }
};

export const addPetFriendlyPlace = async (place: AddLocationRequest) => {
    try {
        console.log('Sending place data to backend:', place);

        // Ensure the full object with adInfo and addressComponent is being sent
        return postRequest('map', place);
    } catch (error) {
        console.error('Failed to add pet-friendly place:', error);
        throw error;
    }
};
