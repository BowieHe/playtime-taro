// import { BACKEND_URL } from "@/utils/constants";
// import Taro from "@tarojs/taro";
import { PhoneInfo, PhoneResponse } from "src/types/wechat";
import { LoginRes } from "src/types/wechat";
import { getRequest, postRequest } from "@/utils/httpRequest";

// Add http:// or https:// to the base URL

export const getLoginSession = async (code: string): Promise<LoginRes> => {
  // TODO delete
  // return {
  //   errcode: 0,
  //   errmsg: "",
  //   session_key: "4Yk949PCy9rYuFHkajLGxg==",
  //   openid: "ollLS5AfSB0-eMwENlfGcp5XcejU",
  //   unionid: "ojpHh6qv3jdyZYwhisa080lG8s40",
  // };
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
    // const res = await Taro.request({
    //   url,
    //   method: "POST",
    //   data: { code: code },
    //   header: {
    //     "content-type": "application/json",
    //   },
    // });
    // const data = res.data as PhoneResponse;
    // console.log("Phone number response:", data);
    // if (data.errcode != 0) {
    //   throw new Error(data.errmsg);
    // }
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
