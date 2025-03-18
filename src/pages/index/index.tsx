import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { UserStore } from "@/store/user";

import "./index.css";
import "@/app.css";
// import { getLoginSession } from "@/service/wechatService";
import { validLogin } from "@/service/userService";
// Import components
import Header from "@/components/header";
import PlayButton from "@/components/playButton";
// import { User } from "@/types/user";

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

  // async checkUserLogin() {
  //   console.log("Checking user login...");

  //   try {
  //     // Show loading indicator while we check the login status
  //     Taro.showLoading({ title: "登录中..." });

  //     const loginRes = await Taro.login();
  //     console.log("Login response:", loginRes);

  //     const sessionRes = await getLoginSession(loginRes.code);
  //     console.log("Session response:", sessionRes);

  //     // Store these values in the user store regardless of what happens next
  //     this.props.store.userStore.setWechatId(
  //       sessionRes.openid,
  //       sessionRes.unionid || ""
  //     );

  //     try {
  //       const user = await getUserByOpenId(sessionRes.openid);

  //       if (user) {
  //         console.log("User found:", user);
  //         Taro.hideLoading();
  //         Taro.showToast({
  //           title: "Welcome back",
  //           icon: "success",
  //         });
  //         this.props.store.userStore.setUser(user);
  //       } else {
  //         throw new Error("User not found");
  //       }
  //     } catch (error) {
  //       console.log("User not found, need to create profile");
  //       Taro.hideLoading();

  //       console.log("Attempting to navigate to user create page");

  //       try {
  //         Taro.navigateTo({
  //           url: `/pages/userCreate/index?openId=${sessionRes.openid}&unionId=${
  //             sessionRes.unionid || ""
  //           }`,
  //           success: () => {
  //             console.log("Navigation successful");
  //           },
  //           fail: (err) => {
  //             console.error("Navigation failed:", err);

  //             Taro.redirectTo({
  //               url: "/pages/userCreate/index",
  //               success: () => {
  //                 console.log("Redirect successful");
  //               },
  //               fail: (err2) => {
  //                 console.error("Redirect also failed:", err2);
  //                 Taro.showToast({
  //                   title: "页面跳转失败，请重试",
  //                   icon: "none",
  //                 });
  //               },
  //             });
  //           },
  //         });
  //       } catch (navError) {
  //         console.error("Navigation error:", navError);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to login:", error);
  //     Taro.hideLoading();
  //     Taro.showToast({
  //       title: "登录失败，请重试",
  //       icon: "none",
  //     });
  //   }
  // }

  componentDidMount() {
    // Listen for page show event to refresh user info if needed
    // Taro.eventCenter.on("pageShow", this.onPageShow);
    console.log("index component mounted");
  }

  componentWillUnmount() {
    // Taro.eventCenter.off("pageShow", this.onPageShow);
    console.log("index component will unmount");
  }

  componentDidShow() {
    // This runs every time the page becomes visible
    console.log("Index page shown, checking user login status");
    this.checkUserLoginStatus();
  }

  checkUserLoginStatus = async () => {
    try {
      const storeUser = this.props.store.userStore.user;
      if (storeUser && storeUser.openId) {
        console.log("User already logged in, skipping login check");
        return;
      }
      const user = await validLogin();
      console.log("Valid login check result:", user);
      this.props.store.userStore.setUser(user);
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  // onPageShow = async () => {
  //   console.log("Index page shown, checking user login status");
  //   const user = await validLogin();

  //   this.props.store.userStore.setUser(user);
  // };

  // Navigate to user creation page manually if needed
  navigateToUserCreate = () => {
    try {
      console.log("Manually navigating to user create page");

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
        <Header className="index-header" />

        {/* Main content area */}
        <View className="index-content">
          {user && user.openId && (
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
                onClick={this.navigateToUserCreate}
              >
                修改个人资料
              </Button>
            </View>
          )}
        </View>

        <PlayButton user={user} />
      </View>
    );
  }
}

export default Index;
