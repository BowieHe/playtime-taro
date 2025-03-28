import React, { useState, useEffect, useRef } from 'react';
import { View, Input, Map, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import LocationList from '@/components/LocationList';
import { MapProps } from '@tarojs/components/types/Map';
import { PetFriendlyPlace } from '@/types/place';
import { createMarkersFromPlaces } from '@/utils/mapUtils';
import { getNearbyPetFriendlyPlaces } from '@/service/mapService';
import { Search, Aim } from '@taroify/icons';
import { getCategoryTranslation, PlaceCategory } from '@/utils/EnumUtil';

const MapPage: React.FC = () => {
    //defalut location
    const [location, setLocation] = useState({ latitude: 39.908, longitude: 116.397 });
    const [markers, setMarkers] = useState<MapProps.marker[]>([]);
    const [activeFilter, setActiveFilter] = useState<PlaceCategory>(PlaceCategory.ALL);
    const [places, setPlaces] = useState<PetFriendlyPlace[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<PetFriendlyPlace[]>([]);
    const [showPlacesList, setShowPlacesList] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [radius, setRadius] = useState(5); // Default radius is 5km
    const [showRadiusSelector, setShowRadiusSelector] = useState(false);

    // Available radius options in kilometers
    const radiusOptions = [1, 3, 5, 10, 15];

    // Create ref for map context
    const mapContext = useRef<any>(null);

    // Add a ref to track if we're coming back to this page
    const didMountRef = useRef(false);

    const filters = Object.values(PlaceCategory);

    useEffect(() => {
        // Initialize map data
        initializeMap();
    }, []);

    // Combined useEffect for handling both filter changes and radius changes
    useEffect(() => {
        if (places.length > 0) {
            // Apply filtering based on active filter
            console.log('Active filter:', activeFilter);
            if (activeFilter === PlaceCategory.ALL) {
                setFilteredPlaces(places);
                setMarkers(createMarkersFromPlaces(places));
            } else {
                const filtered = places.filter(place => place.category === activeFilter);
                setFilteredPlaces(filtered);
                setMarkers(createMarkersFromPlaces(filtered));
            }
        }
    }, [activeFilter, places]);

    // Reload places when radius changes
    useEffect(() => {
        if (location.latitude && location.longitude && mapLoaded) {
            loadNearbyPlaces(location.latitude, location.longitude, radius);
        }
    }, [radius]);

    // Add a Taro lifecycle method to detect when the page is shown
    useEffect(() => {
        const handlePageShow = () => {
            console.log('Map page is shown');
            // Only reload places if we have already mounted once (coming back from another page)
            if (didMountRef.current && location.latitude && location.longitude) {
                console.log('Reloading places on page show');
                loadNearbyPlaces(location.latitude, location.longitude, radius);
            }
        };

        // Set up the page show listener
        Taro.eventCenter.on('pageShow', handlePageShow);

        // Set the ref to true after first mount
        didMountRef.current = true;

        // Clean up the listener when component unmounts
        return () => {
            Taro.eventCenter.off('pageShow', handlePageShow);
        };
    }, [location, radius]);

    // Add componentDidShow lifecycle equivalent using Taro.useDidShow
    useEffect(() => {
        // Create a page show handler for Taro
        const pageShowHandler = () => {
            Taro.eventCenter.trigger('pageShow');
        };

        // Set up the page show handler - fixing the optional chaining issue
        if (Taro.Current && Taro.Current.page) {
            Taro.Current.page.onShow = () => {
                pageShowHandler();
            };
        }
    }, []);

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

                // Load nearby places
                loadNearbyPlaces(res.latitude, res.longitude, radius);

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

    const loadNearbyPlaces = async (latitude: number, longitude: number, radiusKm: number) => {
        try {
            Taro.showLoading({ title: '加载附近场所...' });
            const placesWithDistance = await getNearbyPetFriendlyPlaces({
                latitude,
                longitude,
                radius: radiusKm * 1000, // Convert km to meters
            });

            const places = placesWithDistance.map(p => p.location);

            setPlaces(places);
            // Let the combined useEffect handle setting markers
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
    };

    const onFilterSelect = (filter: PlaceCategory) => {
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

    // Toggle radius selector visibility
    const toggleRadiusSelector = () => {
        setShowRadiusSelector(!showRadiusSelector);
    };

    // Change radius selection
    const handleRadiusChange = (newRadius: number) => {
        setRadius(newRadius);
        setShowRadiusSelector(false);
    };

    return (
        <View className="flex flex-col h-screen w-screen bg-white overflow-hidden fixed inset-0">
            {/* Header */}
            <View className="flex flex-row items-center justify-between px-4">
                {/* Search bar - will take most of the space but not all */}
                <View className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow">
                    <Search size={20} color="#555" />
                    <Input
                        type="text"
                        placeholder="搜索宠物友好的场所"
                        className="flex-1 text-sm outline-none"
                    />
                </View>

                {/* Radius selector with increased width */}
                <View className="relative">
                    <View
                        className="ml-2 px-4 h-10 bg-white rounded-full flex justify-center items-center shadow min-w-[70px]"
                        onClick={toggleRadiusSelector}
                    >
                        <Text className="text-sm font-medium text-gray-700">{radius}km</Text>
                    </View>

                    {/* Radius options dropdown with consistent wider width */}
                    {showRadiusSelector && (
                        <View className="absolute top-12 right-0 bg-white rounded-lg shadow-lg z-50 py-2 min-w-[80px]">
                            {radiusOptions.map(option => (
                                <View
                                    key={option}
                                    className={`px-4 py-2 ${
                                        radius === option ? 'bg-gray-100 text-[#22c55e]' : ''
                                    }`}
                                    onClick={() => handleRadiusChange(option)}
                                >
                                    <Text
                                        className={`text-sm text-center w-full ${
                                            radius === option
                                                ? 'font-medium text-[#22c55e]'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {option} km
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
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
                        {getCategoryTranslation(filter)}
                    </View>
                ))}
            </View>

            {/* Map Container - Adjusted to have less bottom space */}
            <View className="flex-1 relative z-5">
                {mapLoaded && (
                    <View className="absolute inset-0" style={{ height: 'calc(100% - 20px)' }}>
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

                {/* Location Button - Adjusted position to be higher */}
                <View
                    className="absolute bottom-16 right-5 w-10 h-10 bg-white rounded-full flex justify-center items-center 
                               shadow z-30"
                    onClick={moveToCurrentLocation}
                >
                    <Aim size={20} color="#555" />
                </View>
            </View>

            {/* Reusable Location List Component - Made more compact */}
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
