import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { AtIcon } from 'taro-ui';

// Sample place data type
interface PlaceData {
    id: string;
    name: string;
    type: string;
    rating: number;
    reviewCount: number;
    distance: string;
    latitude: number;
    longitude: number;
    image: string;
    address: string;
    openingHours: string;
    phone: string;
    description: string;
}

// Sample places data - in a real app, this would come from an API
const samplePlacesData: PlaceData[] = [
    {
        id: '1',
        name: '宠物友好咖啡馆',
        type: '咖啡厅',
        rating: 4.8,
        reviewCount: 200,
        distance: '500米',
        latitude: 39.908,
        longitude: 116.402,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        address: '北京市东城区东单大街123号',
        openingHours: '09:00-22:00',
        phone: '12345678910',
        description:
            '这是一家专为宠物主人设计的咖啡馆，提供宠物专属区域和菜单。店内有专门的宠物休息区，配备宠物饮水器和零食。我们的露台区域全年开放，是宠物和主人放松的理想场所。',
    },
    {
        id: '2',
        name: '汪星人宠物餐厅',
        type: '餐厅',
        rating: 4.6,
        reviewCount: 150,
        distance: '800米',
        latitude: 39.91,
        longitude: 116.392,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        address: '北京市西城区西单大街456号',
        openingHours: '10:00-21:00',
        phone: '12345678911',
        description:
            '汪星人宠物餐厅是一家专注于为宠物主人提供高品质餐饮体验的场所。我们提供专门的宠物菜单，所有食材均为有机食材。餐厅内设有宠物游乐区，让您的爱宠可以在用餐时尽情玩耍。',
    },
    // ... other sample places ...
    {
        id: '3',
        name: '猫语花园咖啡',
        type: '咖啡厅',
        rating: 4.7,
        reviewCount: 180,
        distance: '1.2公里',
        latitude: 39.905,
        longitude: 116.4,
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
        address: '北京市朝阳区朝阳门外大街789号',
        openingHours: '08:30-20:00',
        phone: '12345678912',
        description:
            '猫语花园咖啡是猫咪爱好者的天堂。我们有多只店猫常驻，为客人提供与猫咪互动的机会。咖啡厅内环境舒适，提供各类精品咖啡和甜点。我们也欢迎客人携带自己的猫咪前来。',
    },
    {
        id: '4',
        name: '宠爱公园',
        type: '公园',
        rating: 4.5,
        reviewCount: 320,
        distance: '1.5公里',
        latitude: 39.912,
        longitude: 116.395,
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
        address: '北京市海淀区中关村大街101号',
        openingHours: '06:00-23:00',
        phone: '12345678913',
        description:
            '宠爱公园是专为宠物设计的户外活动空间，拥有宽敞的草坪和专门的宠物游乐设施。公园内设有宠物饮水站和休息区，定期举办宠物社交活动和训练课程。',
    },
    {
        id: '5',
        name: '宠物欢乐主题商场',
        type: '商场',
        rating: 4.3,
        reviewCount: 280,
        distance: '2公里',
        latitude: 39.903,
        longitude: 116.41,
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        address: '北京市朝阳区建国路202号',
        openingHours: '10:00-22:00',
        phone: '12345678914',
        description:
            '宠物欢乐主题商场集宠物用品、宠物服务和宠物友好餐厅于一体。商场内有宠物美容店、宠物医院和宠物培训中心，是宠物主人的一站式服务场所。',
    },
];

const PlaceDetail = () => {
    const router = useRouter();
    const { id } = router.params;

    const [currentImage, setCurrentImage] = useState(1);
    const totalImages = 5;
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);

    useEffect(() => {
        // In a real app, you would fetch the place data from an API
        // For this demo, we're using the sample data
        if (id) {
            const place = samplePlacesData.find(p => p.id === id);
            if (place) {
                setPlaceData(place);
            } else {
                // If place not found, use the first one as fallback
                setPlaceData(samplePlacesData[0]);
            }
        } else {
            // If no ID provided, use the first place as default
            setPlaceData(samplePlacesData[0]);
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

    const handlePhoneCall = () => {
        if (placeData?.phone) {
            Taro.makePhoneCall({
                phoneNumber: placeData.phone,
            });
        } else {
            Taro.showToast({
                title: '无可用电话号码',
                icon: 'none',
            });
        }
    };

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
                    src={placeData.image}
                    mode="aspectFill"
                />
                <View
                    className="absolute top-4 left-4 w-9 h-9 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
                    onClick={handleBack}
                >
                    <AtIcon value="chevron-left" size="18" color="#000" />
                </View>
                <View
                    className="absolute top-4 right-4 w-9 h-9 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
                    onClick={handleShare}
                >
                    <AtIcon value="share" size="18" color="#000" />
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
                        <AtIcon value="star-2" size="14" color="#FBBF24" />
                        <Text className="mr-2 ml-1">{placeData.rating}</Text>
                        <Text className="text-gray-500">{placeData.reviewCount}+ 条评价</Text>
                    </View>
                    <Text className="text-gray-500">
                        营业时间: {placeData.openingHours} · 距离您{placeData.distance}
                    </Text>
                </View>

                {/* Pet Policy */}
                <View className="bg-gray-100 rounded-xl p-4 mb-4">
                    <Text className="font-bold mb-3">宠物友好政策</Text>

                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <AtIcon value="check" size="16" color="#1890ff" />
                        </View>
                        <View>
                            <Text className="font-medium">宠物友好场所</Text>
                            <Text className="text-sm text-gray-500 block">欢迎携带宠物入内</Text>
                        </View>
                    </View>

                    <View className="flex items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                            <AtIcon value="pet" size="16" color="#1890ff" />
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
                            <AtIcon value="paw" size="16" color="#1890ff" />
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
                            <AtIcon value="map-pin" size="16" color="#1890ff" />
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
                            <AtIcon value="wifi" size="16" color="#6B7280" className="mr-2" />
                            <Text>免费WiFi</Text>
                        </View>
                        <View className="flex items-center">
                            <AtIcon value="car" size="16" color="#6B7280" className="mr-2" />
                            <Text>停车场</Text>
                        </View>
                        <View className="flex items-center">
                            <AtIcon value="gift" size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物零食</Text>
                        </View>
                        <View className="flex items-center">
                            <AtIcon value="help" size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物饮水区</Text>
                        </View>
                        <View className="flex items-center">
                            <AtIcon value="home" size="16" color="#6B7280" className="mr-2" />
                            <Text>宠物厕所</Text>
                        </View>
                        <View className="flex items-center">
                            <AtIcon value="camera" size="16" color="#6B7280" className="mr-2" />
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
                                <AtIcon key={star} value="star-2" size="14" color="#FBBF24" />
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
                                <AtIcon key={star} value="star-2" size="14" color="#FBBF24" />
                            ))}
                            <AtIcon value="star-2" size="14" color="#D1D5DB" />
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
                                <AtIcon value="map-pin" size="20" color="#fff" />
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
                        <AtIcon value="heart" size="18" color="#6B7280" />
                    </View>
                    <View className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <AtIcon value="share" size="18" color="#6B7280" />
                    </View>
                </View>
                <View className="flex">
                    <View
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
                        onClick={handlePhoneCall}
                    >
                        <AtIcon value="phone" size="16" color="#fff" className="mr-1" />
                        <Text>电话</Text>
                    </View>
                    <View
                        className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
                        onClick={handleNavigation}
                    >
                        <AtIcon value="map-pin" size="16" color="#fff" className="mr-1" />
                        <Text>导航</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default PlaceDetail;
