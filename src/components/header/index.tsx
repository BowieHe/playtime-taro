import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.css';

interface HeaderProps {
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    return (
        <View className={`header ${className}`}>
            <Text className="logo">PlayTime</Text>
            <Text className="slogan">From Playtime, To Game Time</Text>
        </View>
    );
};

export default Header;
