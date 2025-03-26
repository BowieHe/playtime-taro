import React from 'react';
import { View, Text } from '@tarojs/components';
import { BulbOutlined, FlagOutlined, LocationOutlined, Success } from '@taroify/icons';

interface PetPolicyProps {
    isPetFriendly: boolean;
    petSize: string;
    petType: string;
    zone: string;
}

const PetPolicy: React.FC<PetPolicyProps> = ({ isPetFriendly, petSize, petType, zone }) => {
    return (
        <View className="bg-gray-100 rounded-xl p-4 mb-4">
            <Text className="font-bold mb-3">宠物友好政策</Text>
            {!isPetFriendly ? (
                <View className="flex items-center mb-3">
                    <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                        <Success size="16" color="#1890ff" />
                    </View>
                    <View>
                        <Text className="text-sm text-gray-500 block">暂不支持宠物入内</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <Success size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物友好场所</Text>
                            <Text className="text-sm text-gray-500 block">欢迎携带宠物入内</Text>
                        </View>
                    </View>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <FlagOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物体型限制</Text>
                            <Text className="text-sm text-gray-500 block">
                                允许{petSize}以下的宠物入内
                            </Text>
                        </View>
                    </View>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <BulbOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物品种限制</Text>
                            <Text className="text-sm text-gray-500 block">{petType}</Text>
                        </View>
                    </View>
                    <View className="flex items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <LocationOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物友好区域</Text>
                            <Text className="text-sm text-gray-500 block">{zone}</Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

export default PetPolicy;
