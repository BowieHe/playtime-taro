import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
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

import { getPlaceById } from '@/service/mapService';
import { Review } from '@/types/location';
import { sampleUserReviews } from '@/constants/SampleData';
import UserReviews from '@/components/place/UserReviews';
import Facilities from '@/components/place/Facilities';

const PlaceDetail = () => {
    const router = useRouter();
    const { id } = router.params;

    const [currentImage, setCurrentImage] = useState(1);
    const [reviews, setReviews] = useState<Review[]>([]);
    const totalImages = 5;
    const [placeData, setPlaceData] = useState<PetFriendlyPlace | null>(null);

    useEffect(() => {
        const fetchPlaceData = async (id: string) => {
            // In a real app, you would fetch the place data from an API
            // For this demo, we're using the sample data
            try {
                // if (id) {
                if (id === '') {
                    Taro.showToast({
                        title: '无效的场所 ID',
                        icon: 'none',
                    });
                    console.error('no id passed');
                    Taro.navigateBack();
                    return;
                }
                const place = await getPlaceById(id);
                if (place) {
                    setPlaceData(place);
                }
                // else {
                //     // If place not found, use the first one as fallback
                //     setPlaceData(samplePetFriendlyPlaces[0]);
                // }
                // } else {
                //     // If no ID provided, use the first place as default
                //     setPlaceData(samplePetFriendlyPlaces[0]);
                // }
            } catch (error) {
                console.error('Failed to fetch place data:', error);
                setPlaceData(samplePetFriendlyPlaces[0]);
            }
        };

        const fetchReviews = async (id: string) => {
            // todo)) fetch reviews
            if (id == '') {
                return;
            }
            setReviews(sampleUserReviews);
        };

        fetchPlaceData(id?.toString() || '');
        fetchReviews(id?.toString() || '');
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

                <Facilities
                    wifi={true}
                    parking={true}
                    petSnacks={true}
                    PetToys={true}
                    PetToilet={true}
                />

                <UserReviews reviews={reviews} />

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
