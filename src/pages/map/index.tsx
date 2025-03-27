import React, { useState, useEffect, useRef } from 'react';
import { View, Input, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import LocationList from '@/components/LocationList';
import { MapProps } from '@tarojs/components/types/Map';
import { LocationCategory, PetFriendlyPlace } from '@/types/location';
import { createMarkersFromPlaces } from '@/utils/mapUtils';
import { getNearbyPetFriendlyPlaces } from '@/service/mapService';
import { Search, Setting, Aim } from '@taroify/icons';

const MapPage: React.FC = () => {
    //defalut location
    const [location, setLocation] = useState({ latitude: 39.908, longitude: 116.397 });
    const [markers, setMarkers] = useState<MapProps.marker[]>([]);
    const [activeFilter, setActiveFilter] = useState('全部');
    const [places, setPlaces] = useState<PetFriendlyPlace[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<PetFriendlyPlace[]>([]);
    const [showPlacesList, setShowPlacesList] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Create ref for map context
    const mapContext = useRef<any>(null);

    const filters = Object.values(LocationCategory);
    // const filters = ['全部', '餐厅', '咖啡厅', '公园', '酒店', '商场', '宠物店'];

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
            success: async function (res) {
                console.log('Got location:', res);
                // Set initial location
                setLocation({
                    latitude: res.latitude,
                    longitude: res.longitude,
                });

                // Get nearby places from service
                try {
                    const placesWithDistance = await getNearbyPetFriendlyPlaces({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        radius: 5000, // 5km radius
                    });

                    const places = placesWithDistance.map(p => p.location);

                    setPlaces(places);
                    setMarkers(createMarkersFromPlaces(places));
                } catch (error) {
                    console.error('Failed to load nearby places:', error);
                    Taro.showToast({
                        title: '加载附近地点失败',
                        icon: 'none',
                    });
                } finally {
                    setMapLoaded(true);
                    Taro.hideLoading();
                }

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
                // setPlaces(samplePetFriendlyPlaces);
                // createMarkersFromPlaces(samplePetFriendlyPlaces);
            },
        });
    };

    const filterPlaces = (filter: string) => {
        if (filter === '全部') {
            setFilteredPlaces(places);
        } else {
            const filtered = places.filter(place => place.category === filter);
            setFilteredPlaces(filtered);
        }

        // Also update markers on the map based on the filter
        const placesToShow =
            filter === '全部' ? places : places.filter(place => place.category === filter);
        setMarkers(createMarkersFromPlaces(placesToShow));
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
        // Set animating state to true and schedule it to be false after animation ends
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 50);

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
            const place = places[markerId];

            if (place) {
                navigateToPlaceDetail(place.id);
            } else {
                console.error('Place not found for marker ID:', markerId);
            }
        } else {
            console.error('Invalid marker tap event:', e);
        }
    };

    const handlePOITap = e => {
        console.log('POI tapped:', e);
        const details = e.detail;
        Taro.navigateTo({
            url: `/pages/addPlace/index?latitude=${details.latitude}&longitude=${details.longitude}&name=${details.name}`,
        });
    };

    return (
        <View className="flex flex-col h-screen w-screen bg-white overflow-hidden fixed inset-0">
            {/* Header */}
            <View className="flex flex-row items-center justify-between px-4 mt-4">
                {/* Search bar - will take most of the space but not all */}
                <View className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow">
                    <Search size={20} color="#555" />
                    {/* <Image src={SearchIcon} className="w-5 h-5 mr-2" mode="aspectFit" /> */}
                    <Input
                        type="text"
                        placeholder="搜索宠物友好的场所"
                        className="flex-1 text-sm outline-none"
                    />
                </View>

                {/* Setting icon - right aligned with proper spacing */}
                <View className="ml-2 w-10 h-10 bg-white rounded-full flex justify-center items-center">
                    <Setting size={20} color="#555" />
                    {/* <Image src={SettingIcon} className="w-5 h-5" mode="aspectFit" /> */}
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
                    <View className="absolute inset-0" style={{ height: 'calc(100% - 50px)' }}>
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
                            onPoiTap={handlePOITap}
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
                    className="absolute bottom-24 right-5 w-10 h-10 bg-white rounded-full flex justify-center items-center 
                               shadow z-30"
                    onClick={moveToCurrentLocation}
                >
                    <Aim size={20} color="#555" />
                    {/* <Image src={LocationIcon} className="w-5 h-5" mode="aspectFit" /> */}
                </View>
            </View>

            {/* Reusable Location List Component */}
            <LocationList
                places={filteredPlaces}
                showPlacesList={showPlacesList}
                onTogglePlacesList={togglePlacesList}
                onPlaceSelect={navigateToPlaceDetail}
                isAnimating={isAnimating}
            />
        </View>
    );
};

export default MapPage;
