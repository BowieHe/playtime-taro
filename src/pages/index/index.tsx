import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { UserStore } from "@/store/user";
import { PetStore } from "@/store/pet";
import { getPetsByOwner } from "@/service/petService";
import { Pet } from "@/types/pet";

import "./index.css";
import "@/app.css";
import { validLogin } from "@/service/userService";
// Import components
import Header from "@/components/header";
import PlayButton from "@/components/playButton";
import PetCard from "@/components/petCard";

interface PageProps extends PropsWithChildren {
  store: {
    userStore: UserStore;
    petStore: PetStore;
  };
}

@inject("store")
@observer
class Index extends Component<PageProps> {
  // Updated pet data with the required structure
  // samplePets: Pet[] = [
  //   {
  //     id: "60a12b5f8f2e8c001f3e1234",
  //     name: "Max",
  //     gender: "male",
  //     avatar:
  //       "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000",
  //     size: "medium",
  //     breed: "Golden Retriever",
  //     desc: "Friendly and energetic dog who loves to play fetch and run in the park.",
  //     age: 3,
  //     ownerId: "60a12b5f8f2e8c001f3e9876",
  //   },
  //   {
  //     id: "60a12b5f8f2e8c001f3e5678",
  //     name: "Luna",
  //     gender: "female",
  //     avatar:
  //       "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000",
  //     size: "small",
  //     breed: "Tabby Cat",
  //     desc: "Curious and affectionate cat who enjoys lounging in the sun and chasing toys.",
  //     age: 2,
  //     ownerId: "60a12b5f8f2e8c001f3e4321",
  //   },
  //   {
  //     id: "60a12b5f8f2e8c001f3e9012",
  //     name: "Rocky",
  //     gender: "male",
  //     avatar:
  //       "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1000",
  //     size: "large",
  //     breed: "German Shepherd",
  //     desc: "Loyal and intelligent dog, great with families and very protective.",
  //     age: 4,
  //     ownerId: "60a12b5f8f2e8c001f3e7654",
  //   },
  // ];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("index component mounted");
    this.checkUserLoginStatus();
  }

  componentWillUnmount() {
    console.log("index component will unmount");
  }

  componentDidShow() {
    // This runs every time the page becomes visible
    console.log("Index page shown, checking user login status");

    // Load user's pets if user is logged in
    const { user } = this.props.store.userStore;
    if (user && user.id) {
      this.loadUserPets(user.id);
    }
  }

  // Load pets belonging to the current user
  loadUserPets = async (userId: string) => {
    try {
      this.props.store.petStore.setLoading(true);
      const pets = await getPetsByOwner(userId);
      this.props.store.petStore.setPets(pets);
    } catch (error) {
      console.error("Error loading user pets:", error);
      Taro.showToast({
        title: "无法加载宠物信息",
        icon: "none",
      });
    } finally {
      this.props.store.petStore.setLoading(false);
    }
  };

  checkUserLoginStatus = async () => {
    try {
      const storeUser = this.props.store.userStore.user;
      if (storeUser && storeUser.nickName) {
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

  navigateToPetCreate = (ownerId: string) => {
    Taro.navigateTo({
      url: `/pages/pet/index?ownerId=${ownerId}`,
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

  handlePetCardClick = (pet: Pet, ownerId: string) => {
    console.log("Pet card clicked:", pet);
    Taro.navigateTo({
      url: `/pages/pet/index?id=${pet.id}&ownerId=${ownerId}`,
    });
  };

  render() {
    const { userStore, petStore } = this.props.store;
    const { user } = userStore;
    const userPets = user?.id ? petStore.petsByOwner(user.id) : [];
    const isLoading = petStore.isLoading;

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
              <View className="button-group">
                <Button
                  className="update-profile-btn"
                  onClick={this.navigateToUserCreate}
                >
                  修改资料
                </Button>
                <Button
                  className="add-pet-btn"
                  onClick={() => this.navigateToPetCreate(user?.id || "")}
                >
                  添加宠物
                </Button>
              </View>
            </View>
          )}

          {/* Pet cards section with updated styling */}
          <View className="pet-section">
            <View className="section-header">
              <Text className="section-title">我的宠物</Text>
              <Text className="section-subtitle">My Pets</Text>
            </View>

            {isLoading ? (
              <View className="loading-indicator">加载中...</View>
            ) : (
              <View className="pet-cards-container">
                {userPets.length > 0 ? (
                  userPets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onClick={() =>
                        this.handlePetCardClick(pet, user?.id || "")
                      }
                    />
                  ))
                ) : (
                  <View className="no-pets-message">
                    <Text>您还没有添加宠物</Text>
                    <Text>You haven't added any pets yet</Text>
                    <Button
                      className="add-first-pet-btn"
                      onClick={() => this.navigateToPetCreate(user?.id || "")}
                    >
                      添加第一个宠物
                    </Button>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <PlayButton user={user} />
      </View>
    );
  }
}

export default Index;
