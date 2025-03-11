import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image, Input } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";

import "./index.css";

interface PageProps extends PropsWithChildren {
  store: {
    counterStore: {
      counter: number;
      increment: Function;
      decrement: Function;
      incrementAsync: Function;
    };
  };
}

interface PageState {
  userInfo: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
    country?: string;
    province?: string;
    city?: string;
    phoneNumber?: string; // 添加手机号字段
  } | null;
  hasUserInfo: boolean;
  avatarUrl: string;
  nickName: string;
  phoneNumber: string; // 添加手机号字段
}

@inject("store")
@observer
class Index extends Component<PageProps, PageState> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      hasUserInfo: false,
      avatarUrl: "",
      nickName: "",
      phoneNumber: "", // 初始化手机号为空字符串
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  increment = () => {
    const { counterStore } = this.props.store;
    counterStore.increment();
  };

  decrement = () => {
    const { counterStore } = this.props.store;
    counterStore.decrement();
  };

  incrementAsync = () => {
    const { counterStore } = this.props.store;
    counterStore.incrementAsync();
  };

  navigateToIndex = () => {
    Taro.switchTab({
      url: "/pages/pet/index",
    });
  };

  getUserProfile = () => {
    // Note: getUserProfile requires the user to tap a button first
    Taro.getUserProfile({
      desc: "用于完善会员资料", // Explain why you need user info
      success: (res) => {
        this.setState({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
        console.log("User profile retrieved:", res.userInfo);
      },
      fail: (err) => {
        console.error("Failed to get user profile:", err);
      },
    });
  };

  onChooseAvatar = (e) => {
    const tempAvatarUrl = e.detail.avatarUrl;
    this.setState({
      avatarUrl: tempAvatarUrl,
    });
  };

  onNicknameInput = (e) => {
    this.setState({
      nickName: e.detail.value,
    });
  };

  // 添加获取手机号的回调方法
  onGetPhoneNumber = (e) => {
    console.log("Phone number event:", e);

    if (e.detail.errMsg === "getPhoneNumber:ok") {
      // 手机号码需要通过后端解密获取，这里需要将加密数据发送到后端
      // 这里仅作为示例，将加密数据存储起来
      const { encryptedData, iv } = e.detail;

      console.log("Encrypted data:", encryptedData, "IV:", iv);

      // 实际场景中，你需要发送 encryptedData 和 iv 到后端进行解密
      // 这里模拟获取到手机号
      Taro.showLoading({ title: "获取手机号中..." });

      // 模拟后端请求
      setTimeout(() => {
        // 实际项目中，这里应该是后端返回解密后的手机号
        const mockPhoneNumber = "1380013xxxx"; // 实际中这个值应该是后端解密后返回的

        this.setState({
          phoneNumber: mockPhoneNumber,
        });

        Taro.hideLoading();
        Taro.showToast({
          title: "手机号获取成功",
          icon: "success",
        });
      }, 1000);
    } else {
      Taro.showToast({
        title: "获取手机号失败",
        icon: "none",
      });
    }
  };

  // 保存用户信息的方法
  saveUserInfo = () => {
    const { avatarUrl, nickName, phoneNumber } = this.state;

    if (!avatarUrl) {
      Taro.showToast({
        title: "请先选择头像",
        icon: "none",
      });
      return;
    }

    if (!nickName) {
      Taro.showToast({
        title: "请输入昵称",
        icon: "none",
      });
      return;
    }

    // 将头像和昵称合并为一个完整的用户信息
    const userInfo = {
      avatarUrl,
      nickName,
      phoneNumber, // 添加手机号
      // 其他可能需要的默认字段
      gender: 0,
      country: "",
      province: "",
      city: "",
    };

    this.setState({
      userInfo,
      hasUserInfo: true,
    });

    console.log("User info saved:", userInfo);

    // 在这里你可以将用户信息发送到服务器或存储到本地
  };

  render() {
    const {
      counterStore: { counter },
    } = this.props.store;
    const { userInfo, hasUserInfo, avatarUrl, nickName, phoneNumber } =
      this.state;

    return (
      <View className="index">
        {/* 计数器相关按钮 */}
        <Button onClick={this.increment}>+</Button>
        <Button onClick={this.decrement}>-</Button>
        <Button onClick={this.incrementAsync}>Add Async</Button>
        <Text>{counter}</Text>

        <Button className="nav-button" onClick={this.navigateToIndex}>
          Go to Pet Page
        </Button>

        {/* 用户信息收集区域 */}
        <View className="user-profile-section">
          <Text className="section-title">设置个人信息</Text>

          {/* 头像选择按钮 */}
          <Button open-type="chooseAvatar" onChooseAvatar={this.onChooseAvatar}>
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

          {/* 昵称输入框 */}
          <View className="nickname-input-container">
            <Text>昵称：</Text>
            <Input
              type="nickname"
              placeholder="请输入昵称"
              value={nickName}
              onInput={this.onNicknameInput}
            />
          </View>

          {/* 手机号获取按钮 */}
          <View className="phone-container">
            <Text>手机号：</Text>
            <Button
              open-type="getPhoneNumber"
              onGetPhoneNumber={this.onGetPhoneNumber}
              type="default"
              size="mini"
              className="phone-button"
            >
              {phoneNumber ? "重新获取手机号" : "获取手机号"}
            </Button>
            {phoneNumber && <Text className="phone-number">{phoneNumber}</Text>}
          </View>

          {/* 保存按钮 */}
          <Button
            type="primary"
            onClick={this.saveUserInfo}
            disabled={!avatarUrl || !nickName}
          >
            保存个人信息
          </Button>

          {/* 展示已保存的用户信息 */}
          {hasUserInfo && userInfo && (
            <View className="user-info">
              <Image
                className="avatar"
                src={userInfo.avatarUrl || ""}
                mode="aspectFit"
              />
              <Text className="nickname">昵称: {userInfo.nickName}</Text>
              {userInfo.phoneNumber && (
                <Text className="phone">手机号: {userInfo.phoneNumber}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default Index;
