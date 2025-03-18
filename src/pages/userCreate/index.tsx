// This is a backup of the original userCreate/index.tsx file
import { Component } from "react";
import { View, Button, Text, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.css";
import { getPhoneNumber } from "@/service/wechatService";
import { User } from "@/types/user";
import { createUser, updateUser } from "@/service/userService";
import userStore, { UserStore } from "@/store/user";
import { inject, observer } from "mobx-react";

interface PageProps {
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
  isCreate: boolean;
}

// Simplified version for testing navigation
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
      isCreate: true,
    };
  }

  componentDidMount() {
    console.log("UserCreate simple page mounted!");

    // Log the router params
    const params = Taro.getCurrentInstance().router?.params;
    console.log("Params received:", params);
    // this is create
    if (params && params.openId) {
      this.setState({
        openId: params.openId,
        unionId: params.unionId || "",
      });
    } else {
      console.log("no params received, editing user");
      const user = userStore.getUser();
      this.setState({
        avatarUrl: user.avatarUrl,
        nickName: user.nickName,
        phoneNumber: user.phoneNumber,
        openId: user.openId,
        unionId: user.unionId,
        isCreate: false,
      });
    }
  }

  goBack = () => {
    try {
      Taro.navigateBack();
    } catch (e) {
      console.error("Failed to navigate back:", e);
      Taro.redirectTo({
        url: "/pages/index/index",
      });
    }
  };

  onChooseAvatar = (e) => {
    const tempAvatarUrl = e.detail.avatarUrl;
    this.setState({
      avatarUrl: tempAvatarUrl,
    });
  };

  onNicknameInput = (e) => {
    // Make sure we're accessing the value correctly
    const value = e.detail.value;
    console.log("Input value detected:", value);

    this.setState({
      nickName: value,
    });
  };

  onGetPhoneNumber = async (e) => {
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      const { code } = e.detail;

      try {
        Taro.showLoading({ title: "获取手机号中..." });
        const phone = await getPhoneNumber(code);

        console.log("Phone number response:", phone);
        const phoneNumber = phone.purePhoneNumber;

        this.setState({
          phoneNumber: phoneNumber,
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

  onUpsertUser = async (userStore: UserStore) => {
    try {
      Taro.showLoading({ title: "保存中..." });
      const { avatarUrl, nickName, phoneNumber, unionId, openId } = this.state;
      const newUserInfo: User = {
        avatarUrl,
        nickName,
        phoneNumber,
        openId: openId,
        unionId: unionId,
      };

      const { isCreate } = this.state;
      if (!isCreate) {
        const id = userStore.getUser().id;
        console.log("update user with id:", id);
        const updatedUser = await updateUser(newUserInfo, id?.toString() || "");
        userStore.setUser(updatedUser);
      } else {
        console.log("create user");
        const createdUser = await createUser(newUserInfo);
        userStore.setUser(createdUser);
      }
      Taro.hideLoading();

      // Show success message
      Taro.showToast({
        title: "保存成功",
        icon: "success",
        duration: 1500, // Display for 1.5 seconds
        complete: () => {
          // Navigate back to index page after toast completes
          setTimeout(() => {
            console.log("Navigating back to index page...");

            // Option 1: Use redirectTo to replace current page with index
            Taro.redirectTo({
              url: "/pages/index/index",
              success: () => console.log("Successfully redirected to index"),
              fail: (error) => {
                console.error("Failed to redirect:", error);
              },
            });
          }, 500); // Short delay after toast
        },
      });
    } catch (error) {
      console.error("Failed to save user:", error);
      Taro.hideLoading();
      Taro.showToast({ title: "保存失败", icon: "none" });
    }
  };

  render() {
    const { avatarUrl, nickName, phoneNumber, isCreate } = this.state;
    const { userStore } = this.props.store;

    return (
      <View className="user-create-page">
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
            <Input
              type="number"
              placeholder="请输入手机号"
              value={phoneNumber}
              onInput={(e) => this.setState({ phoneNumber: e.detail.value })}
              className="phone-input"
            />
            <Button
              open-type="getPhoneNumber"
              onGetPhoneNumber={this.onGetPhoneNumber}
              type="default"
              className="phone-button"
            >
              获取微信手机号
            </Button>
          </View>
        </View>

        <View style={{ marginTop: "50px" }}>
          <Button onClick={() => this.onUpsertUser(userStore)} type="primary">
            {isCreate ? "Create User" : "Update User"}
          </Button>
        </View>
        <View style={{ marginTop: "50px" }}>
          <Button onClick={this.goBack} type="primary">
            Go Back to Index
          </Button>
        </View>
      </View>
    );
  }
}

export default UserCreate;
