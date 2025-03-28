import { View, Text, Image } from '@tarojs/components';
import React from 'react';
import RatingStars from '../RatingStars';
import { Review } from '@/types/place';

interface UserReviewProps {
    reviews: Review[];
}

const UserReviews: React.FC<UserReviewProps> = ({ reviews }) => {
    return (
        <View>
            {reviews.map(review => (
                <View className="mb-6">
                    <View className="flex justify-between items-center mb-3">
                        <Text className="text-lg font-bold">用户评价</Text>
                        <Text className="text-blue-500 text-sm">查看全部</Text>
                    </View>

                    <View className="mb-4">
                        <View className="flex mb-2">
                            <Image
                                src={review.userAvatar}
                                className="w-10 h-10 rounded-full mr-3"
                                mode="aspectFill"
                            />
                            <View>
                                <Text className="font-medium">{review.username}</Text>
                                <Text className="text-xs text-gray-500">
                                    {review.date.toISOString()}
                                </Text>
                            </View>
                        </View>
                        <RatingStars rating={review.rating} />
                        <Text className="text-sm">{review.content}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default UserReviews;
