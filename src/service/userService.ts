// import Taro from "@tarojs/taro";
// import { BACKEND_URL } from "@/utils/constants";
import { User } from "@/types/user";
import { getRequest, postRequest } from "@/utils/httpRequest";

export const getUserByOpenId = async (openId: string) => {
  try {
    const user = await getRequest<User>(`user/openid/${openId}`);
    return user;
    // const res = await Taro.request({
    //   url: `${BACKEND_URL}/user/openid/${openId}`,
    //   method: "GET",
    // });
    // const data = res.data;
    // console.log("User response:", data);
    // if (data.code != 0) {
    //   throw new Error(data.message);
    // }

    // return data.user as User;
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

    // const res = await Taro.request({
    //   url: `${BACKEND_URL}/user`,
    //   method: "POST",
    //   data: user,
    //   header: {
    //     "content-type": "application/json",
    //   },
    // });
    // const data: User = res.data;
    console.log("User creation response:", response);
    return response;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};
