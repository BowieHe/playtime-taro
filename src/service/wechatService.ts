import Taro from "@tarojs/taro";
import { PhoneInfo, PhoneResponse } from "src/types/wechat";

// Add http:// or https:// to the base URL
const baseUrl = "http://localhost:8080"; // or https:// if you're using SSL

export const getPhoneNumber = async (code: string): Promise<PhoneInfo> => {
  const url = `${baseUrl}/phone`;

  try {
    const res = await Taro.request({
      url,
      method: "POST",
      data: { code: code },
      header: {
        "content-type": "application/json",
      },
    });
    const data = res.data as PhoneResponse;
    if (data.errCode != 0) {
      throw new Error(data.errMsg);
    }
    return data.phoneInfo as PhoneInfo;
  } catch (error) {
    console.error("Failed to get phone number:", error);
    throw error;
  }
};
