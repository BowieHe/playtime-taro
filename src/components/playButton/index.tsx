import React from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { User } from "@/types/user";
// import { getLoginSession } from "@/service/wechatService";
// import { getUserByOpenId } from "@/service/userService";
// import { inject, observer } from "mobx-react";
import "./index.css";
// import { UserStore } from "@/store/user";

interface PlayButtonProps {
  user: User;
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ user, className = "" }) => {
  const handleClick = async (user: User) => {
    try {
      // If user is already logged in
      if (user.nickName) {
        navigateToMap();
        return;
      } else {
        Taro.hideLoading();
        navigateToUserCreate(user.openId, user.unionId);
      }
    } catch (error) {
      console.error("Login process failed:", error);
      Taro.hideLoading();
      Taro.showToast({
        title: "登录失败，请重试",
        icon: "none",
      });
    }
  };

  // Helper functions to improve readability
  const navigateToMap = () => {
    Taro.navigateTo({
      url: "/pages/map/index",
      fail: handleNavigationError,
    });
  };

  const navigateToUserCreate = (openId: string, unionId: string = "") => {
    Taro.navigateTo({
      url: `/pages/userCreate/index?openId=${openId}&unionId=${unionId}`,
      fail: handleNavigationError,
    });
  };

  const handleNavigationError = (err) => {
    console.error("Navigation failed:", err);
    Taro.showToast({
      title: "页面跳转失败",
      icon: "none",
    });
  };

  return (
    <View className="play-button-container">
      <Button
        className={`play-button ${className}`}
        onClick={() => handleClick(user)}
      >
        <Text className="play-button-text">FUN!</Text>
      </Button>
    </View>
  );
};

// export default inject("store")(observer(PlayButton));
export default PlayButton;
