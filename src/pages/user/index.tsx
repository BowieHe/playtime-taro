import { Component } from 'react';
import { View, Button, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getPhoneNumber } from '@/service/wechatService';
import { User as UserType } from '@/types/user';
import { createUser, updateUser, getUserById, uploadAvatar } from '@/service/userService';
import { UserStore } from '@/store/user';
import { inject, observer } from 'mobx-react';

interface PageProps {
    store: {
        userStore: UserStore;
    };
}

interface PageState {
    id: string;
    avatarUrl: string;
    nickName: string;
    phoneNumber: string;
    unionId: string;
    openId: string;
    isCreate: boolean;
    isLoading: boolean;
}

@inject('store')
@observer
class User extends Component<PageProps, PageState> {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            avatarUrl: '',
            nickName: '',
            phoneNumber: '',
            unionId: '',
            openId: '',
            isCreate: true,
            isLoading: false,
        };
    }

    componentDidMount() {
        console.log('User page mounted!');

        const params = Taro.getCurrentInstance().router?.params;
        console.log('Params received:', params);

        const { userStore } = this.props.store;
        const currentUser = userStore.getUser();

        if (params) {
            if (params.id && params.id !== '') {
                console.log('Editing user with ID:', params.id);
                this.loadUserById(params.id);
            } else if (params.openId || currentUser.openId) {
                console.log('Creating new user with openId:', params.openId || currentUser.openId);
                this.setState({
                    openId: params.openId || currentUser.openId,
                    unionId: params.unionId || currentUser.unionId,
                    isCreate: true,
                });
            } else {
                this.initFromStore();
            }
        } else {
            this.initFromStore();
        }
    }

    loadUserById = async (id: string) => {
        try {
            Taro.showLoading({ title: 'Loading user data...' });

            const user = await getUserById(id);

            if (user) {
                this.setState({
                    id: user.id || '',
                    avatarUrl: user.avatarUrl || '',
                    nickName: user.nickName || '',
                    phoneNumber: user.phoneNumber || '',
                    openId: user.openId || '',
                    unionId: user.unionId || '',
                    isCreate: false,
                });

                console.log('User data loaded for editing:', user);
            } else {
                console.error('User not found with ID:', id);
                Taro.showToast({
                    title: 'User not found',
                    icon: 'none',
                });
            }

            Taro.hideLoading();
        } catch (error) {
            console.error('Error loading user:', error);
            Taro.hideLoading();
            Taro.showToast({
                title: 'Failed to load user data',
                icon: 'none',
            });
        }
    };

    initFromStore = () => {
        const { userStore } = this.props.store;
        const user = userStore.getUser();

        if (user && user.id) {
            this.setState({
                id: user.id,
                avatarUrl: user.avatarUrl,
                nickName: user.nickName,
                phoneNumber: user.phoneNumber,
                openId: user.openId,
                unionId: user.unionId,
                isCreate: false,
            });
        } else {
            this.setState({
                avatarUrl: user.avatarUrl || '',
                nickName: user.nickName || '',
                phoneNumber: user.phoneNumber || '',
                openId: user.openId || '',
                unionId: user.unionId || '',
                isCreate: true,
            });
        }
    };

    onChooseAvatar = async e => {
        const tempAvatarUrl = e.detail.avatarUrl;
        this.setState({ isLoading: true });

        try {
            const permanentUrl = await uploadAvatar(tempAvatarUrl);
            this.setState({
                avatarUrl: permanentUrl,
                isLoading: false,
            });

            Taro.showToast({
                title: '头像上传成功',
                icon: 'success',
            });
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            this.setState({
                avatarUrl: tempAvatarUrl,
                isLoading: false,
            });

            Taro.showToast({
                title: '头像上传失败，将使用临时文件',
                icon: 'none',
            });
        }
    };

    onNicknameInput = e => {
        const value = e.detail.value;
        console.log('Input value detected:', value);

        this.setState({
            nickName: value,
        });
    };

    onGetPhoneNumber = async e => {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            const { code } = e.detail;

            try {
                Taro.showLoading({ title: '获取手机号中...' });
                const phone = await getPhoneNumber(code);

                console.log('Phone number response:', phone);
                const phoneNumber = phone.purePhoneNumber;

                this.setState({
                    phoneNumber: phoneNumber,
                });

                Taro.hideLoading();
                Taro.showToast({
                    title: '手机号获取成功',
                    icon: 'success',
                });
            } catch (error) {
                console.error('Failed to get phone number:', error);
                Taro.hideLoading();
                Taro.showToast({
                    title: '获取手机号失败',
                    icon: 'none',
                });
            }
        }
    };

    onUpsertUser = async (userStore: UserStore) => {
        try {
            this.setState({ isLoading: true });
            const { avatarUrl, nickName, phoneNumber, unionId, openId, id, isCreate } = this.state;

            let finalAvatarUrl = avatarUrl;
            if (avatarUrl && avatarUrl.startsWith('/tmp')) {
                try {
                    finalAvatarUrl = await uploadAvatar(avatarUrl);
                } catch (error) {
                    console.error('Failed to upload avatar during save:', error);
                }
            }

            const userInfo: UserType = {
                avatarUrl: finalAvatarUrl,
                nickName,
                phoneNumber,
                openId,
                unionId,
            };

            let savedUser: UserType;

            if (!isCreate && id) {
                console.log('Updating user with id:', id);
                savedUser = await updateUser(userInfo, id);
            } else {
                console.log('Creating new user with openId:', openId);
                savedUser = await createUser(userInfo);
            }

            userStore.setUser(savedUser);

            this.setState({ isLoading: false });
            Taro.showToast({
                title: isCreate ? '创建成功' : '更新成功',
                icon: 'success',
                duration: 1500,
                complete: () => {
                    setTimeout(() => {
                        Taro.redirectTo({
                            url: '/pages/index/index',
                        });
                    }, 500);
                },
            });
        } catch (error) {
            console.error('Failed to save user:', error);
            this.setState({ isLoading: false });
            Taro.showToast({ title: '保存失败', icon: 'none' });
        }
    };

    render() {
        const { avatarUrl, nickName, phoneNumber, isCreate, isLoading } = this.state;
        const { userStore } = this.props.store;

        return (
            <View className="flex flex-col w-full min-h-screen bg-[#ffffff] dark:bg-[#121212] text-[#334155] dark:text-white">
                <View className="w-full px-4 pb-6 pt-6">
                    <View className="w-full bg-white dark:bg-[#181818] rounded-2xl overflow-hidden">
                        <View className="px-5 py-6">
                            {/* Avatar Selection with improved button position */}
                            <View className="flex flex-col items-center mb-8 relative">
                                <View className="relative w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 overflow-visible">
                                    {avatarUrl ? (
                                        <Image
                                            className="w-full h-full object-cover rounded-full"
                                            src={avatarUrl}
                                            mode="aspectFill"
                                        />
                                    ) : (
                                        <View className="w-full h-28 rounded-full flex items-center justify-center">
                                            <Text className="text-gray-500 dark:text-gray-400">
                                                选择头像
                                            </Text>
                                        </View>
                                    )}

                                    {/* Fixed plus button with overflow visible and larger size */}
                                    <Button
                                        open-type="chooseAvatar"
                                        onChooseAvatar={this.onChooseAvatar}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center shadow-md translate-x-[3px] translate-y-[3px]"
                                    >
                                        <Text className="text-white text-2xl font-bold">+</Text>
                                    </Button>
                                </View>

                                <Text className="text-sm text-gray-500 mt-4">点击更换头像</Text>
                            </View>

                            {/* Nickname */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-20 flex-shrink-0">
                                    昵称
                                </Text>
                                <Input
                                    type="text"
                                    placeholder="请输入昵称"
                                    value={nickName}
                                    onInput={this.onNicknameInput}
                                    className="flex-1 text-base text-gray-800 dark:text-white bg-transparent"
                                />
                            </View>

                            {/* Phone Number - with button on the same line */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-20 flex-shrink-0">
                                    手机号
                                </Text>
                                <Input
                                    type="number"
                                    placeholder="请输入手机号"
                                    value={phoneNumber}
                                    onInput={e => this.setState({ phoneNumber: e.detail.value })}
                                    className="flex-1 text-base text-gray-800 dark:text-white bg-transparent"
                                />
                                <Button
                                    open-type="getPhoneNumber"
                                    onGetPhoneNumber={this.onGetPhoneNumber}
                                    className="ml-2 bg-gray-100 dark:bg-gray-800 rounded-lg py-1 px-2 text-xs text-gray-700 dark:text-gray-300 flex-shrink-0 min-w-[88px]"
                                >
                                    获取微信号
                                </Button>
                            </View>

                            {/* Submit Button */}
                            <View className="pt-8 pb-2">
                                <Button
                                    onClick={() => this.onUpsertUser(userStore)}
                                    className={`w-full py-3 rounded-lg font-medium text-lg text-white text-center ${
                                        isLoading ? 'bg-gray-400' : 'bg-[#22c55e]'
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '保存中...' : isCreate ? '创建账号' : '保存修改'}
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

export default User;
