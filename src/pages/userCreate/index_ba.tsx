import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image, Input } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { UserStore } from "@/store/user";

import "./index.css";
import { getPhoneNumber } from "@/service/wechatService";
import { createUser } from "@/service/userService";
import { User } from "@/types/user";

interface PageProps extends PropsWithChildren {
  store: {
    userStore: UserStore;
  };
}

interface PageState {
  avatarUrl: string;
  nickName: string;
  phoneNumber: string;
  unionId: string;
  openId: string;
}

@inject("store")
@observer
class UserCreate extends Component<PageProps, PageState> {
  constructor(props) {
    super(props);
    this.state = {
      avatarUrl: "",
      nickName: "",
      phoneNumber: "",
      unionId: "",
      openId: "",
    };
  }

  componentDidMount() {
    try {
      // Get openId and unionId from navigation params
      const params = Taro.getCurrentInstance().router?.params;
      console.log("UserCreate page mounted with params:", params);

      // Get from MobX store if navigation params are missing
      const { userStore } = this.props.store;
      const { user } = userStore;

      if (params && params.openId) {
        this.setState({
          openId: params.openId,
          unionId: params.unionId || "",
        });
      } else if (user.openId) {
        // Fallback to store if parameters are missing
        this.setState({
          openId: user.openId,
          unionId: user.unionId || "",
        });
      } else {
        // Show error and navigate back if no identification is available
        console.error("No openId found in params or store");
        Taro.showToast({
          title: "缺少必要参数，请重新登录",
          icon: "none",
        });

        // Return to index after a short delay
        setTimeout(() => {
          Taro.reLaunch({
            url: "/pages/index/index",
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }

  // Method to save user profile
  saveUserInfo = async () => {
    const { avatarUrl, nickName, phoneNumber } = this.state;

    if (!avatarUrl) {
      Taro.showToast({ title: "请先选择头像", icon: "none" });
      return;
    }

    if (!nickName) {
      Taro.showToast({ title: "请输入昵称", icon: "none" });
      return;
    }

    try {
      Taro.showLoading({ title: "保存中..." });

      const newUserInfo: User = {
        avatarUrl,
        nickName,
        phoneNumber,
        openId: this.state.openId,
        unionId: this.state.unionId,
      };

      // Create new user in your backend
      const createdUser = await createUser(newUserInfo);

      Taro.hideLoading();
      Taro.showToast({ title: "保存成功", icon: "success" });

      // Update user info in MobX store
      const { userStore } = this.props.store;
      userStore.setUser(createdUser);

      // Return to the main page with the created user info
      setTimeout(() => {
        Taro.reLaunch({
          url: "/pages/index/index",
          fail: (err) => {
            console.error("Navigation back failed:", err);
            // Fallback navigation option
            Taro.navigateBack({
              fail: () => Taro.redirectTo({ url: "/pages/index/index" }),
            });
          },
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to save user:", error);
      Taro.hideLoading();
      Taro.showToast({ title: "保存失败", icon: "none" });
    }
  };

  onChooseAvatar = (e) => {
    const tempAvatarUrl = e.detail.avatarUrl;
    this.setState({
      avatarUrl: tempAvatarUrl,
    });
  };

  onNicknameInput = (e) => {
    console.log("Nickname input event:", e);

    // Make sure we're accessing the value correctly
    const value = e.detail.value;
    console.log("Input value detected:", value);

    this.setState({
      nickName: value,
    });
  };

  onGetPhoneNumber = async (e) => {
    console.log("Phone number event:", e);

    if (e.detail.errMsg === "getPhoneNumber:ok") {
      const { code } = e.detail;

      try {
        Taro.showLoading({ title: "获取手机号中..." });
        const phone = await getPhoneNumber(code);

        const phoneNumber = phone.purePhoneNumber;

        this.setState({
          phoneNumber,
        });

        Taro.hideLoading();
        Taro.showToast({
          title: "手机号获取成功",
          icon: "success",
        });
      } catch (error) {
        console.error("Failed to get phone number:", error);
        Taro.hideLoading();
        Taro.showToast({
          title: "获取手机号失败",
          icon: "none",
        });
      }
    }
  };

  render() {
    const { avatarUrl, nickName, phoneNumber } = this.state;

    // Show loading screen
    // if (isLoading) {
    //   return <View className="loading">正在加载...</View>;
    // }

    return (
      <View className="user-create-page">
        <View className="header">
          <Text className="title">设置个人信息</Text>
          <Text className="subtitle">请完善您的个人资料</Text>
        </View>

        <View className="user-profile-form">
          {/* Avatar selection button */}
          <Button
            open-type="chooseAvatar"
            onChooseAvatar={this.onChooseAvatar}
            className="avatar-button"
          >
            {avatarUrl ? (
              <Image
                className="avatar-preview"
                src={avatarUrl}
                mode="aspectFit"
              />
            ) : (
              "选择头像"
            )}
          </Button>

          {/* Nickname input */}
          <View className="form-item">
            <Text className="label">昵称：</Text>
            <Input
              type="nickname"
              placeholder="请输入昵称"
              value={nickName}
              onInput={this.onNicknameInput}
              className="input"
            />
          </View>

          {/* Phone number button */}
          <View className="form-item">
            <Text className="label">手机号：</Text>
            <Button
              open-type="getPhoneNumber"
              onGetPhoneNumber={this.onGetPhoneNumber}
              type="default"
              className="phone-button"
            >
              {phoneNumber ? "重新获取手机号" : "获取手机号"}
            </Button>
            {phoneNumber && <Text className="phone-number">{phoneNumber}</Text>}
          </View>

          {/* Save button */}
          <Button
            type="primary"
            onClick={this.saveUserInfo}
            disabled={!avatarUrl || !nickName}
            className="save-button"
          >
            保存个人信息
          </Button>
        </View>
      </View>
    );
  }
}

export default UserCreate;
