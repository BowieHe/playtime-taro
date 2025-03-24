import React from 'react';
import { View, Text } from '@tarojs/components';

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    return (
        <View
            className={`flex flex-col items-center w-full py-20rpx max-w-full overflow-x-hidden box-border ${className}`}
        >
            <Text className="text-center text-48rpx font-bold text-green-500 font-[var(--font-primary)] p-0 m-0 leading-tight w-full max-w-full overflow-x-hidden box-border">
                PlayTime
            </Text>
            <Text className="text-center text-36rpx text-green-500 font-[var(--font-primary)] p-0 mt-5rpx w-full max-w-full overflow-x-hidden break-words box-border">
                From Playtime, To Game Time
            </Text>
        </View>
    );
};

export default Header;
