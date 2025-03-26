import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
// Use our centralized icons file instead of direct imports
// import {
//     ArrowLeft,
//     Share,
//     Star,
//     Success,
//     Location,
//     Phone,
//     Photo,
//     // Keeping these as is per user request
//     FaWifi,
//     FaHeart,
//     FaCarCrash,
//     GiOpenedFoodCan,
//     MdPets,
//     MdLocalDrink,
//     PiToiletPaper,
// } from '@/utils/icons';
import { PetFriendlyPlace } from '@/types/location';
import { samplePetFriendlyPlaces, samplePicture } from '@/constants/SampleData';
import {
    ArrowLeft,
    BulbOutlined,
    FlagOutlined,
    GiftCardOutlined,
    HomeOutlined,
    LocationOutlined,
    Logistics,
    ServiceOutlined,
    Share,
    SmileCommentOutlined,
    Star,
    Success,
    VideoOutlined,
    Location,
    LikeOutlined,
    PhoneOutlined,
} from '@taroify/icons';

// Sample place data type
// interface PlaceData {
//     id: string;
//     name: string;
//     type: string;
//     rating: number;
//     reviewCount: number;
//     distance: string;
//     latitude: number;
//     longitude: number;
//     image: string;
//     address: string;
//     openingHours: string;
//     phone: string;
//     description: string;
// }

// Sample places data - in a real app, this would come from an API

const PlaceDetail = () => {
    const router = useRouter();
    const { id } = router.params;

    const [currentImage, setCurrentImage] = useState(1);
    const totalImages = 5;
    const [placeData, setPlaceData] = useState<PetFriendlyPlace | null>(null);

    useEffect(() => {
        // In a real app, you would fetch the place data from an API
        // For this demo, we're using the sample data
        if (id) {
            const place = samplePetFriendlyPlaces.find(p => p.id === id);
            if (place) {
                setPlaceData(place);
            } else {
                // If place not found, use the first one as fallback
                setPlaceData(samplePetFriendlyPlaces[0]);
            }
        } else {
            // If no ID provided, use the first place as default
            setPlaceData(samplePetFriendlyPlaces[0]);
        }
    }, [id]);

    const handleBack = () => {
        Taro.navigateBack();
    };

    const handleShare = () => {
        Taro.showShareMenu({
            withShareTicket: true,
        });
    };

    // const handlePhoneCall = () => {
    //     if (placeData?.phone) {
    //         Taro.makePhoneCall({
    //             phoneNumber: placeData.phone,
    //         });
    //     } else {
    //         Taro.showToast({
    //             title: '无可用电话号码',
    //             icon: 'none',
    //         });
    //     }
    // };

    const handleNavigation = () => {
        if (placeData) {
            Taro.openLocation({
                latitude: placeData.latitude,
                longitude: placeData.longitude,
                name: placeData.name,
                address: placeData.address,
            });
        }
    };

    if (!placeData) {
        return (
            <View className="flex items-center justify-center h-screen">
                <Text>加载中...</Text>
            </View>
        );
    }

    return (
        <View className="flex flex-col min-h-screen">
            {/* Place Header Image */}
            <View className="relative h-64">
                <Image
                    className="w-full h-full object-cover"
                    src={placeData.photos?.[0] || samplePicture}
                    mode="aspectFill"
                />
                <View
                    className="absolute top-4 left-4 w-9 h-9 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
                    onClick={handleBack}
                >
                    <ArrowLeft size="18" color="#000" />
                </View>
                <View
                    className="absolute top-4 right-4 w-9 h-9 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
                    onClick={handleShare}
                >
                    <Share size="18" color="#000" />
                </View>
                <View className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded-xl text-xs">
                    {currentImage}/{totalImages}
                </View>
            </View>

            {/* Main Content Area */}
            <ScrollView scrollY className="flex-1 p-4 pb-24">
                <View className="mb-4">
                    <Text className="text-xl font-bold block mb-2">{placeData.name}</Text>
                    <View className="flex items-center mb-2">
                        <Star size="14" color="#FBBF24" />
                        <Text className="mr-2 ml-1">{placeData.rating}</Text>
                        <Text className="text-gray-500">{placeData.reviews}+ 条评价</Text>
                    </View>
                    <Text className="text-gray-500">
                        营业时间: "8:00-20:00" · 距离您{placeData.distance}
                    </Text>
                </View>

                {/* Pet Policy */}
                <View className="bg-gray-100 rounded-xl p-4 mb-4">
                    <Text className="font-bold mb-3">宠物友好政策</Text>

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
                                允许小型犬和中型犬，大型犬需提前预约
                            </Text>
                        </View>
                    </View>

                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <BulbOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物品种限制</Text>
                            <Text className="text-sm text-gray-500 block">
                                无品种限制，需保持宠物清洁
                            </Text>
                        </View>
                    </View>

                    <View className="flex items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <LocationOutlined size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物友好区域</Text>
                            <Text className="text-sm text-gray-500 block">
                                室外露台和指定室内区域
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Place Description */}
                <View className="mb-6">
                    <Text className="text-lg font-bold mb-3">场所介绍</Text>
                    <Text className="text-gray-700">{placeData.description}</Text>
                </View>

                {/* Facilities */}
                <View className="mb-6">
                    <Text className="text-lg font-bold mb-3">设施服务</Text>
                    <View className="grid grid-cols-2 gap-2">
                        <View className="flex items-center">
                            <ServiceOutlined size="16" color="#6B7280" className="mr-2" />
                            <Text>免费WiFi</Text>
                        </View>
                        <View className="flex items-center">
                            <Logistics size="16" color="#6B7280" className="mr-2" />
                            <Text>停车场</Text>
                        </View>
                        <View className="flex items-center">
                            <GiftCardOutlined size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物零食</Text>
                        </View>
                        <View className="flex items-center">
                            <HomeOutlined size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物饮水区</Text>
                        </View>
                        <View className="flex items-center">
                            <SmileCommentOutlined size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物厕所</Text>
                        </View>
                        <View className="flex items-center">
                            <VideoOutlined size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物拍照区</Text>
                        </View>
                    </View>
                </View>

                {/* User Reviews */}
                <View className="mb-6">
                    <View className="flex justify-between items-center mb-3">
                        <Text className="text-lg font-bold">用户评价</Text>
                        <Text className="text-blue-500 text-sm">查看全部</Text>
                    </View>

                    <View className="mb-4">
                        <View className="flex mb-2">
                            <Image
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                                className="w-10 h-10 rounded-full mr-3"
                                mode="aspectFill"
                            />
                            <View>
                                <Text className="font-medium">李小花</Text>
                                <Text className="text-xs text-gray-500">2023-05-15</Text>
                            </View>
                        </View>
                        <View className="flex mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size="14" color="#FBBF24" />
                            ))}
                        </View>
                        <Text className="text-sm">
                            带我家金毛来这里，服务很好，有专门的宠物区域，还提供宠物零食。店员很友好，会主动和狗狗互动。
                        </Text>
                    </View>

                    <View>
                        <View className="flex mb-2">
                            <Image
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                                className="w-10 h-10 rounded-full mr-3"
                                mode="aspectFill"
                            />
                            <View>
                                <Text className="font-medium">王大壮</Text>
                                <Text className="text-xs text-gray-500">2023-05-10</Text>
                            </View>
                        </View>
                        <View className="flex mb-1">
                            {[1, 2, 3, 4].map(star => (
                                <Star key={star} size="14" color="#FBBF24" />
                            ))}
                            <Star size="14" color="#D1D5DB" />
                        </View>
                        <Text className="text-sm">
                            环境不错，我家猫咪很喜欢这里。就是周末人有点多，建议提前预约。
                        </Text>
                    </View>
                </View>

                {/* Location */}
                <View>
                    <Text className="text-lg font-bold mb-3">位置信息</Text>
                    <View className="bg-gray-100 h-40 rounded-lg mb-2 relative">
                        <Image
                            src="https://mdn.alipayobjects.com/huamei_p0cigc/afts/img/A*_qQ9QJTyQrUAAAAAAAAAAAAADuJ6AQ/original"
                            className="w-full h-full object-cover rounded-lg"
                            mode="aspectFill"
                        />
                        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <View className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                <Location size="20" color="#fff" />
                            </View>
                        </View>
                    </View>
                    <Text className="text-gray-700">{placeData.address}</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="fixed bottom-0 left-0 right-0 bg-white p-3 flex justify-between items-center border-t border-gray-100">
                <View className="flex items-center">
                    <View className="mr-3 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <LikeOutlined size="18" color="#6B7280" />
                    </View>
                    <View className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Share size="18" color="#6B7280" />
                    </View>
                </View>
                <View className="flex">
                    <View
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
                        // onClick={handlePhoneCall}
                    >
                        <PhoneOutlined size="16" color="#fff" className="mr-1" />
                        <Text>电话</Text>
                    </View>
                    <View
                        className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
                        onClick={handleNavigation}
                    >
                        <Location size="16" color="#fff" className="mr-1" />
                        <Text>导航</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default PlaceDetail;
