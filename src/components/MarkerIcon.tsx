import React, { ReactNode } from 'react';
import { View } from '@tarojs/components';

interface MarkerIconProps {
    children: ReactNode;
    color?: string;
}

const MarkerIcon: React.FC<MarkerIconProps> = ({ children, color = 'text-green-500' }) => {
    return (
        <View className={`relative flex justify-center items-center`}>
            <View
                className={`w-9 h-9 bg-white rounded-full flex justify-center items-center shadow-md ${color}`}
            >
                {children}
            </View>
            {/* Pointed bottom of the marker */}
            <View
                className="absolute -bottom-1.5 left-1/2 w-0 h-0 transform -translate-x-1/2"
                style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '8px solid white',
                }}
            />
        </View>
    );
};

export default MarkerIcon;
