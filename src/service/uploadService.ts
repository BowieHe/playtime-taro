import Taro from "@tarojs/taro";
import { getBaseUrl } from "./request";

interface UploadParams {
    filePath: string;
    name: string;
    formData?: Record<string, any>;
    header?: Record<string, any>;
}

interface UploadResult {
    fileUrl: string;
    fileId?: string;
    status: "success" | "fail";
    message?: string;
}

/**
 * Upload a file to the server
 * @param params Upload parameters
 * @returns Promise with the upload result
 */
export const uploadFile = (params: UploadParams): Promise<UploadResult> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/upload`; // Adjust this endpoint to your API

    return new Promise((resolve, reject) => {
        Taro.uploadFile({
            url,
            filePath: params.filePath,
            name: params.name,
            formData: params.formData || {},
            header: {
                ...params.header,
                "Content-Type": "multipart/form-data",
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    try {
                        // Parse the response data
                        const data = JSON.parse(res.data);
                        if (data.code === 0) {
                            resolve({
                                fileUrl: data.data.url,
                                fileId: data.data.id,
                                status: "success",
                            });
                        } else {
                            reject({
                                status: "fail",
                                message: data.message || "Upload failed",
                            });
                        }
                    } catch (e) {
                        reject({
                            status: "fail",
                            message: "Failed to parse server response",
                        });
                    }
                } else {
                    reject({
                        status: "fail",
                        message: `Server returned status ${res.statusCode}`,
                    });
                }
            },
            fail: (err) => {
                reject({
                    status: "fail",
                    message: err.errMsg || "Upload failed",
                });
            },
        });
    });
};
