import React from 'react';
import { View, Text } from '@tarojs/components';

interface HeaderProps {
    className?: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ className = '', children }) => {
    return (
        <View className={`flex flex-col text-center ${className}`}>
            {children || (
                <>
                    <Text className="text-48rpx font-bold text-[#22c55e] block font-[var(--font-primary)]">
                        PlayTime
                    </Text>
                    <Text className="text-36rpx opacity-80 mt-0.5 block text-[#22c55e] font-[var(--font-primary)]">
                        from playtime to game time
                    </Text>
                </>
            )}
        </View>
    );
};

export default Header;
