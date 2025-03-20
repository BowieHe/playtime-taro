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
        return response.data as T;
    } catch (error) {
        console.error("Failed to make POST request:", error);
        throw error;
    }
};

export const putRequest = async <T>(uri: string, data: any): Promise<T> => {
    try {
        const httpRes = await Taro.request({
            url: `${baseUrl}/${uri}`,
            method: "PUT",
            data,
            header: {
                "content-type": "application/json",
            },
        });

        if (httpRes.data.code !== 0) {
            throw new Error(httpRes.data.message);
        }

        const { code, message, ...response } = httpRes.data;
        return response.data as T;
    } catch (error) {
        console.error("Failed to make PUT request:", error);
        throw error;
    }
};

export const deleteRequest = async <T>(uri: string): Promise<T> => {
    try {
        const httpRes = await Taro.request({
            url: `${baseUrl}/${uri}`,
            method: "DELETE",
        });

        if (httpRes.data.code !== 0) {
            throw new Error(httpRes.data.message);
        }

        const { code, message, ...response } = httpRes.data;
        return response.data as T;
    } catch (error) {
        console.error("Failed to make DELETE request:", error);
        throw error;
    }
};

export const uploadFile = async<T>(filePath: string, name: string, formData?: Record<string, any>, header?: Record<string, any>): Promise<T> => {

    // Upload file using Taro's upload file API
    const uploadResponse = await Taro.uploadFile({
        url: `${baseUrl}/wechat/upload`,
        filePath: filePath,
        name: name,
        header: header,
        formData: formData
    });

    if (uploadResponse.statusCode !== 200) {
        throw new Error(
            `Upload failed with status code ${uploadResponse.statusCode}`
        );
    }

    // Parse response to get the image URL
    const result = JSON.parse(uploadResponse.data);

    if (result.code !== 0) {
        throw new Error(result.message || "Failed to upload image");
    }

    console.log("Avatar uploaded successfully:", result.data);
    return result.data as T;

}