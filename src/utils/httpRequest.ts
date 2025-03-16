import Taro from "@tarojs/taro";

const baseUrl = "https://trip.playtime.pet";

export const getRequest = async <T>(uri: string): Promise<T> => {
  try {
    const httpRes = await Taro.request({
      url: `${baseUrl}/${uri}`,
      method: "GET",
    });

    if (httpRes.data.code !== 0) {
      throw new Error(httpRes.data.message);
    }

    const { code, message, ...response } = httpRes.data;
    return response.data as T;
  } catch (error) {
    console.error("Failed to make GET request:", error);
    throw error;
  }
};

export const postRequest = async <T>(uri: string, data: any): Promise<T> => {
  try {
    const httpRes = await Taro.request({
      url: `${baseUrl}/${uri}`,
      method: "POST",
      data,
      header: {
        "content-type": "application/json",
      },
    });

    if (httpRes.data.code !== 0) {
      throw new Error(httpRes.data.message);
    }

    const { code, message, ...response } = httpRes.data;
    return response as T;
  } catch (error) {
    console.error("Failed to make POST request:", error);
    throw error;
  }
};
