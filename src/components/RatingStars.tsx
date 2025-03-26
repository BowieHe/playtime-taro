import { View } from '@tarojs/components';
import { Star, StarOutlined } from '@taroify/icons';

const RatingStars = ({ rating }) => {
    const totalStars = 5; // 总星星数
    const fullStars = Math.floor(rating); // 满星数量
    // const hasHalfStar = rating % 1 !== 0; // 是否有半星

    return (
        <View className="flex mb-1">
            {[...Array(totalStars)].map((_, index) => {
                if (index < fullStars) {
                    // 满星
                    return <Star key={index} size="14" color="#FBBF24" />;
                } else {
                    // 空星
                    return <StarOutlined key={index} size="14" color="#D1D5DB" />;
                }
            })}
        </View>
    );
};

export default RatingStars;
