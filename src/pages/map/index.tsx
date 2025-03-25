import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, Map, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MapProps } from '@tarojs/components/types/Map';
import SettingIcon from '@/assets/settings.png';
import SearchIcon from '@/assets/search.png';
import LocationIcon from '@/assets/location.png';
import { AtIcon } from 'taro-ui';

// Define a type for our place data
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
}

const MapPage: React.FC = () => {
    const [location, setLocation] = useState({ latitude: 39.908, longitude: 116.397 });
    const [markers, setMarkers] = useState<MapProps.marker[]>([]);
    const [activeFilter, setActiveFilter] = useState('全部');
    const [places, setPlaces] = useState<PlaceData[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<PlaceData[]>([]);
    const [showPlacesList, setShowPlacesList] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Create ref for map context
    const mapContext = useRef<any>(null);

    const filters = ['全部', '餐厅', '咖啡厅', '公园', '酒店', '商场', '宠物店'];

    // Sample place data
    const samplePlaces: PlaceData[] = [
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
        },
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
        },
    ];

    useEffect(() => {
        // Initialize map data
        initializeMap();
    }, []);

    // Update filtered places when filter changes
    useEffect(() => {
        filterPlaces(activeFilter);
    }, [activeFilter, places]);

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

                // Set sample places
                setPlaces(samplePlaces);

                // Create markers from sample places
                createMarkersFromPlaces(samplePlaces);

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

                // Still set the sample places and markers
                setPlaces(samplePlaces);
                createMarkersFromPlaces(samplePlaces);
            },
        });
    };

    const createMarkersFromPlaces = (placesData: PlaceData[]) => {
        if (!placesData.length) return;

        // Create valid marker objects with required properties
        const newMarkers = placesData.map(place => {
            // Ensure the iconPath exists and is valid
            const iconPath = getMarkerIcon(place.type);

            return {
                id: Number(place.id),
                latitude: place.latitude,
                longitude: place.longitude,
                width: 35,
                height: 35,
                iconPath: iconPath,
                alpha: 1,
                callout: {
                    content: place.name,
                    color: '#000000',
                    fontSize: 14,
                    borderRadius: 4,
                    bgColor: '#ffffff',
                    padding: 8,
                    display: 'BYCLICK', // This is already cast correctly
                    // Change this:
                    // textAlign: 'center',
                    // To this:
                    textAlign: 'center' as 'center', // Specify the exact literal type
                    anchorY: 1,
                    anchorX: 0.5,
                    borderWidth: 1,
                    borderColor: '#000000',
                },
            };
        });

        // Cast the entire array to satisfy TypeScript
        setMarkers(newMarkers as MapProps.marker[]);
        console.log('Created markers:', newMarkers);
    };

    const getMarkerIcon = (placeType: string): string => {
        // For testing, you can use a default marker first to ensure it works
        const defaultMarker = 'https://cdn-icons-png.flaticon.com/128/684/684908.png';

        // Make sure these icon URLs are accessible and valid
        try {
            switch (placeType) {
                case '餐厅':
                    return 'https://cdn-icons-png.flaticon.com/64/562/562678.png';
                case '咖啡厅':
                    return 'https://cdn-icons-png.flaticon.com/64/1047/1047503.png';
                case '公园':
                    return 'https://cdn-icons-png.flaticon.com/64/616/616494.png';
                case '酒店':
                    return 'https://cdn-icons-png.flaticon.com/64/2933/2933772.png';
                case '商场':
                    return 'https://cdn-icons-png.flaticon.com/64/3061/3061162.png';
                case '宠物店':
                    return 'https://cdn-icons-png.flaticon.com/64/3047/3047928.png';
                default:
                    return defaultMarker;
            }
        } catch (e) {
            console.error('Error getting marker icon:', e);
            return defaultMarker;
        }
    };

    const filterPlaces = (filter: string) => {
        if (filter === '全部') {
            setFilteredPlaces(places);
        } else {
            const filtered = places.filter(place => place.type === filter);
            setFilteredPlaces(filtered);
        }

        // Also update markers on the map based on the filter
        const placesToShow =
            filter === '全部' ? places : places.filter(place => place.type === filter);
        createMarkersFromPlaces(placesToShow);
    };

    const onFilterSelect = (filter: string) => {
        setActiveFilter(filter);
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

    const togglePlacesList = () => {
        setShowPlacesList(!showPlacesList);
    };

    const navigateToPlaceDetail = (placeId: string) => {
        // Navigate to the place detail page with the place ID
        Taro.navigateTo({
            url: `/pages/place/index?id=${placeId}`,
        });
    };

    const handleMarkerTap = e => {
        console.log('Marker tapped:', e);
        // The marker ID should be available in e.markerId
        if (e && e.markerId !== undefined) {
            const markerId = e.markerId;
            // Find the corresponding place
            const place = places.find(p => Number(p.id) === markerId);
            if (place) {
                navigateToPlaceDetail(place.id);
            } else {
                console.error('Place not found for marker ID:', markerId);
            }
        } else {
            console.error('Invalid marker tap event:', e);
        }
    };

    return (
        <View className="flex flex-col h-screen w-screen bg-white overflow-hidden fixed inset-0">
            {/* Header */}
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
                            onMarkerTap={handleMarkerTap}
                            onCalloutTap={handleMarkerTap}
                            onError={e => console.error('Map error:', e)}
                            includePoints={
                                markers.length > 0
                                    ? markers.map(m => ({
                                          latitude: m.latitude,
                                          longitude: m.longitude,
                                      }))
                                    : []
                            }
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

            {/* Places List */}
            <View
                className={`bg-white border-t border-gray-100 z-10 absolute left-0 right-0 transition-all duration-300 ${
                    showPlacesList ? 'bottom-0 max-h-[70%]' : 'bottom-0 max-h-[45px]'
                }`}
            >
                {/* Places List Header - Always visible */}
                <View
                    className="h-[45px] px-4 flex items-center cursor-pointer"
                    onClick={togglePlacesList}
                >
                    <View className="bg-gray-100 rounded-full px-4 py-2 flex items-center justify-between w-full">
                        <Text className="text-gray-800 text-sm">
                            附近发现{filteredPlaces.length}个宠物友好场所
                        </Text>
                        <AtIcon
                            value={showPlacesList ? 'chevron-down' : 'chevron-up'}
                            size="20"
                            color="#555"
                        />
                        {/* <Image
                            src={showPlacesList ? ChevronDown : ChevronUp}
                            className="w-4 h-4 text-gray-800"
                            mode="aspectFit"
                        /> */}
                    </View>
                </View>

                {/* Places List Content - Only visible when expanded */}
                {showPlacesList && (
                    <ScrollView scrollY className="max-h-[calc(70%-45px)] px-4 pb-4">
                        {filteredPlaces.map(place => (
                            <View
                                key={place.id}
                                className="flex flex-row items-center p-3 border-b border-gray-100"
                                onClick={() => navigateToPlaceDetail(place.id)}
                            >
                                <Image
                                    src={place.image}
                                    className="w-16 h-16 rounded-lg mr-3 object-cover"
                                    mode="aspectFill"
                                />
                                <View className="flex-1">
                                    <Text className="font-medium text-base">{place.name}</Text>
                                    <View className="flex flex-row items-center mt-1">
                                        <Text className="text-yellow-500 mr-1">★</Text>
                                        <Text className="text-sm mr-2">{place.rating}</Text>
                                        <Text className="text-xs text-gray-500">
                                            {place.reviewCount}条评价
                                        </Text>
                                        <Text className="text-xs text-gray-500 ml-2">
                                            · {place.distance}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        {place.address}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default MapPage;
