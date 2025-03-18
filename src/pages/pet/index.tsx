import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Input, Picker, Image } from "@tarojs/components";
import { observer } from "mobx-react";
import Taro from "@tarojs/taro";
import { createPet, updatePet, getPetById } from "@/service/petService";

import "./index.css";
import { Pet as PetInfo, PetGender, PetSize } from "@/types/pet";
import { get } from "mobx";

interface SelectorOption<T> {
  display: string;
  value: T;
}

interface PetState {
  avatar: string;
  name: string;
  gender: PetGender;
  size: PetSize;
  breed: string;
  desc: string;
  genderOptions: SelectorOption<PetGender>[];
  sizeOptions: SelectorOption<PetSize>[];
  genderIndex: number;
  sizeIndex: number;
  ownerId: string;
  id: string;
}

@observer
class Pet extends Component<PropsWithChildren, PetState> {
  state: PetState = {
    avatar: "",
    name: "",
    gender: "male",
    size: "small",
    breed: "",
    desc: "",
    genderOptions: [
      { display: "Male", value: "male" },
      { display: "Female", value: "female" },
    ],
    sizeOptions: [
      { display: "Small", value: "small" },
      { display: "Medium", value: "medium" },
      { display: "Large", value: "large" },
    ],
    genderIndex: 0,
    sizeIndex: 0,
    ownerId: "",
    id: "",
  };

  componentDidMount(): void {
    const params = Taro.getCurrentInstance().router?.params;
    console.log("Params received in pet:", params);
    if (params) {
      if (params.id) {
        console.log("Editing pet with ID:", params.id);
        this.setInitPet(params.id);
      } else if (params.ownerId) {
        // no id provided, need to specify owner
        this.setState({
          ownerId: params.ownerId,
        });
      }
    }
  }

  setInitPet = async (id: string) => {
    const pet = await getPetById(id);
    this.setState({
      name: pet.name,
      avatar: pet.avatar,
      ownerId: pet.ownerId,
      gender: pet.gender,
      size: pet.size,
      breed: pet.breed,
      desc: pet.desc,
      id: id,
    });
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

  // Updated to use the options structure
  handleGenderChange = (e) => {
    const index = e.detail.value;
    const selectedGender = this.state.genderOptions[index].value;

    this.setState({
      genderIndex: index,
      gender: selectedGender,
    });

    console.log("Gender changed to:", selectedGender);
  };

  // Updated to use the options structure
  handleSizeChange = (e) => {
    const index = e.detail.value;
    const selectedSize = this.state.sizeOptions[index].value;

    this.setState({
      sizeIndex: index,
      size: selectedSize,
    });

    console.log("Size changed to:", selectedSize);
  };

  handleSubmit = async () => {
    console.log("Pet information:", this.state);
    const newPetData: PetInfo = {
      avatar: this.state.avatar,
      name: this.state.name,
      gender: this.state.gender,
      ownerId: "60a12b5f8f2e8c001f3e1234",
      size: this.state.size,
      breed: this.state.breed,
      desc: this.state.desc,
      age: 2,
    };
    if (this.state.id === "") {
      console.log("Creating new pet");
      const createdPet: PetInfo = await createPet(newPetData);
      console.log("Created pet:", createdPet);
    } else {
      console.log("Updating existing pet");
      const updatedPet = await updatePet(this.state.id, newPetData);
      console.log("Updated pet:", updatedPet);
    }

    Taro.showToast({
      title: "Information saved!",
      icon: "success",
    });

    Taro.navigateTo({
      url: "/pages/index/index",
      success: () => console.log("Navigation successful"),
      fail: (err) => {
        console.error("Navigation failed:", err);
        Taro.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
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
      desc,
      genderOptions,
      sizeOptions,
      genderIndex,
      sizeIndex,
    } = this.state;

    const genderDisplayValues = genderOptions.map((option) => option.display);
    const sizeDisplayValues = sizeOptions.map((option) => option.display);

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
            range={genderDisplayValues}
            value={genderIndex}
            onChange={this.handleGenderChange}
          >
            <View className="picker">
              {genderDisplayValues[genderIndex] || "Select Gender"}
            </View>
          </Picker>
        </View>

        <View className="form-item">
          <Text className="label">Size:</Text>
          <Picker
            mode="selector"
            range={sizeDisplayValues}
            value={sizeIndex}
            onChange={this.handleSizeChange}
          >
            <View className="picker">
              {sizeDisplayValues[sizeIndex] || "Select Size"}
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
        <View className="form-item">
          <Text className="label">Desc:</Text>
          <Input
            className="input"
            value={desc}
            onInput={(e) => this.handleInputChange("desc", e)}
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
