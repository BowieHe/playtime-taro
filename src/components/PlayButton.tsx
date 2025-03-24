import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { User } from '@/types/user';

interface PlayButtonProps {
    user: User;
    className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ user, className = '' }) => {
    const handleClick = async (user: User) => {
        try {
            // If user has a complete profile
            if (user.nickName) {
                navigateToMap();
                return;
            } else {
                Taro.hideLoading();
                navigateToUser(user.openId, user.unionId);
            }
        } catch (error) {
            console.error('Login process failed:', error);
            Taro.hideLoading();
            Taro.showToast({
                title: '登录失败，请重试',
                icon: 'none',
            });
        }
    };

    // Helper functions to improve readability
    const navigateToMap = () => {
        Taro.navigateTo({
            url: '/pages/map/index',
            fail: handleNavigationError,
        });
    };

    const navigateToUser = (openId: string, unionId: string = '') => {
        Taro.navigateTo({
            url: `/pages/user/index?openId=${openId}&unionId=${unionId}`,
            fail: handleNavigationError,
        });
    };

    const handleNavigationError = err => {
        console.error('Navigation failed:', err);
        Taro.showToast({
            title: '页面跳转失败',
            icon: 'none',
        });
    };

    return (
        <View className="fixed bottom-24 left-0 right-0 flex justify-center z-25">
            <Button
                className={`rounded-full bg-green-500 shadow-xl 
                flex items-center justify-center border-0
                active:scale-95 active:shadow-md ${className}`}
                style={{
                    width: '220rpx',
                    height: '220rpx',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
                }}
                onClick={() => handleClick(user)}
            >
                <Text
                    className="text-96rpx font-bold text-white"
                    style={{ fontFamily: 'var(--font-primary)' }}
                >
                    FUN!
                </Text>
            </Button>
        </View>
    );
};

export default PlayButton;
