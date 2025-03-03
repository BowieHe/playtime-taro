import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Input, Picker, Image } from "@tarojs/components";
import { observer } from "mobx-react";
import Taro from "@tarojs/taro";

import "./index.css";

interface PetState {
  avatar: string;
  name: string;
  gender: string;
  size: string;
  breed: string;
  genderSelector: string[];
  sizeSelector: string[];
  genderIndex: number;
  sizeIndex: number;
}

@observer
class Pet extends Component<PropsWithChildren, PetState> {
  state: PetState = {
    avatar: "",
    name: "",
    gender: "",
    size: "",
    breed: "",
    genderSelector: ["Male", "Female"],
    sizeSelector: ["Small", "Medium", "Large"],
    genderIndex: 0,
    sizeIndex: 0,
  };

  handleAvatarUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        this.setState({
          avatar: res.tempFilePaths[0],
        });
      },
    });
  };

  handleInputChange = (key: string, e) => {
    this.setState({
      [key]: e.detail.value,
    } as any);
  };

  handleGenderChange = (e) => {
    const index = e.detail.value;
    this.setState({
      genderIndex: index,
      gender: this.state.genderSelector[index],
    });
  };

  handleSizeChange = (e) => {
    const index = e.detail.value;
    this.setState({
      sizeIndex: index,
      size: this.state.sizeSelector[index],
    });
  };

  handleSubmit = () => {
    console.log("Pet information:", this.state);
    Taro.showToast({
      title: "Information saved!",
      icon: "success",
    });
  };

  navigateToIndex = () => {
    Taro.switchTab({
      url: "/pages/index/index",
    });
  };

  render() {
    const {
      avatar,
      name,
      breed,
      genderSelector,
      sizeSelector,
      genderIndex,
      sizeIndex,
    } = this.state;
    return (
      <View className="pet">
        <View className="form-item">
          <Text className="label">Avatar:</Text>
          <View className="avatar-container">
            {avatar ? (
              <Image src={avatar} className="avatar" />
            ) : (
              <View
                className="avatar-placeholder"
                onClick={this.handleAvatarUpload}
              >
                Tap to upload
              </View>
            )}
            <Button size="mini" onClick={this.handleAvatarUpload}>
              Choose Image
            </Button>
          </View>
        </View>

        <View className="form-item">
          <Text className="label">Name:</Text>
          <Input
            className="input"
            value={name}
            onInput={(e) => this.handleInputChange("name", e)}
            placeholder="Enter pet name"
          />
        </View>

        <View className="form-item">
          <Text className="label">Gender:</Text>
          <Picker
            mode="selector"
            range={genderSelector}
            value={genderIndex}
            onChange={this.handleGenderChange}
          >
            <View className="picker">
              {genderSelector[genderIndex] || "Select Gender"}
            </View>
          </Picker>
        </View>

        <View className="form-item">
          <Text className="label">Size:</Text>
          <Picker
            mode="selector"
            range={sizeSelector}
            value={sizeIndex}
            onChange={this.handleSizeChange}
          >
            <View className="picker">
              {sizeSelector[sizeIndex] || "Select Size"}
            </View>
          </Picker>
        </View>

        <View className="form-item">
          <Text className="label">Breed:</Text>
          <Input
            className="input"
            value={breed}
            onInput={(e) => this.handleInputChange("breed", e)}
            placeholder="Enter breed"
          />
        </View>

        <Button className="submit-button" onClick={this.handleSubmit}>
          Save Pet Information
        </Button>

        <Button className="nav-button" onClick={this.navigateToIndex}>
          Go to Main Page
        </Button>
      </View>
    );
  }
}

export default Pet;
