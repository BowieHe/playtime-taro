import { Component } from "react";
import {
  View,
  Text,
  Input,
  Button,
  Radio,
  RadioGroup,
  Label,
  Textarea,
} from "@tarojs/components";
import Taro, { Current } from "@tarojs/taro";
import "./index.css";

interface LocationState {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isPetFriendly: boolean;
  petSize: "small" | "medium" | "large" | "";
  petType: "cat" | "dog" | "dragon" | "";
  zone: "indoor" | "garden" | "outdoor" | "";
  description: string;
  isSubmitting: boolean;
}

class LocationPage extends Component<{}, LocationState> {
  state: LocationState = {
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    isPetFriendly: false,
    petSize: "",
    petType: "",
    zone: "",
    description: "",
    isSubmitting: false,
  };

  componentDidMount() {
    // Get params from the URL
    const params = Current.router?.params;
    if (params) {
      this.setState({
        name: decodeURIComponent(params.name || ""),
        address: decodeURIComponent(params.address || ""),
        latitude: parseFloat(params.latitude || "0"),
        longitude: parseFloat(params.longitude || "0"),
      });
    }
  }

  handleInputChange = (field: keyof LocationState, value: any) => {
    this.setState({ [field]: value } as unknown as Pick<
      LocationState,
      keyof LocationState
    >);
  };

  togglePetFriendly = () => {
    this.setState((prevState) => ({
      isPetFriendly: !prevState.isPetFriendly,
    }));
  };

  handleSubmit = async () => {
    // Validate form
    const { name, address, isPetFriendly, petSize, petType, zone } = this.state;

    if (!name || !address) {
      Taro.showToast({
        title: "请填写名称和地址",
        icon: "none",
      });
      return;
    }

    if (isPetFriendly && (!petSize || !petType || !zone)) {
      Taro.showToast({
        title: "请完成宠物相关信息",
        icon: "none",
      });
      return;
    }

    this.setState({ isSubmitting: true });

    try {
      // In a real app, this would send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Taro.showToast({
        title: "添加成功！",
        icon: "success",
      });

      // Wait for toast to be visible before navigating back
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error("Failed to submit location:", error);
      Taro.showToast({
        title: "添加失败，请重试",
        icon: "none",
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const {
      name,
      address,
      isPetFriendly,
      petSize,
      petType,
      zone,
      description,
      isSubmitting,
    } = this.state;

    return (
      <View className="location-page">
        <View className="location-form">
          <Text className="form-title">添加宠物友好场所</Text>

          <View className="form-group">
            <Text className="form-label">名称</Text>
            <Input
              className="form-input"
              value={name}
              onInput={(e) => this.handleInputChange("name", e.detail.value)}
              placeholder="输入地点名称"
            />
          </View>

          <View className="form-group">
            <Text className="form-label">地址</Text>
            <Input
              className="form-input"
              value={address}
              onInput={(e) => this.handleInputChange("address", e.detail.value)}
              placeholder="地点地址"
            />
          </View>

          <View className="form-group">
            <Button
              className={`pet-friendly-button ${
                isPetFriendly ? "active" : "inactive"
              }`}
              onClick={this.togglePetFriendly}
            >
              {isPetFriendly ? "宠物友好 ✓" : "宠物友好"}
            </Button>
          </View>

          {isPetFriendly && (
            <>
              <View className="form-group">
                <Text className="form-label">宠物体型</Text>
                <RadioGroup
                  onChange={(e) =>
                    this.handleInputChange("petSize", e.detail.value)
                  }
                >
                  <View className="radio-option-group">
                    <Label
                      className={`radio-option ${
                        petSize === "small" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="small"
                        checked={petSize === "small"}
                        className="radio-input"
                      />
                      <Text className="radio-text">小型</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        petSize === "medium" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="medium"
                        checked={petSize === "medium"}
                        className="radio-input"
                      />
                      <Text className="radio-text">中型</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        petSize === "large" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="large"
                        checked={petSize === "large"}
                        className="radio-input"
                      />
                      <Text className="radio-text">大型</Text>
                    </Label>
                  </View>
                </RadioGroup>
              </View>

              <View className="form-group">
                <Text className="form-label">宠物种类</Text>
                <RadioGroup
                  onChange={(e) =>
                    this.handleInputChange("petType", e.detail.value)
                  }
                >
                  <View className="radio-option-group">
                    <Label
                      className={`radio-option ${
                        petType === "cat" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="cat"
                        checked={petType === "cat"}
                        className="radio-input"
                      />
                      <Text className="radio-text">猫</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        petType === "dog" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="dog"
                        checked={petType === "dog"}
                        className="radio-input"
                      />
                      <Text className="radio-text">狗</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        petType === "dragon" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="dragon"
                        checked={petType === "dragon"}
                        className="radio-input"
                      />
                      <Text className="radio-text">龙</Text>
                    </Label>
                  </View>
                </RadioGroup>
              </View>

              <View className="form-group">
                <Text className="form-label">场所区域</Text>
                <RadioGroup
                  onChange={(e) =>
                    this.handleInputChange("zone", e.detail.value)
                  }
                >
                  <View className="radio-option-group">
                    <Label
                      className={`radio-option ${
                        zone === "indoor" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="indoor"
                        checked={zone === "indoor"}
                        className="radio-input"
                      />
                      <Text className="radio-text">室内</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        zone === "garden" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="garden"
                        checked={zone === "garden"}
                        className="radio-input"
                      />
                      <Text className="radio-text">花园</Text>
                    </Label>
                    <Label
                      className={`radio-option ${
                        zone === "outdoor" ? "selected" : ""
                      }`}
                    >
                      <Radio
                        value="outdoor"
                        checked={zone === "outdoor"}
                        className="radio-input"
                      />
                      <Text className="radio-text">户外</Text>
                    </Label>
                  </View>
                </RadioGroup>
              </View>
            </>
          )}

          <View className="form-group">
            <Text className="form-label">描述</Text>
            <Textarea
              className="form-textarea"
              value={description}
              onInput={(e) =>
                this.handleInputChange("description", e.detail.value)
              }
              placeholder="添加关于此地点的描述（可选）"
            />
          </View>

          <Button
            className="submit-button"
            onClick={this.handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            提交
          </Button>
        </View>
      </View>
    );
  }
}

export default LocationPage;
