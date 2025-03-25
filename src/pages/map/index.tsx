import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, Map, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MapProps } from '@tarojs/components/types/Map';
import SettingIcon from '@/assets/settings.png';
import SearchIcon from '@/assets/search.png';
import LocationIcon from '@/assets/location.png';
import ChevronUp from '@/assets/chevron-up.png';

const MapPage: React.FC = () => {
    const [location, setLocation] = useState({ latitude: 39.908, longitude: 116.397 });
    const [markers, setMarkers] = useState<MapProps.marker[]>([]);
    const [activeFilter, setActiveFilter] = useState('全部');
    const [placesFound, setPlacesFound] = useState(3);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Create ref for map context
    const mapContext = useRef<any>(null);

    const filters = ['全部', '餐厅', '咖啡厅', '公园', '酒店', '商场', '宠物店'];

    useEffect(() => {
        // Initialize map data
        initializeMap();
    }, []);

    const initializeMap = () => {
        console.log('Initializing map...');
        Taro.showLoading({ title: '加载地图中...' });

        Taro.getLocation({
            type: 'gcj02',
            success: function (res) {
                console.log('Got location:', res);
                // Set initial location
                setLocation({
                    latitude: res.latitude,
                    longitude: res.longitude,
                });

                // Create demo markers with valid coordinates
                const demoMarkers: MapProps.marker[] = [];
                setMarkers(demoMarkers);

                setMapLoaded(true);
                Taro.hideLoading();

                // Initialize map context after a delay
                setTimeout(() => {
                    try {
                        const mapCtx = Taro.createMapContext('petFriendlyMap');
                        mapContext.current = mapCtx;
                    } catch (err) {
                        console.error('Failed to get map context:', err);
                    }
                }, 500);
            },
            fail: function (err) {
                console.error('Failed to get location:', err);
                // Set default location if can't get user location
                setMapLoaded(true);
                Taro.hideLoading();
                Taro.showToast({
                    title: '无法获取位置，使用默认位置',
                    icon: 'none',
                });
            },
        });
    };

    const onFilterSelect = filter => {
        setActiveFilter(filter);
        // In a real app, you would filter markers based on the selected category
    };

    const moveToCurrentLocation = () => {
        if (!mapContext.current) {
            console.log('Map context not available');
            return;
        }

        Taro.getLocation({
            type: 'gcj02',
            success: function (res) {
                // Move map to current location using map context
                mapContext.current.moveToLocation({
                    latitude: res.latitude,
                    longitude: res.longitude,
                });
            },
            fail: function (err) {
                console.error('Failed to get location:', err);
                Taro.showToast({
                    title: '无法获取位置',
                    icon: 'none',
                });
            },
        });
    };

    const showPlacesList = () => {
        Taro.showToast({
            title: '这里将显示场所列表',
            icon: 'none',
        });
    };

    return (
        <View className="flex flex-col h-screen w-screen bg-white overflow-hidden fixed inset-0">
            {/* Header */}
            {/* <View className="flex justify-between items-center px-4 py-2 bg-white h-11 z-10 flex-shrink-0 shadow">
                <Text className="text-lg font-bold">宠物友好地图</Text>
            </View> */}

            <View className="flex flex-row items-center justify-between px-4 mt-4">
                {/* Search bar - will take most of the space but not all */}
                <View className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow">
                    <Image src={SearchIcon} className="w-5 h-5 mr-2" mode="aspectFit" />
                    <Input
                        type="text"
                        placeholder="搜索宠物友好的场所"
                        className="flex-1 text-sm outline-none"
                    />
                </View>

                {/* Setting icon - right aligned with proper spacing */}
                <View className="ml-2 w-10 h-10 bg-white rounded-full flex justify-center items-center">
                    <Image src={SettingIcon} className="w-5 h-5" mode="aspectFit" />
                </View>
            </View>

            {/* Filter Bar */}
            <View className="flex overflow-x-auto px-4 py-2 bg-white whitespace-nowrap z-20 flex-shrink-0">
                {filters.map(filter => (
                    <View
                        key={filter}
                        className={`inline-block px-3 py-1.5 rounded-full mr-2 text-xs ${
                            activeFilter === filter
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                        onClick={() => onFilterSelect(filter)}
                    >
                        {filter}
                    </View>
                ))}
            </View>

            {/* Map Container */}
            <View className="flex-1 relative z-5">
                {mapLoaded && (
                    <View className="absolute inset-0" style={{ height: 'calc(100% - 30px)' }}>
                        <Map
                            id="petFriendlyMap"
                            style={{ width: '100%', height: '100%' }}
                            longitude={location.longitude}
                            latitude={location.latitude}
                            markers={markers}
                            scale={14}
                            showLocation
                            enableScroll={true}
                            enableRotate={false}
                            enableSatellite={false}
                            enableTraffic={false}
                            onError={e => console.error('Map error:', e)}
                            includePoints={[]}
                            setting={{
                                gestureEnable: 1,
                                showCompass: 0,
                                showScale: 0,
                                tiltGesturesEnabled: 0,
                                rotateGesturesEnabled: 0,
                            }}
                        />
                    </View>
                )}

                {/* Location Button */}
                <View
                    className="absolute bottom-10 right-5 w-10 h-10 bg-white rounded-full flex justify-center items-center 
                               shadow z-30"
                    onClick={moveToCurrentLocation}
                >
                    <Image src={LocationIcon} className="w-5 h-5" mode="aspectFit" />
                </View>
            </View>

            {/* Places List Entrance */}
            <View
                className="h-15 bg-white flex items-center px-4 border-t border-gray-100 z-10 flex-shrink-0 absolute 
                           bottom-0 left-0 right-0"
                onClick={showPlacesList}
            >
                <View className="bg-gray-100 rounded-full px-4 py-2 flex items-center justify-between w-full">
                    <Text className="text-gray-800 text-sm">
                        附近发现{placesFound}个宠物友好场所
                    </Text>
                    <Image src={ChevronUp} className="w-4 h-4 text-gray-800" mode="aspectFit" />
                </View>
            </View>
        </View>
    );
};

export default MapPage;
