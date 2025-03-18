import { Component, PropsWithChildren } from "react";
import { View, Button, Text, Image } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";
import { UserStore } from "@/store/user";
import { PetStore } from "@/store/pet";
import { validLogin } from "@/service/userService";
import { getPetsByOwner } from "@/service/petService";
import "./index.css";
import Header from "@/components/header";
import PlayButton from "@/components/playButton";
import PetCard from "@/components/petCard";
import { reaction } from "mobx";

interface PageProps extends PropsWithChildren {
    store: {
        userStore: UserStore;
        petStore: PetStore;
    };
}

interface PageState {
    isLoading: boolean;
}

@inject("store")
@observer
class Index extends Component<PageProps, PageState> {
    // Store the reaction disposer so we can clean it up later
    private userReactionDisposer: any;
    private initialCheckDone = false;

    state = {
        isLoading: false
    };

    componentDidMount() {
        // Set up reaction to observe user changes
        this.userReactionDisposer = reaction(
            // Track the user.id property
            () => this.props.store.userStore.user?.id,
            // React when it changes
            (userId) => {
                console.log("User ID changed in reaction:", userId);
                if (userId) {
                    this.loadUserPets(userId);
                }
            },
            // Options
            {
                fireImmediately: true, // Run immediately with current value
            }
        );

        // Initial login check only if needed
        if (!this.props.store.userStore.user?.id) {
            this.checkUserLoginStatus();
        }

        this.initialCheckDone = true;
    }

    componentWillUnmount() {
        // Clean up the reaction when component unmounts
        if (this.userReactionDisposer) {
            this.userReactionDisposer();
        }
    }

    // Only refresh data in componentDidShow, without redundant login checks
    componentDidShow() {
        console.log("Index page shown");
        const { user } = this.props.store.userStore;

        // If we already have a user, just refresh their pets
        if (user && user.id) {
            console.log("User exists, refreshing pet data");
            this.loadUserPets(user.id);
        }
        // Only check login again if we don't have a user and haven't done initial check
        else if (!this.initialCheckDone) {
            console.log(
                "No user yet and initial check not done, checking login status"
            );
            this.checkUserLoginStatus();
        }
    }

    loadUserPets = async (userId: string) => {
        try {
            console.log("Loading pets for user ID:", userId);
            const { petStore } = this.props.store;
            this.setState({ isLoading: true });
            const pets = await getPetsByOwner(userId);
            console.log("Pets loaded:", pets);
            petStore.setPets(pets);
        } catch (error) {
            console.error("Error loading pets:", error);
            Taro.showToast({ title: "无法加载宠物信息", icon: "none" });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    checkUserLoginStatus = async () => {
        const { userStore } = this.props.store;
        if (userStore.user && userStore.user.nickName) {
            console.log("User already logged in, skipping login check");
            return;
        }

        try {
            console.log("Checking user login status...");
            const user = await validLogin();
            console.log("Login check successful, user:", user);
            userStore.setUser(user);
            // Note: No need to manually call loadUserPets here as the reaction will handle it
        } catch (error) {
            console.error("Login check failed:", error);
        }
    };

    navigateTo = (url: string) => {
        Taro.navigateTo({
            url,
            fail: (err) => {
                console.error("Navigation failed:", err);
                Taro.showToast({ title: "页面跳转失败", icon: "none" });
            },
        });
    };

    navigateToUserCreate = () => this.navigateTo("/pages/userCreate/index");

    navigateToPetCreate = (ownerId: string) => {
        this.navigateTo(`/pages/pet/index?ownerId=${ownerId}`);
    };

    handlePetCardClick = (petId: string, ownerId: string) => {
        this.navigateTo(`/pages/pet/index?id=${petId}&ownerId=${ownerId}`);
    };

    renderUserInfo = () => {
        const { user } = this.props.store.userStore;
        if (!user || !user.openId) return null;

        return (
            <View className="user-info-display">
                <Image className="avatar" src={user.avatarUrl || ""} mode="aspectFit" />

                <View className="button-group">
                    <Button
                        className="update-profile-btn"
                        onClick={this.navigateToUserCreate}
                    >
                        修改资料
                    </Button>
                    <Button
                        className="add-pet-btn"
                        onClick={() => this.navigateToPetCreate(user.id || "")}
                    >
                        添加宠物
                    </Button>
                </View>
            </View>
        );
    };

    renderPetsList = () => {
        const { userStore, petStore } = this.props.store;
        const { user } = userStore;
        const userPets = user?.id ? petStore.petsByOwner(user.id) : [];
        const { isLoading } = this.state;

        return (
            <View className="pet-section">
                <View className="section-header">
                    <Text className="section-title">我的宠物</Text>
                    <Text className="section-subtitle">My Pets</Text>
                </View>

                {isLoading ? (
                    <View className="loading-indicator">加载中...</View>
                ) : userPets.length > 0 ? (
                    <View className="pet-cards-container">
                        {userPets.map((pet) => (
                            <PetCard
                                key={pet.id}
                                pet={pet}
                                onClick={() =>
                                    this.handlePetCardClick(pet.id || "", user?.id || "")
                                }
                            />
                        ))}
                    </View>
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
        );
    };

    render() {
        const { user } = this.props.store.userStore;

        return (
            <View className="index">
                <Header className="index-header" />
                <View className="index-content">
                    {this.renderUserInfo()}
                    {this.renderPetsList()}
                </View>
                <PlayButton user={user} />
            </View>
        );
    }
}

export default Index;
