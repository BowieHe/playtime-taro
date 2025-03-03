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

// Example function to get directions between two points
export const getDirections = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  try {
    const response = await Taro.request({
      url: "https://your-backend-api.com/map/directions",
      method: "GET",
      data: {
        fromLat: from.latitude,
        fromLng: from.longitude,
        toLat: to.latitude,
        toLng: to.longitude,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get directions:", error);
    throw error;
  }
};
