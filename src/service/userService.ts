import { User } from "@/types/user";
import { getRequest, postRequest } from "@/utils/httpRequest";
import Taro from "@tarojs/taro";
import { getLoginSession } from "./wechatService";

export const getUserByOpenId = async (openId: string) => {
  try {
    const user = await getRequest<User>(`user/openid/${openId}`);
    return user;
  } catch (error) {
    if (error.message === "User not found") {
      return null;
    }
    console.error("Failed to get user session:", error);
    throw error;
  }
};

export const createUser = async (user: User) => {
  try {
    const response = await postRequest<User>("user", user);
    console.log("User creation response:", response);
    return response;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};

export const validLogin = async () => {
  console.log("Checking user login...");

  try {
    console.log("Attempting to login");
    const loginRes = await Taro.login({
      complete: (res: TaroGeneral.CallbackResult) => {
        console.log("Login complete");
        console.log("Login complete response:", res);
      },
      success: () => {
        console.log("Login successful");
      },
      fail: (res: TaroGeneral.CallbackResult) => {
        console.error("Login failed with error:", res);
        console.error("Login failed");
      },
      timeout: 10000,
    });
    console.log("Login response:", loginRes);

    const sessionRes = await getLoginSession(loginRes.code);
    console.log("Session response:", sessionRes);

    const user = await getUserByOpenId(sessionRes.openid);

    if (user) {
      console.log("User found:", user);
      return user;
    } else {
      return {
        nickName: "",
        avatarUrl: "",
        phoneNumber: "",
        openId: sessionRes.openid,
        unionId: sessionRes.unionid || "",
      } as User;
    }
  } catch (error) {
    Taro.showToast({
      title: "登录失败，请重试",
      icon: "none",
    });
    console.error("Failed to login:", error);
    throw error;
  }
};
