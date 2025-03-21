import { Component } from 'react';
import { View, Button, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.css';
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
}

// Simplified version for testing navigation
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
        };
    }

    componentDidMount() {
        console.log('User page mounted!');

        // Log the router params
        const params = Taro.getCurrentInstance().router?.params;
        console.log('Params received:', params);

        // Get the user store for access to openId/unionId
        const { userStore } = this.props.store;
        const currentUser = userStore.getUser();

        // Different initialization logic based on parameters
        if (params) {
            // Case 1: We have an ID - this is an update operation
            if (params.id && params.id !== '') {
                console.log('Editing user with ID:', params.id);
                this.loadUserById(params.id);
            }
            // Case 2: We have openId/unionId - this is a create operation
            else if (params.openId || currentUser.openId) {
                console.log('Creating new user with openId:', params.openId || currentUser.openId);
                this.setState({
                    openId: params.openId || currentUser.openId,
                    unionId: params.unionId || currentUser.unionId,
                    isCreate: true,
                });
            }
            // Case 3: No parameters - default to using store data
            else {
                this.initFromStore();
            }
        } else {
            // No params - default to using store data
            this.initFromStore();
        }
    }

    // Load user by ID for editing
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

    // Initialize from the user store
    initFromStore = () => {
        const { userStore } = this.props.store;
        const user = userStore.getUser();

        // If we have a user in the store with an ID, it's an edit operation
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
        }
        // Otherwise it's a create operation with whatever data we have
        else {
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

        // Show loading indicator
        Taro.showLoading({ title: '上传头像中...' });

        try {
            const permanentUrl = await uploadAvatar(tempAvatarUrl);

            // Update state with the permanent URL
            this.setState({
                avatarUrl: permanentUrl,
            });

            Taro.hideLoading();
            Taro.showToast({
                title: '头像上传成功',
                icon: 'success',
            });
        } catch (error) {
            console.error('Failed to upload avatar:', error);

            // If upload fails, still use the temporary URL
            this.setState({
                avatarUrl: tempAvatarUrl,
            });

            Taro.hideLoading();
            Taro.showToast({
                title: '头像上传失败，将使用临时文件',
                icon: 'none',
            });
        }
    };

    onNicknameInput = e => {
        // Make sure we're accessing the value correctly
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
            Taro.showLoading({ title: '保存中...' });
            const { avatarUrl, nickName, phoneNumber, unionId, openId, id, isCreate } = this.state;

            // Check if we have a temporary avatar URL that needs to be uploaded
            let finalAvatarUrl = avatarUrl;
            if (avatarUrl && avatarUrl.startsWith('/tmp')) {
                try {
                    // Try to upload the avatar if it's still a temporary file
                    finalAvatarUrl = await uploadAvatar(avatarUrl);
                } catch (error) {
                    console.error('Failed to upload avatar during save:', error);
                    // Continue with the temporary URL if upload fails
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

            // Update the store with the saved user data
            userStore.setUser(savedUser);

            Taro.hideLoading();
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
            Taro.hideLoading();
            Taro.showToast({ title: '保存失败', icon: 'none' });
        }
    };

    render() {
        const { avatarUrl, nickName, phoneNumber, isCreate } = this.state;
        const { userStore } = this.props.store;

        return (
            <View className="user-create-page">
                <View className="header">
                    <Text className="title">{isCreate ? '创建用户资料' : '更新资料'}</Text>
                    <Text className="subtitle">请设置您的个人信息</Text>
                </View>

                <View className="user-profile-form">
                    {/* Avatar selection button with common class */}
                    <Button
                        open-type="chooseAvatar"
                        onChooseAvatar={this.onChooseAvatar}
                        className="avatar-button"
                    >
                        {avatarUrl ? (
                            <Image className="app-avatar" src={avatarUrl} mode="aspectFill" />
                        ) : (
                            '选择头像'
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
                            onInput={e => this.setState({ phoneNumber: e.detail.value })}
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

                <View style={{ marginTop: '50px' }}>
                    <Button onClick={() => this.onUpsertUser(userStore)} type="primary">
                        {isCreate ? 'Create User' : 'Update User'}
                    </Button>
                </View>
                {/* <View style={{ marginTop: "50px" }}>
          <Button onClick={this.goBack} type="primary">
            Go Back to Index
          </Button>
        </View> */}
            </View>
        );
    }
}

export default User;
