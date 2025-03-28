import { Component, PropsWithChildren } from 'react';
import { View, Button, Text, Image } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Taro from '@tarojs/taro';
import { UserStore } from '@/store/user';
import { PetStore } from '@/store/pet';
import { validLogin } from '@/service/userService';
import { getPetsByOwner } from '@/service/petService';
import PlayButton from '@/components/PlayButton';
import PetCard from '@/components/PetCard';
import { reaction } from 'mobx';
import { User } from '@/types/user';
import Header from '@/components/Header';

interface PageProps extends PropsWithChildren {
    store: {
        userStore: UserStore;
        petStore: PetStore;
    };
}

interface PageState {
    isLoading: boolean;
}

@inject('store')
@observer
class Index extends Component<PageProps, PageState> {
    private userReactionDisposer: any;
    private initialCheckDone = false;

    state = {
        isLoading: false,
    };

    componentDidMount() {
        this.userReactionDisposer = reaction(
            () => this.props.store.userStore.user?.id,
            userId => {
                console.log('User ID changed in reaction:', userId);
                if (userId) {
                    this.loadUserPets(userId);
                }
            },
            {
                fireImmediately: true,
            }
        );

        if (!this.props.store.userStore.user?.id) {
            this.checkUserLoginStatus();
        }

        this.initialCheckDone = true;
    }

    componentWillUnmount() {
        if (this.userReactionDisposer) {
            this.userReactionDisposer();
        }
    }

    componentDidShow() {
        console.log('Index page shown');
        const { user } = this.props.store.userStore;

        if (user && user.id) {
            console.log('User exists, refreshing pet data');
            this.loadUserPets(user.id);
        } else if (!this.initialCheckDone) {
            console.log('No user yet and initial check not done, checking login status');
            this.checkUserLoginStatus();
        }
    }

    loadUserPets = async (userId: string) => {
        try {
            console.log('Loading pets for user ID:', userId);
            const { petStore } = this.props.store;
            this.setState({ isLoading: true });
            const pets = await getPetsByOwner(userId);
            console.log('Pets loaded:', pets);
            petStore.setPets(pets);
        } catch (error) {
            console.error('Error loading pets:', error);
            Taro.showToast({ title: '无法加载宠物信息', icon: 'none' });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    checkUserLoginStatus = async () => {
        Taro.showLoading({ title: '检查登录状态...' });
        const { userStore } = this.props.store;
        if (userStore.user && userStore.user.nickName) {
            console.log('User already logged in, skipping login check');
            return;
        }

        try {
            console.log('Checking user login status...');
            const user = await validLogin();
            console.log('Login check successful, user:', user);
            userStore.setUser(user);
        } catch (error) {
            console.error('Login check failed:', error);
        }
        Taro.hideLoading();
    };

    navigateTo = (url: string) => {
        Taro.navigateTo({
            url,
            fail: err => {
                console.error('Navigation failed:', err);
                Taro.showToast({ title: '页面跳转失败', icon: 'none' });
            },
        });
    };

    navigateToUser = (user: User) => {
        this.navigateTo(`/pages/user/index?id=${user?.id || ''}`);
    };

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
            // <View className="w-full bg-white dark:bg-[#181818] rounded-2xl shadow-md mb-4 p-4 relative">
            <View className="w-full bg-white dark:bg-[#181818] rounded-2xl mb-4 relative">
                <View className="flex items-center">
                    <View className="relative">
                        {user && user.avatarUrl ? (
                            <Image
                                className="w-20 h-20 rounded-full object-cover border-2 border-[#22c55e]"
                                src={user.avatarUrl}
                                mode="aspectFill"
                            />
                        ) : (
                            <View className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <Text>No Avatar</Text>
                            </View>
                        )}
                    </View>
                    <View className="pl-4 flex-1">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white pr-8">
                            {user.nickName || 'User'}
                        </Text>
                        <View className="flex text-sm text-gray-600 dark:text-gray-300 mt-1 opacity-80">
                            <View className="flex items-center mr-4">
                                <Text className="text-[#22c55e] mr-1">📍</Text>
                                <Text>{0} 活动</Text>
                            </View>
                            <View className="flex items-center">
                                <Text className="text-[#22c55e] mr-1">🐾</Text>
                                <Text>
                                    {this.props.store.petStore.petsByOwner(user.id || '').length}{' '}
                                    宠物
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Button
                    className="absolute top-2 right-4 bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-white"
                    onClick={() => this.navigateToUser(user)}
                >
                    ✏️
                </Button>
                <Button
                    className="absolute bottom-2 right-4 bg-[#22c55e] text-white rounded-lg py-1.5 px-3 font-medium text-sm flex items-center"
                    onClick={() => this.navigateToPetCreate(user.id || '')}
                >
                    <Text className="mr-1">+</Text>
                    <Text>添加宠物</Text>
                </Button>
            </View>
        );
    };

    renderPetsList = () => {
        const { userStore, petStore } = this.props.store;
        const { user } = userStore;
        const userPets = user?.id ? petStore.petsByOwner(user.id) : [];
        const { isLoading } = this.state;

        return (
            <View className="w-full mb-10">
                <View className="flex items-center mb-3">
                    <Text className="text-[#22c55e] mr-2 text-lg">🐾</Text>
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                        我的宠物
                    </Text>
                </View>

                {isLoading ? (
                    <View className="py-4 text-center text-[#666]">加载中...</View>
                ) : userPets.length > 0 ? (
                    <View className="w-full flex flex-col gap-4">
                        {userPets.map(pet => (
                            <PetCard
                                key={pet.id}
                                pet={pet}
                                onClick={() =>
                                    this.handlePetCardClick(pet.id || '', user?.id || '')
                                }
                            />
                        ))}
                    </View>
                ) : (
                    <View className="py-6 text-center text-[#666] flex flex-col gap-2">
                        <Text>您还没有添加宠物</Text>
                        <Text>You haven't added any pets yet</Text>
                        <Button
                            className="mt-3 bg-[#4caf50] text-white text-sm py-2 px-4 rounded-lg"
                            onClick={() => this.navigateToPetCreate(user?.id || '')}
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
            <View className="flex flex-col items-center w-full min-h-[calc(100vh-40px)] relative pb-40 overflow-x-hidden box-border max-w-[100vw] bg-[#ffffff] dark:bg-[#121212] text-[#334155] dark:text-white">
                <Header className="text-center py-4">
                    {/* <Text className="text-48rpx font-bold text-[#22c55e]">PlayTime</Text> */}
                    <Text className="text-48rpx font-bold opacity-80 mt-0.5 text-[#22c55e]">
                        from playtime to game time
                    </Text>
                </Header>
                <View className="w-full px-2 flex-1 flex flex-col items-center box-border">
                    {this.renderUserInfo()}
                    {this.renderPetsList()}
                </View>
                <PlayButton
                    user={user}
                    className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[120px] bg-[#22c55e] text-white rounded-full text-3xl font-bold shadow-lg shadow-green-400/40 flex items-center justify-center translate-y-1/3 hover:translate-y-[30%] hover:shadow-xl hover:shadow-green-400/50 active:scale-95"
                />
            </View>
        );
    }
}

export default Index;
