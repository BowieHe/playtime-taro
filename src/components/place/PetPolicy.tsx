import React from 'react';
import { View, Text } from '@tarojs/components';
import { BulbOutlined, FlagOutlined, LocationOutlined, Success } from '@taroify/icons';
import { getPetSizeTranslation, PetSize } from '@/utils/EnumUtil';

interface PetPolicyProps {
    isPetFriendly: boolean;
    petSize: PetSize[];
    petType: string[];
    zone: string[];
}

const PetPolicy: React.FC<PetPolicyProps> = ({ isPetFriendly, petSize, petType, zone }) => {
    return (
        <View className="bg-gray-100 rounded-xl p-4 mb-4">
            <Text className="font-bold mb-3">宠物政策</Text>
            {!isPetFriendly ? (
                <View className="flex items-center mb-3">
                    <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                        <Success size="16" color="#1890ff" />
                    </View>
                    <View>
                        <Text className="text-sm text-gray-500 block">抱歉，此处暂不接待宠物</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <Success size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">欢迎宠物</Text>
                            <Text className="text-sm text-gray-500 block">
                                我们欢迎您携带宠物一同前来
                            </Text>
                        </View>
                    </View>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <FlagOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">体型要求</Text>
                            <Text className="text-sm text-gray-500 block">
                                可携带{petSize.map(size => getPetSizeTranslation(size)).join(',')}
                                及以下的宠物
                            </Text>
                        </View>
                    </View>
                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <BulbOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">品种要求</Text>
                            <Text className="text-sm text-gray-500 block">
                                允许携带的品种：{petType.join(', ')}
                            </Text>
                        </View>
                    </View>
                    <View className="flex items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <LocationOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">活动区域</Text>
                            <Text className="text-sm text-gray-500 block">
                                宠物可在指定区域活动：{zone.join(', ')}
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

export default PetPolicy;
