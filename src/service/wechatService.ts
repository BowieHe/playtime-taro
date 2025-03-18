import { PhoneInfo, PhoneResponse } from "src/types/wechat";
import { LoginRes } from "src/types/wechat";
import { getRequest, postRequest } from "@/utils/httpRequest";
import Taro from "@tarojs/taro";

export const getLoginSession = async (code: string): Promise<LoginRes> => {
  try {
    const data = await getRequest<LoginRes>(`wechat/login?code=${code}`);

    console.log("User session response:", data);
    return data;
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

export const login = async () => {
  const loginRes = await Taro.login({
    complete: (res: TaroGeneral.CallbackResult) => {
      console.log("Login complete response:", res);
    },
    success: (res: TaroGeneral.CallbackResult) => {
      console.log("Login successful", res);
    },
    fail: (res: TaroGeneral.CallbackResult) => {
      console.error("Login failed with error:", res);
    },
    timeout: 10000,
  });

  const sessionRes = await getLoginSession(loginRes.code);
  console.log("Session response:", sessionRes);
};
