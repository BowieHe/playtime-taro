import { PhoneInfo, PhoneResponse } from "src/types/wechat";
import { LoginRes } from "src/types/wechat";
import { getRequest, postRequest, uploadFile } from "@/utils/httpRequest";
import { FileUploadResponse, getContentTypeFromFilePath } from "@/utils/file";

export const getLoginSession = async (code: string): Promise<LoginRes> => {
    try {
        return await getRequest<LoginRes>(`wechat/login?code=${code}`);
    } catch (error) {
        console.error("Failed to get user session:", error);
        throw error;
    }
};

export const getPhoneNumber = async (code: string): Promise<PhoneInfo> => {
    try {
        const phoneResponse = await postRequest<PhoneResponse>("phone", {
            code: code,
        });
        return phoneResponse.phone_info;
        // return {
        //   phoneNumber: "12345678901",
        //   purePhoneNumber: "12345678901",
        //   countryCode: "86",
        //   watermark: {
        //     timestamp: 1620000000,
        //     appid: "wx0000000000000000",
        //   },
        // };
    } catch (error) {
        console.error("Failed to get phone number:", error);
        throw error;
    }
};

export const uploadImage = async (filePath: string): Promise<FileUploadResponse> => {
    try {
        console.log("Uploading avatar image:", filePath);

        const contentType = getContentTypeFromFilePath(filePath);
        const header = {
            "Content-Type": contentType,
        };
        const formData = {
            type: "avatar",
        };
        const response = await uploadFile<FileUploadResponse>(filePath, "file", formData, header);
        return response;

    } catch (error) {
        console.error("Error uploading pet avatar:", error);
        throw new Error("Failed to upload image: " + error.message);
    }
};