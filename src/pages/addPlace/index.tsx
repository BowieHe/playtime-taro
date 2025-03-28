import React, { useEffect, useState } from 'react';
import { View, Text, Input, Button, Image, Map, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { AddOutlined, ArrowLeft, InfoOutlined, StarOutlined } from '@taroify/icons';
import { reverseGeocode } from '@/service/mapService';
import { AddressComponent, AdInfo } from '@/types/map';
import { AddPlaceRequest, Review } from '@/types/place';
import { addPetFriendlyPlace, addReview } from '@/service/placeService';
import userStore from '@/store/user';
import { MapPinIcon } from '@/utils/icons';

// Types
interface PlaceFormData {
    name: string;
    address: string;
    phone: string;
    description: string;
    isPetFriendly: boolean;
    petAreas: string[];
    petTypeRestrictions: string[];
    petSizeRestrictions: string[];
    requiresLeash: boolean;
    providesPetFood: boolean;
    providesWater: boolean;
    category: string;
    latitude: number;
    longitude: number;
    photos: string[];
    rating: number;
    review: string;
}

const AddPlacePage: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState<PlaceFormData>({
        name: '',
        address: '',
        phone: '',
        description: '',
        isPetFriendly: true,
        petAreas: ['室内区域'],
        petTypeRestrictions: ['无限制'],
        petSizeRestrictions: ['小型宠物', '中型宠物'],
        requiresLeash: true,
        providesPetFood: false,
        providesWater: true,
        category: '咖啡厅',
        latitude: 0,
        longitude: 0,
        photos: [],
        rating: 0,
        review: '',
    });
    const [adInfo, setAdInfo] = useState<AdInfo | null>(null);
    const [addressComponent, setAddresssComponent] = useState<AddressComponent | null>(null);

    useEffect(() => {
        //reverse to get the address info
        const reverse = async (latitude: number, longitude: number) => {
            const result = await reverseGeocode(latitude, longitude);
            console.log('get result from reverse geolocation', result);
            setAdInfo(result.ad_info);
            setAddresssComponent(result.address_component);
            handleInputChange('address', result.address || '未知地址');
        };

        const { latitude, longitude, name } = router.params;

        if (!latitude || !longitude) {
            Taro.showToast({
                title: '无效的地点坐标',
                icon: 'none',
            });
            return;
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        reverse(lat, lng);

        handleInputChange('name', name ? decodeURIComponent(name) : '');
        handleInputChange('latitude', lat);
        handleInputChange('longitude', lng);
    }, []);

    // Handle input changes
    const handleInputChange = (field: keyof PlaceFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Toggle boolean values
    const toggleOption = (field: keyof PlaceFormData) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Handle array option selection (multiple selection allowed)
    const toggleArrayOption = (field: keyof PlaceFormData, option: string) => {
        setFormData(prev => {
            const currentOptions = prev[field] as string[];
            if (currentOptions.includes(option)) {
                return { ...prev, [field]: currentOptions.filter(item => item !== option) };
            } else {
                return { ...prev, [field]: [...currentOptions, option] };
            }
        });
    };

    // Handle single selection options
    const selectSingleOption = (field: keyof PlaceFormData, option: string) => {
        setFormData(prev => ({ ...prev, [field]: [option] }));
    };

    // Set rating
    const setRating = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            // Validate form
            if (!formData.name || !formData.address) {
                Taro.showToast({
                    title: '请填写地点名称和地址',
                    icon: 'none',
                });
                return;
            }

            const place: AddPlaceRequest = {
                name: formData.name,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                adInfo: adInfo,
                addressComponent: addressComponent,
                isPetFriendly: formData.isPetFriendly,
                petSize: formData.petSizeRestrictions.join(','),
                petType: formData.petTypeRestrictions.join(','),
                zone: '',
                description: formData.description,
                category: formData.category,
            };

            // todo)) add user id to identify why create

            const addPromise = addPetFriendlyPlace(place);

            // Add review if contains rating star
            if (formData.rating > 0 || formData.review.length > 0) {
                console.log('contains review, upload');
                addPromise.then(result => {
                    console.log('finish add place with res:', result);
                    const user = userStore.getUser();
                    // todo)) add pet id in review?
                    const review: Review = {
                        placeId: result.id,
                        userId: user.id ? user.id : '',
                        username: user.nickName,
                        userAvatar: user.avatarUrl,
                        rating: formData.rating,
                        content: formData.review,
                        date: new Date(),
                    };
                    // TODO: Implement review submission
                    console.log('Review to submit:', review);
                    addReview(review);
                });
            }

            // Show success message
            Taro.showToast({
                title: '地点添加成功！',
                icon: 'success',
            });

            // Navigate back after a short delay
            setTimeout(() => {
                Taro.navigateBack();
            }, 1500);
        } catch (error) {
            console.error('Error submitting location:', error);
            Taro.showToast({
                title: '提交失败，请重试',
                icon: 'none',
            });
        }
    };

    // Go back to previous page
    const handleBack = () => {
        Taro.navigateBack();
    };

    return (
        <View className="flex flex-col min-h-screen bg-gray-50 overflow-hidden max-w-screen-md mx-auto w-full">
            {/* Header */}
            <View className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <View className="flex items-center">
                    <View className="mr-2" onClick={handleBack}>
                        <ArrowLeft size={20} color="#000" />
                    </View>
                    <Text className="text-lg font-bold">添加地点</Text>
                </View>
                <View>
                    <InfoOutlined size={20} color="#666" />
                </View>
            </View>

            {/* Main Content - Scrollable */}
            <ScrollView scrollY className="flex-1 p-4 pb-24">
                {/* 位置信息 */}
                <View className="mb-6">
                    <Text className="block font-bold mb-3 text-gray-700">位置信息</Text>

                    {/* Map Preview */}
                    <View className="relative h-44 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <Map
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            scale={15}
                            showLocation
                            markers={[
                                {
                                    id: 1,
                                    latitude: formData.latitude,
                                    longitude: formData.longitude,
                                    iconPath: MapPinIcon,
                                    width: 30,
                                    height: 30,
                                },
                            ]}
                            style="width: 100%; height: 100%;"
                            onError={console.error}
                        />
                    </View>

                    <Input
                        className="w-full mb-3 bg-gray-100 px-4 py-3 rounded-lg"
                        value={formData.name}
                        onInput={e => handleInputChange('name', e.detail.value)}
                        placeholder="地点名称"
                        placeholderClass="text-gray-400"
                    />

                    <Input
                        className="w-full mb-3 bg-gray-100 px-4 py-3 rounded-lg"
                        value={formData.address}
                        onInput={e => handleInputChange('address', e.detail.value)}
                        placeholder="地址"
                        placeholderClass="text-gray-400"
                    />

                    <Input
                        className="w-full bg-gray-100 px-4 py-3 rounded-lg"
                        value={formData.phone}
                        onInput={e => handleInputChange('phone', e.detail.value)}
                        placeholder="联系电话"
                        placeholderClass="text-gray-400"
                        type="number"
                    />
                </View>

                {/* 宠物友好设置 */}
                <View className="mb-6">
                    <Text className="block font-bold mb-3 text-gray-700">宠物友好设置</Text>

                    {/* 是否宠物友好 */}
                    <View className="flex items-center justify-between mb-4 p-2">
                        <Text className="text-gray-700">是否宠物友好</Text>
                        <View
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                formData.isPetFriendly ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            onClick={() => toggleOption('isPetFriendly')}
                        >
                            <View
                                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out ${
                                    formData.isPetFriendly ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                            />
                        </View>
                    </View>

                    {/* 宠物友好区域 */}
                    <View className="mb-4">
                        <Text className="block text-sm font-medium mb-2 text-gray-700">
                            宠物友好区域
                        </Text>
                        <View className="flex flex-wrap gap-2">
                            {['室内区域', '室外区域', '专属区域', '全场开放'].map(option => (
                                <View
                                    key={option}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm ${
                                        formData.petAreas.includes(option)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => toggleArrayOption('petAreas', option)}
                                >
                                    {option}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 宠物品种限制 */}
                    <View className="mb-4">
                        <Text className="block text-sm font-medium mb-2 text-gray-700">
                            宠物品种限制
                        </Text>
                        <View className="flex flex-wrap gap-2">
                            {['无限制', '仅限犬类', '仅限猫类', '其他限制'].map(option => (
                                <View
                                    key={option}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm ${
                                        formData.petTypeRestrictions.includes(option)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() =>
                                        selectSingleOption('petTypeRestrictions', option)
                                    }
                                >
                                    {option}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 宠物体型限制 */}
                    <View className="mb-4">
                        <Text className="block text-sm font-medium mb-2 text-gray-700">
                            宠物体型限制
                        </Text>
                        <View className="flex flex-wrap gap-2">
                            {['小型宠物', '中型宠物', '大型宠物'].map(option => (
                                <View
                                    key={option}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm ${
                                        formData.petSizeRestrictions.includes(option)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => toggleArrayOption('petSizeRestrictions', option)}
                                >
                                    {option}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 附加信息 */}
                <View className="mb-6">
                    <Text className="block font-bold mb-3 text-gray-700">附加信息</Text>

                    {/* 宠物需要牵绳 */}
                    <View className="flex items-center justify-between mb-4 p-2">
                        <Text className="text-gray-700">宠物需要牵绳</Text>
                        <View
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                formData.requiresLeash ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            onClick={() => toggleOption('requiresLeash')}
                        >
                            <View
                                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out ${
                                    formData.requiresLeash ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                            />
                        </View>
                    </View>

                    {/* 提供宠物餐点 */}
                    <View className="flex items-center justify-between mb-4 p-2">
                        <Text className="text-gray-700">提供宠物餐点</Text>
                        <View
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                formData.providesPetFood ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            onClick={() => toggleOption('providesPetFood')}
                        >
                            <View
                                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out ${
                                    formData.providesPetFood ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                            />
                        </View>
                    </View>

                    {/* 宠物饮水设施 */}
                    <View className="flex items-center justify-between mb-4 p-2">
                        <Text className="text-gray-700">宠物饮水设施</Text>
                        <View
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                formData.providesWater ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            onClick={() => toggleOption('providesWater')}
                        >
                            <View
                                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out ${
                                    formData.providesWater ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                            />
                        </View>
                    </View>

                    {/* 所属分类 */}
                    <View className="mb-4">
                        <Text className="block text-sm font-medium mb-2 text-gray-700">
                            所属分类
                        </Text>
                        <View className="flex flex-wrap gap-2">
                            {['餐厅', '咖啡厅', '公园', '酒店', '商场', '宠物店'].map(option => (
                                <View
                                    key={option}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm ${
                                        formData.category === option
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => handleInputChange('category', option)}
                                >
                                    {option}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 地点描述 */}
                    <Textarea
                        className="w-full bg-gray-100 p-3 rounded-lg h-24"
                        value={formData.description}
                        onInput={e => handleInputChange('description', e.detail.value)}
                        placeholder="地点描述（可选）"
                        placeholderClass="text-gray-400"
                    />
                </View>

                {/* 添加照片 */}
                <View className="mb-6">
                    <Text className="block font-bold mb-3 text-gray-700">添加照片</Text>
                    <View className="flex">
                        <View className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                            <AddOutlined size={24} color="#999" />
                        </View>
                        {formData.photos.map((photo, index) => (
                            <Image
                                key={index}
                                src={photo}
                                className="w-20 h-20 rounded-lg mr-2 object-cover"
                                mode="aspectFill"
                            />
                        ))}
                    </View>
                </View>

                {/* 您的评价 */}
                <View className="mb-6">
                    <Text className="block font-bold mb-3 text-gray-700">您的评价</Text>
                    <View className="flex mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <View key={star} onClick={() => setRating(star)}>
                                <StarOutlined
                                    size={24}
                                    color={star <= formData.rating ? '#FBBF24' : '#D1D5DB'}
                                />
                            </View>
                        ))}
                    </View>
                    <Textarea
                        className="w-full bg-gray-100 p-3 rounded-lg h-24"
                        value={formData.review}
                        onInput={e => handleInputChange('review', e.detail.value)}
                        placeholder="分享您的体验（可选）"
                        placeholderClass="text-gray-400"
                    />
                </View>
            </ScrollView>

            {/* Submit Button - Fixed at Bottom */}
            <View className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <Button
                    className="w-full bg-green-500 text-white rounded-full py-3 flex items-center justify-center"
                    onClick={handleSubmit}
                >
                    提交地点
                </Button>
            </View>
        </View>
    );
};

export default AddPlacePage;
