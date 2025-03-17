import React from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { User } from "@/types/user";
import { getLoginSession } from "@/service/wechatService";
import { getUserByOpenId } from "@/service/userService";
import "./index.css";

interface PlayButtonProps {
  user?: User | null;
  className?: string;
  onUserLogin?: (user: User) => void;
  buttonText?: string;
}

/**
 * A reusable play button component that handles login and navigation
 */
const PlayButton: React.FC<PlayButtonProps> = ({
  user,
  className = "",
  onUserLogin,
  buttonText = "FUN!",
}) => {
  const handleClick = async () => {
    // If user is logged in (has openId), navigate to map page
    if (user && user.openId) {
      console.log("User is logged in, navigating to map page");
      Taro.navigateTo({
        url: "/pages/map/index",
        success: () => console.log("Navigation to map successful"),
        fail: (err) => {
          console.error("Navigation to map failed:", err);
          Taro.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    } else {
      console.log("User not logged in, checking login status");
      // User is not logged in, try to login
      try {
        Taro.showLoading({ title: "正在检查登录..." });

        const loginRes = await Taro.login();
        console.log("Login response:", loginRes);

        const sessionRes = await getLoginSession(loginRes.code);
        console.log("Session response:", sessionRes);

        try {
          // Try to get user info
          const user = await getUserByOpenId(sessionRes.openid);

          if (user) {
            console.log("User found:", user);
            Taro.hideLoading();

            // Call onUserLogin callback if provided
            if (onUserLogin) {
              onUserLogin(user);
            }

            // Navigate to map page
            Taro.navigateTo({
              url: "/pages/map/index",
            });
          } else {
            throw new Error("User not found");
          }
        } catch (error) {
          console.log("User not found, navigating to user create page");
          Taro.hideLoading();

          // Navigate to user create page
          Taro.navigateTo({
            url: `/pages/userCreate/index?openId=${sessionRes.openid}&unionId=${
              sessionRes.unionid || ""
            }`,
            fail: (err) => {
              console.error("Navigation failed:", err);
              Taro.showToast({
                title: "页面跳转失败",
                icon: "none",
              });
            },
          });
        }
      } catch (error) {
        console.error("Login check failed:", error);
        Taro.hideLoading();
        Taro.showToast({
          title: "登录失败，请重试",
          icon: "none",
        });
      }
    }
  };

  const buttonClass = `play-button pulse ${className}`;

  return (
    <View className="play-button-container">
      <Button className={buttonClass} onClick={handleClick}>
        <View className="play-button-content">
          <Text className="play-button-text">{buttonText}</Text>
        </View>
      </Button>
    </View>
  );
};

export default PlayButton;
