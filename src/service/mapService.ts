import { SearchResult } from "@/types/map";
import { getRequest } from "@/utils/httpRequest";
import Taro from "@tarojs/taro";

// For security reasons, complex map operations that require an API key
// should be processed through your backend server
export const searchNearbyPOI = async (
  latitude: number,
  longitude: number,
  keyword: string
) => {
  try {
    // TODO - Replace with your actual backend API URL
    // Instead of exposing API keys in frontend code, make a request to your backend
    const response = await Taro.request({
      url: "https://your-backend-api.com/map/search",
      method: "GET",
      data: {
        latitude,
        longitude,
        keyword,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to search for POIs:", error);
    throw error;
  }
};

// Function to handle reverse geocoding through your backend
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{
  address: string;
  name: string;
}> => {
  try {
    // This should be replaced with your actual backend API endpoint
    const response = await Taro.request({
      url: "https://your-backend-api.com/map/geocode/reverse",
      method: "GET",
      data: {
        latitude,
        longitude,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to reverse geocode:", error);
    // Return a simple default response when geocoding fails
    return {
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      name: "New Location",
    };
  }
};
