import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Pet } from '@/types/pet';

interface PetCardProps {
    pet: Pet;
    onClick?: () => void;
    className?: string;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick, className = '' }) => {
    return (
        <View
            className={`bg-white dark:bg-[#181818] rounded-2xl overflow-hidden h-[280px] shadow-md relative ${className}`}
            onClick={onClick}
        >
            {/* Pet image */}
            <View className="absolute top-0 left-0 w-full h-full z-10">
                <Image
                    className="w-full h-full object-cover"
                    src={pet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'}
                    mode="aspectFill"
                />
            </View>

            {/* Gradient overlay */}
            <View className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-black/80 via-black/70 to-black/0 z-20"></View>

            {/* Gender and breed */}
            <View className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-lg py-1 px-2 text-white text-sm flex items-center z-30">
                <View className="mr-1.5">
                    <Text className={pet.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}>
                        {pet.gender === 'male' ? '♂' : '♀'}
                    </Text>
                </View>
                <Text>{pet.breed || '未知'}</Text>
            </View>

            {/* Pet info */}
            <View className="absolute bottom-0 left-0 w-full p-3 text-white z-30">
                <Text className="text-lg font-semibold mb-1.5 text-white">{pet.name}</Text>
                <View className="flex flex-wrap gap-2 mb-1.5">
                    <View className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs flex items-center">
                        <Text className="text-[#4ade80] mr-1">🎂</Text>
                        <Text>{pet.age || '?'}岁</Text>
                    </View>
                    <View className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs flex items-center">
                        <Text className="text-[#4ade80] mr-1">⚖️</Text>
                        <Text>{pet.size || '未知'}</Text>
                    </View>
                </View>
                <Text className="text-sm line-clamp-2 text-white/90">{pet.desc || '暂无介绍'}</Text>
                <View className="flex items-center text-xs mt-2 text-white/80">
                    <Text className="text-[#4ade80] mr-1">🕒</Text>
                    {/* todo)) add pet last time activities in future */}
                    <Text>最近出行: {'未知'}</Text>
                </View>
            </View>
        </View>
    );
};

export default PetCard;
