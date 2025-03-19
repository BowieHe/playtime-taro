import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Input, Picker, Image } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { PetStore } from "@/store/pet";
import "./index.css";
import { Pet as PetInfo, PetSize, PetGender } from "@/types/pet";
import { createPet, updatePet, uploadPetAvatar } from "@/service/petService";

interface PageProps extends PropsWithChildren {
  store: {
    petStore: PetStore;
  };
}

interface PageState {
  pet: {
    id?: string;
    ownerId?: string;
    name: string;
    avatar: string;
    breed: string;
    desc: string;
    gender: PetGender;
    size: PetSize;
    age: number; // Added age property
  };
  genderIndex: number;
  sizeIndex: number;
  isEditing: boolean;
}

interface OptionType {
  value: string;
  display: string;
}

@inject("store")
@observer
class Pet extends Component<PageProps, PageState> {
  genderOptions: OptionType[] = [
    { value: "male", display: "Male" },
    { value: "female", display: "Female" },
  ];

  sizeOptions: OptionType[] = [
    { value: "small", display: "Small" },
    { value: "medium", display: "Medium" },
    { value: "large", display: "Large" },
  ];

  constructor(props) {
    super(props);

    this.state = {
      pet: {
        name: "",
        avatar:
          "https://img0.baidu.com/it/u=1490054424,4197689917&fm=253&fmt=auto&app=120&f=JPEG?w=801&h=800",
        breed: "",
        desc: "",
        gender: "male",
        size: "medium",
        age: 1, // Default age
      },
      genderIndex: 0,
      sizeIndex: 1,
      isEditing: false,
    };
  }

  componentDidMount(): void {
    const params = Taro.getCurrentInstance().router?.params;
    console.log("Params received in pet:", params);

    const { petStore } = this.props.store;

    if (params) {
      if (params.id) {
        console.log("Editing pet with ID:", params.id);
        const existingPet = petStore.getPetById(params.id);

        if (existingPet) {
          // Find the index of gender and size in our options
          const genderIndex = this.genderOptions.findIndex(
            (o) => o.value === existingPet.gender
          );
          const sizeIndex = this.sizeOptions.findIndex(
            (o) => o.value === existingPet.size
          );

          this.setState({
            pet: {
              ...existingPet,
              // Ensure age is a number with fallback to default
              age: typeof existingPet.age === "number" ? existingPet.age : 1,
            },
            genderIndex: genderIndex >= 0 ? genderIndex : 0,
            sizeIndex: sizeIndex >= 0 ? sizeIndex : 1,
            isEditing: true,
          });
        }
      } else if (params.ownerId) {
        this.setState({
          pet: {
            ...this.state.pet,
            ownerId: params.ownerId,
          },
        });
      }
    }
  }

  handleAvatarUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];

        // Show loading state
        Taro.showLoading({ title: "Uploading image..." });

        try {
          // Upload the image and get the server URL
          const avatarUrl = await uploadPetAvatar(tempFilePath);

          // Update state with the returned URL
          this.setState({
            pet: {
              ...this.state.pet,
              avatar: avatarUrl,
            },
          });

          Taro.hideLoading();
          Taro.showToast({
            title: "Image uploaded successfully",
            icon: "success",
          });
        } catch (error) {
          console.error("Failed to upload image:", error);
          Taro.hideLoading();

          // Update state with local path temporarily
          this.setState({
            pet: {
              ...this.state.pet,
              avatar: tempFilePath, // Use local path as fallback
            },
          });

          Taro.showToast({
            title: "Failed to upload image",
            icon: "none",
          });
        }
      },
      fail: (error) => {
        console.error("Image selection failed:", error);
        Taro.showToast({
          title: "Failed to select image",
          icon: "none",
        });
      },
    });
  };

  handleInputChange = (key: string, e) => {
    // For age specifically, ensure it's a number
    if (key === "age") {
      // Convert to number and ensure it's at least 0
      const age = Math.max(0, parseInt(e.detail.value) || 0);

      this.setState({
        pet: {
          ...this.state.pet,
          age: age,
        },
      });
    } else {
      this.setState({
        pet: {
          ...this.state.pet,
          [key]: e.detail.value,
        },
      });
    }
  };

  handleGenderChange = (e) => {
    const index = e.detail.value;
    this.setState({
      genderIndex: index,
      pet: {
        ...this.state.pet,
        gender: this.genderOptions[index].value as PetGender,
      },
    });
  };

  handleSizeChange = (e) => {
    const index = e.detail.value;
    this.setState({
      sizeIndex: index,
      pet: {
        ...this.state.pet,
        size: this.sizeOptions[index].value as PetSize,
      },
    });
  };

  handleSubmit = async () => {
    const { petStore } = this.props.store;
    const { pet, isEditing } = this.state;

    Taro.showLoading({ title: "Updating..." });
    try {
      if (isEditing && pet.id) {
        console.log("Updating existing pet");
        const updateResult = await updatePet(pet.id, pet as PetInfo);
        console.log("Update result:", updateResult);
        petStore.updatePet(pet as PetInfo);
      } else {
        console.log("Creating new pet");
        const createResult = await createPet(pet as PetInfo);
        console.log("Create result:", createResult);
        petStore.addPet(pet as PetInfo);
      }
      Taro.hideLoading();

      Taro.showToast({
        title: "Information saved!",
        icon: "success",
        complete: () => {
          setTimeout(() => {
            Taro.navigateTo({
              url: "/pages/index/index",
            });
          }, 500);
        },
      });
    } catch (error) {
      Taro.hideLoading();
      console.error("Error saving pet information:", error);
      Taro.showToast({
        title: "Failed to save information",
        icon: "none",
      });
    }
  };

  render() {
    const { pet, genderIndex, sizeIndex } = this.state;
    const genderDisplayValues = this.genderOptions.map(
      (option) => option.display
    );
    const sizeDisplayValues = this.sizeOptions.map((option) => option.display);

    return (
      <View className="pet">
        <View className="form-item">
          <Text className="label">Avatar:</Text>
          <View className="avatar-container">
            {pet.avatar ? (
              <Image src={pet.avatar} className="avatar" />
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
            value={pet.name}
            onInput={(e) => this.handleInputChange("name", e)}
            placeholder="Enter pet name"
          />
        </View>

        <View className="form-item">
          <Text className="label">Age:</Text>
          <Input
            className="input"
            type="number"
            value={pet.age.toString()}
            onInput={(e) => this.handleInputChange("age", e)}
            placeholder="Enter pet age"
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
            value={pet.breed}
            onInput={(e) => this.handleInputChange("breed", e)}
            placeholder="Enter breed"
          />
        </View>

        <View className="form-item">
          <Text className="label">Description:</Text>
          <Input
            className="input"
            value={pet.desc}
            onInput={(e) => this.handleInputChange("desc", e)}
            placeholder="Enter description"
          />
        </View>

        <Button className="submit-button" onClick={this.handleSubmit}>
          Save Pet Information
        </Button>
      </View>
    );
  }
}

export default Pet;
