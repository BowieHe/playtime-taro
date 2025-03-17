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
    // Show loading indicator while we check the login status
    // Taro.showLoading({ title: "登录中..." });

    const loginRes = await Taro.login();
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

    // Store these values in the user store regardless of what happens next
    // this.props.store.userStore.setWechatId(
    //   sessionRes.openid,
    //   sessionRes.unionid || ""
    // );

    /*
    try {
      const user = await getUserByOpenId(sessionRes.openid);

      if (user) {
        console.log("User found:", user);
        Taro.hideLoading();
        Taro.showToast({
          title: "Welcome back",
          icon: "success",
        });
        this.props.store.userStore.setUser(user);
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.log("User not found, need to create profile");
      Taro.hideLoading();

      console.log("Attempting to navigate to user create page");

      try {
        Taro.navigateTo({
          url: `/pages/userCreate/index?openId=${sessionRes.openid}&unionId=${
            sessionRes.unionid || ""
          }`,
          success: () => {
            console.log("Navigation successful");
          },
          fail: (err) => {
            console.error("Navigation failed:", err);

            Taro.redirectTo({
              url: "/pages/userCreate/index",
              success: () => {
                console.log("Redirect successful");
              },
              fail: (err2) => {
                console.error("Redirect also failed:", err2);
                Taro.showToast({
                  title: "页面跳转失败，请重试",
                  icon: "none",
                });
              },
            });
          },
        });
      } catch (navError) {
        console.error("Navigation error:", navError);
      }
    }
  } catch (error) {
    console.error("Failed to login:", error);
    Taro.hideLoading();
    Taro.showToast({
      title: "登录失败，请重试",
      icon: "none",
    });
  }
    */
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
};
