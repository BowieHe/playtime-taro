import React from 'react';
import { View, Text, Image } from '@tarojs/components';
// Remove CSS import since we're using Tailwind
import { Pet } from '@/types/pet';

interface PetCardProps {
    pet: Pet;
    onClick?: (pet: Pet) => void;
    className?: string;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick, className = '' }) => {
    const handleClick = () => {
        if (onClick) onClick(pet);
    };

    // Get appropriate size text for display
    const getSizeText = (size: string) => {
        switch (size) {
            case 'small':
                return '小型';
            case 'medium':
                return '中型';
            case 'large':
                return '大型';
            default:
                return '未知';
        }
    };

    // Get appropriate gender text and icon
    const getGenderDisplay = (gender: string) => {
        if (gender === 'male') {
            return { text: '公', icon: '♂', class: 'bg-blue-500' }; // Using Tailwind blue for male
        } else {
            return { text: '母', icon: '♀', class: 'bg-pink-500' }; // Using pink for female
        }
    };

    const genderInfo = getGenderDisplay(pet.gender);

    return (
        <View
            className={`w-full aspect-[4/1.8] rounded-24rpx shadow mb-16rpx relative overflow-hidden ${className}`}
            onClick={handleClick}
            hoverClass="transform scale-[0.98] shadow-sm"
        >
            {/* Image that fills the entire card */}
            <View className="w-full h-full ounded-24rpx overflow-hidden">
                <Image
                    className="w-full h-full object-cover"
                    src={
                        pet.avatar ||
                        'https://img0.baidu.com/it/u=3573977864,2649121334&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
                    }
                    mode="aspectFill"
                />
            </View>

            {/* Dark overlay gradient */}
            <View className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70"></View>

            {/* Gender and breed in top right corner */}
            <View className="absolute top-16rpx right-16rpx flex flex-col items-end gap-8rpx">
                <View
                    className={`w-32rpx h-32rpx rounded-full flex justify-center items-center font-bold text-white ${genderInfo.class}`}
                >
                    {genderInfo.icon}
                </View>

                {pet.breed && (
                    <View className="bg-black/40 backdrop-blur-sm px-10rpx py-4rpx rounded-md-rpx">
                        <Text className="text-14rpx text-white font-medium">{pet.breed}</Text>
                    </View>
                )}
            </View>

            {/* Pet info on the overlay */}
            <View className="absolute bottom-0 left-0 right-0 p-16rpx z-10">
                <Text className="text-32rpx font-bold text-white mb-8rpx">{pet.name}</Text>

                <View className="flex flex-wrap gap-8rpx mb-8rpx">
                    {pet.age !== undefined && (
                        <View className="bg-white/20 backdrop-blur-sm px-10rpx py-4rpx rounded-md-rpx">
                            <Text className="text-16rpx text-white">{pet.age} 岁</Text>
                        </View>
                    )}
                    <View className="bg-white/20 backdrop-blur-sm px-10rpx py-4rpx rounded-md-rpx">
                        <Text className="text-16rpx text-white">{getSizeText(pet.size)}</Text>
                    </View>
                </View>

                {pet.desc && (
                    <Text className="text-18rpx text-white/90 leading-normal overflow-hidden text-ellipsis line-clamp-1">
                        {pet.desc}
                    </Text>
                )}
            </View>
        </View>
    );
};

export default PetCard;
