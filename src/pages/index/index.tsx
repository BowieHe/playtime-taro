import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { UserStore } from "@/store/user";

import "./index.css";
import { getPhoneNumber } from "@/service/wechatService";
import { getLoginSession } from "@/service/wechatService";
import { getUserByOpenId } from "@/service/userService";

// You might want to create these API methods in a separate service file
import { User } from "@/types/user";

interface PageProps extends PropsWithChildren {
  store: {
    userStore: UserStore;
  };
}

@inject("store")
@observer
class Index extends Component<PageProps> {
  constructor(props) {
    super(props);
  }

  async checkUserLogin() {
    console.log("Checking user login...");

    try {
      // Show loading indicator while we check the login status
      Taro.showLoading({ title: "登录中..." });

      const loginRes = await Taro.login();
      // TODO: delete hard code
      // const loginRes = { code: "aa" };
      console.log("Login response:", loginRes);

      const sessionRes = await getLoginSession(loginRes.code);
      console.log("Session response:", sessionRes);

      // Store these values in the user store regardless of what happens next
      this.props.store.userStore.setWechatId(
        sessionRes.openid,
        sessionRes.unionid || ""
      );

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

        // Simplify the navigation approach - try a direct approach first
        console.log("Attempting to navigate to user create page");

        try {
          // Try the simple approach first
          Taro.navigateTo({
            url: `/pages/userCreate/index?openId=${sessionRes.openid}&unionId=${sessionRes.unionid}`,
            success: () => {
              console.log("Navigation successful");
            },
            fail: (err) => {
              console.error("Navigation failed:", err);

              // Try alternative navigation methods as fallback
              console.log("Trying alternative navigation...");
              // Attempt a simple redirect with minimal parameters
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
  }

  componentDidMount() {
    // Add a delay before checking login to ensure full page initialization
    setTimeout(() => {
      this.checkUserLogin();
    }, 500);

    // Listen for page show event to refresh user info if needed
    Taro.eventCenter.on("pageShow", this.onPageShow);
  }

  componentWillUnmount() {
    Taro.eventCenter.off("pageShow", this.onPageShow);
  }

  onPageShow = () => {};

  // Navigate to user creation page manually if needed
  navigateToUserCreate = () => {
    try {
      console.log("Manually navigating to user create page");

      // Simpler approach with less parameters
      Taro.navigateTo({
        url: "/pages/userCreate/index",
        success: () => console.log("Navigation successful"),
        fail: (err) => {
          console.error("Navigation failed:", err);
          Taro.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    } catch (error) {
      console.error("Error in navigation:", error);
    }
  };

  render() {
    const { userStore } = this.props.store;
    const { user } = userStore;

    return (
      <View className="index">
        {/* Debug button for direct navigation testing */}
        <Button onClick={this.navigateToUserCreate} type="primary">
          Navigate to User Create
        </Button>

        <View className="user-info-display">
          <Text className="welcome-text">欢迎回来！</Text>
          <Image
            className="avatar"
            src={user?.avatarUrl || ""}
            mode="aspectFit"
          />
          <Text className="nickname">昵称: {user?.nickName}</Text>
          {user?.phoneNumber && (
            <Text className="phone">手机号: {user?.phoneNumber}</Text>
          )}
          <Button
            className="update-profile-btn"
            onClick={() => this.navigateToUserCreate()}
          >
            修改个人资料
          </Button>
        </View>
      </View>
    );
  }
}

export default Index;
