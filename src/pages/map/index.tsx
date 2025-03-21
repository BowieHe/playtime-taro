import { Component, PropsWithChildren } from 'react';
import { View, Text, Map, Input, Picker, Button } from '@tarojs/components';
import { observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import PopUpWindow from '@/components/popUpWindow';
import './index.css';
import { AddressComponent, AdInfo } from '@/types/map';
import { getNearbyPetFriendlyPlaces, reverseGeocode } from '@/service/mapService';
import {
    PetFriendlyPlace,
    LocationCategory,
    PlaceSearchParams,
    CategoryDisplayNames,
} from '@/types/location';

interface MapState {
    latitude: number;
    longitude: number;
    markers: any[];
    includePoints: any[];
    scale: number;
    isMapLoaded: boolean;
    showPermissionPopup: boolean;
    permissionDenied: boolean;
    showAddLocationPopup: boolean;
    selectedLocation: {
        latitude: number;
        longitude: number;
        address: string;
        name: string;
        adInfo: AdInfo | null;
        addressComponent: AddressComponent | null;
    } | null;
    keyword: string;
    selectedCategory: LocationCategory | '';
    petFriendlyPlaces: PetFriendlyPlace[];
    isLoading: boolean;
    searchRadius: number;
}

@observer
class MapPage extends Component<PropsWithChildren, MapState> {
    state: MapState = {
        latitude: 31.2304, // Default to Shanghai coordinates
        longitude: 121.4737,
        markers: [],
        includePoints: [],
        scale: 12, // Decreased from 14 to show a wider area by default
        isMapLoaded: false,
        showPermissionPopup: true, // Show permission popup by default
        permissionDenied: false,
        showAddLocationPopup: false,
        selectedLocation: null,
        keyword: '',
        selectedCategory: '',
        petFriendlyPlaces: [],
        isLoading: false,
        searchRadius: 3000, // 3km default radius
    };

    componentDidMount() {
        // Check permission status instead of directly requesting location
        this.checkLocationPermission();

        // Set isMapLoaded to true by default to show the map container
        // even if we don't have markers yet
        this.setState({ isMapLoaded: true });
    }

    checkLocationPermission = () => {
        Taro.getSetting({
            success: res => {
                console.log('Permission settings:', res.authSetting);
                if (res.authSetting['scope.userLocation']) {
                    // Already authorized, proceed to get location
                    console.log('Location permission already granted');
                    this.setState({ showPermissionPopup: false });
                    this.getUserLocation();
                } else {
                    // Show our permission popup
                    console.log('Location permission not granted yet, showing popup');
                    this.setState({ showPermissionPopup: true });
                }
            },
            fail: err => {
                console.error('Failed to get permission settings:', err);
                // Default to showing popup on error
                this.setState({ showPermissionPopup: true });
            },
        });
    };

    handleAcceptPermission = () => {
        console.log('User accepted permission request in popup');
        this.setState({ showPermissionPopup: false });

        // Request location permission through WeChat API
        this.requestLocationPermission();
    };

    handleRejectPermission = () => {
        console.log('User rejected permission request in popup');
        this.setState({
            showPermissionPopup: false,
            permissionDenied: true,
        });

        // Load default markers without user location
        this.loadDefaultMarkers();
    };

    requestLocationPermission = () => {
        Taro.authorize({
            scope: 'scope.userLocation',
            success: () => {
                console.log('Location permission granted');
                this.getUserLocation();
            },
            fail: err => {
                console.error('Location permission denied:', err);
                this.setState({ permissionDenied: true });
                this.loadDefaultMarkers();

                // Show permission settings guidance
                Taro.showModal({
                    title: '位置权限已拒绝',
                    content: '您已拒绝位置权限，您可以前往设置页面手动开启',
                    confirmText: '前往设置',
                    cancelText: '取消',
                    success: res => {
                        if (res.confirm) {
                            Taro.openSetting();
                        }
                    },
                });
            },
        });
    };

    getUserLocation = () => {
        Taro.getLocation({
            isHighAccuracy: true,
            type: 'gcj02',
            success: res => {
                const latitude = res.latitude;
                const longitude = res.longitude;
                console.log('Got location:', latitude, longitude);

                // Update state with user location
                this.setState({
                    latitude,
                    longitude,
                });

                // Load pet-friendly places around the user's current location
                this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
            },
            fail: err => {
                console.error('Failed to get location:', err);
                this.loadDefaultMarkers();
            },
        });
    };

    fetchNearbyPetFriendlyPlaces = async (latitude: number, longitude: number) => {
        try {
            this.setState({ isLoading: true });

            const { keyword, selectedCategory, searchRadius } = this.state;

            const searchParams: PlaceSearchParams = {
                latitude,
                longitude,
                radius: searchRadius,
            };

            if (keyword) searchParams.keyword = keyword;
            if (selectedCategory) searchParams.category = selectedCategory as LocationCategory;

            const places = await getNearbyPetFriendlyPlaces(searchParams);
            console.log('Fetched nearby pet-friendly places:', places);

            const petFriendly = places.map(place => place.location);
            this.setState(
                {
                    petFriendlyPlaces: petFriendly,
                },
                () => {
                    this.createMarkersFromPlaces(petFriendly);
                }
            );
        } catch (error) {
            console.error('Error fetching nearby pet-friendly places:', error);
            Taro.showToast({
                title: 'Failed to load nearby places',
                icon: 'none',
            });
            this.loadDefaultMarkers();
        } finally {
            this.setState({ isLoading: false });
        }
    };

    createMarkersFromPlaces = (places: PetFriendlyPlace[]) => {
        if (!places || places.length === 0) {
            console.log('No places found to create markers');
            this.setState({
                markers: [],
                includePoints: [{ latitude: this.state.latitude, longitude: this.state.longitude }],
            });
            return;
        }

        try {
            console.log('Raw place data for debugging:', places[0]);

            // Filter out places with invalid coordinates - handle both direct and GeoJSON formats
            const validPlaces = places.filter(place => {
                try {
                    // First check if place exists
                    if (!place) return false;

                    // Check if we have a location property
                    if (!place.location) return false;

                    // Handle GeoJSON format (type: "Point", coordinates: [lng, lat])
                    if (
                        place.location.type === 'Point' &&
                        Array.isArray(place.location.coordinates)
                    ) {
                        // GeoJSON stores coordinates as [longitude, latitude]
                        const lng = place.location.coordinates[0];
                        const lat = place.location.coordinates[1];

                        console.log(`Place ${place.name} has GeoJSON coordinates:`, lat, lng);

                        return (
                            typeof lng === 'number' &&
                            typeof lat === 'number' &&
                            !isNaN(lng) &&
                            !isNaN(lat) &&
                            isFinite(lng) &&
                            isFinite(lat)
                        );
                    }
                    // Handle direct lat/lng format
                    else if ('latitude' in place.location && 'longitude' in place.location) {
                        const lat = place.location.latitude;
                        const lng = place.location.longitude;

                        console.log(`Place ${place.name} has direct coordinates:`, lat, lng);

                        return (
                            typeof lat === 'number' &&
                            typeof lng === 'number' &&
                            !isNaN(lat) &&
                            !isNaN(lng) &&
                            isFinite(lat) &&
                            isFinite(lng)
                        );
                    }

                    console.log(`Place ${place.name} has invalid location format:`, place.location);
                    return false;
                } catch (e) {
                    console.error('Error validating place:', e);
                    return false;
                }
            });

            console.log('Valid places count:', validPlaces.length);

            if (validPlaces.length === 0) {
                console.log('No places with valid coordinates found');
                this.setState({
                    markers: [],
                    includePoints: [
                        { latitude: this.state.latitude, longitude: this.state.longitude },
                    ],
                });
                return;
            }

            // Define a default marker image path - use absolute path with forward slashes
            const defaultMarkerPath = '/assets/icons/default_marker.png';

            // Create markers from the pet-friendly places with valid coordinates
            const markers = validPlaces
                .map((place, index) => {
                    try {
                        // Ensure we have a valid ID string
                        const markerId = place.id ? String(place.id) : `place-${index}`;

                        // Get the coordinates based on the format
                        // let latitude, longitude;
                        const longitude = place.location.coordinates[0];
                        const latitude = place.location.coordinates[1];

                        // if (
                        //     place.location.type === 'Point' &&
                        //     Array.isArray(place.location.coordinates)
                        // ) {
                        //     // GeoJSON format: coordinates[0] is longitude, coordinates[1] is latitude
                        //     longitude = place.location.coordinates[0];
                        //     latitude = place.location.coordinates[1];
                        // }
                        return {
                            id: markerId,
                            latitude,
                            longitude,
                            // Use absolute path for icon loading
                            iconPath: defaultMarkerPath,
                            width: 30,
                            height: 30,
                            callout: {
                                content: place.name || 'Unnamed place',
                                color: '#000000',
                                fontSize: 14,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: '#cccccc',
                                padding: 5,
                                display: 'BYCLICK',
                                textAlign: 'center',
                            },
                        };
                    } catch (e) {
                        console.error('Error creating marker for place:', e, place);
                        return null;
                    }
                })
                .filter(Boolean); // Remove any null markers

            // Make sure we have valid user coordinates
            const userLat = this.state.latitude;
            const userLng = this.state.longitude;
            const userLocationValid =
                typeof userLat === 'number' &&
                typeof userLng === 'number' &&
                !isNaN(userLat) &&
                !isNaN(userLng) &&
                isFinite(userLat) &&
                isFinite(userLng);

            // Points to include in the map view
            let includePoints: Array<{ latitude: number; longitude: number }> = [];

            // Add user location to includePoints if valid
            if (userLocationValid) {
                includePoints.push({ latitude: userLat, longitude: userLng });
            }

            // Add valid place coordinates to includePoints
            validPlaces.forEach(place => {
                try {
                    const longitude = place.location.coordinates[0];
                    const latitude = place.location.coordinates[1];
                    // let latitude, longitude;

                    // if (
                    //     place.location.type === 'Point' &&
                    //     Array.isArray(place.location.coordinates)
                    // ) {
                    //     // GeoJSON format
                    //     longitude = place.location.coordinates[0];
                    //     latitude = place.location.coordinates[1];
                    // } else {
                    //     // Direct format
                    //     latitude = place.location.latitude;
                    //     longitude = place.location.longitude;
                    // }

                    if (
                        typeof latitude === 'number' &&
                        typeof longitude === 'number' &&
                        !isNaN(latitude) &&
                        !isNaN(longitude) &&
                        isFinite(latitude) &&
                        isFinite(longitude)
                    ) {
                        includePoints.push({
                            latitude,
                            longitude,
                        });
                    }
                } catch (error) {
                    console.error('Error adding includePoint for place:', error);
                }
            });

            console.log('Valid markers created:', markers.length);
            console.log('Include points created:', includePoints.length);
            console.log(
                'First marker example:',
                markers.length > 0 ? JSON.stringify(markers[0]) : 'None'
            );

            // Use a default point if no valid points were found
            if (includePoints.length === 0) {
                includePoints.push({ latitude: 31.2304, longitude: 121.4737 }); // Default to Shanghai
            }

            this.setState({
                markers,
                includePoints,
                // Set scale to a lower value when we have multiple points
                scale: markers.length > 1 ? 11 : 13,
            });
        } catch (error) {
            console.error('Error creating markers:', error);
            // Fallback to default markers in case of any error
            this.loadDefaultMarkers();
        }
    };

    getCategoryIcon = (category: LocationCategory) => {
        // Use absolute path for icon
        return '/assets/icons/default_marker.png';
    };

    loadMarkersAroundLocation = (latitude: number, longitude: number) => {
        // Replace this function with the new fetchNearbyPetFriendlyPlaces function
        this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
    };

    loadDefaultMarkers() {
        // Fallback locations using the default coordinates
        const { latitude, longitude } = this.state;

        const markers = [
            {
                id: 1,
                latitude: latitude + 0.01,
                longitude: longitude + 0.01,
                iconPath: '/assets/icons/default_marker.png', // Use absolute path
                callout: {
                    content: '我是callout',
                    bgColor: '#0f0f0f22',
                    borderColor: '#0f0f0faa',
                    borderWidth: 10,
                    textAlign: 'left',
                },
                width: 25,
                height: 25,
            },
            {
                id: 2,
                latitude: latitude - 0.01,
                longitude: longitude - 0.01,
                iconPath: '/assets/icons/default_marker.png', // Use absolute path
                callout: {
                    content: 'Pet Shop',
                    color: '#000000',
                    fontSize: 14,
                    borderRadius: 4,
                    padding: 5,
                    display: 'ALWAYS',
                },
                width: 25,
                height: 25,
            },
        ];

        this.setState({
            markers,
            includePoints: [
                { latitude, longitude },
                ...markers.map(m => ({
                    latitude: m.latitude,
                    longitude: m.longitude,
                })),
            ],
            scale: 12, // Set scale to a lower value
        });
    }

    onMarkerTap = e => {
        try {
            console.log('Marker tapped:', e);
            const markerId = e.detail.markerId;

            // Find the corresponding place from petFriendlyPlaces
            const place = this.state.petFriendlyPlaces.find(p => String(p.id) === String(markerId));

            if (place) {
                // Show more detailed information about the place
                Taro.showModal({
                    title: place.name || 'Unnamed place',
                    content: `${place.address || 'No address'}\n\nCategory: ${
                        place.category ? CategoryDisplayNames[place.category] || 'Other' : 'Unknown'
                    }\nPet Size: ${place.petSize || 'N/A'}\nPet Type: ${
                        place.petType || 'N/A'
                    }\n\n${place.description || ''}`,
                    showCancel: false,
                    confirmText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error handling marker tap:', error);
        }
    };

    onPoiTap = async e => {
        console.log('POI tapped:', e);
        // POI tap events provide different data structure than regular map taps
        const { name, latitude, longitude } = e.detail;

        try {
            // Get additional location information if available
            const locationInfo = await reverseGeocode(latitude, longitude);
            // Extract address components if available
            const adInfo = locationInfo.ad_info || null;
            const addressComponent = locationInfo.address_component || null;

            this.setState({
                selectedLocation: {
                    latitude,
                    longitude,
                    name: name,
                    address: locationInfo.address,
                    adInfo,
                    addressComponent,
                },
                showAddLocationPopup: true,
            });
        } catch (error) {
            console.error('Failed to get location info:', error);

            // Fallback to basic location info
            this.setState({
                selectedLocation: {
                    latitude,
                    longitude,
                    name: name || 'New Location',
                    address: '',
                    adInfo: null,
                    addressComponent: null,
                },
                showAddLocationPopup: true,
            });
        }
    };

    handleAddLocation = () => {
        const { selectedLocation } = this.state;

        if (selectedLocation) {
            console.log('Add location:', selectedLocation);
            // Navigate to location creation page with the selected location data
            const url = `/pages/location/index?latitude=${selectedLocation.latitude}&longitude=${
                selectedLocation.longitude
            }&name=${encodeURIComponent(selectedLocation.name)}&address=${encodeURIComponent(
                selectedLocation.address || ''
            )}&adInfo=${encodeURIComponent(
                JSON.stringify(selectedLocation.adInfo || null)
            )}&addressComponent=${encodeURIComponent(
                JSON.stringify(selectedLocation.addressComponent || null)
            )}`;

            Taro.navigateTo({ url });

            // Close the popup
            this.setState({
                showAddLocationPopup: false,
            });
        }
    };

    handleCancelAddLocation = () => {
        this.setState({
            showAddLocationPopup: false,
            selectedLocation: null,
        });
    };

    handleMapError = e => {
        console.error('Map error:', e);
        Taro.showToast({
            title: 'Failed to load map',
            icon: 'none',
        });
        this.setState({
            isMapLoaded: false,
        });
    };

    handleSearch = () => {
        const { latitude, longitude } = this.state;
        this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
    };

    handleKeywordChange = e => {
        this.setState({ keyword: e.detail.value });
    };

    handleCategoryChange = e => {
        const categories = Object.values(LocationCategory);
        const selectedCategory = e.detail.value < 0 ? '' : categories[e.detail.value];
        this.setState({ selectedCategory: selectedCategory });
    };

    handleRadiusChange = e => {
        const radiusOptions = [1000, 3000, 5000, 10000]; // 1km, 3km, 5km, 10km
        const selectedRadius = radiusOptions[e.detail.value];
        this.setState({ searchRadius: selectedRadius });
    };

    render() {
        const {
            latitude,
            longitude,
            markers,
            scale,
            includePoints,
            isMapLoaded,
            showPermissionPopup,
            permissionDenied,
            showAddLocationPopup,
            selectedLocation,
            keyword,
            selectedCategory,
            petFriendlyPlaces,
            isLoading,
            searchRadius,
        } = this.state;

        // Category selector options
        const categoryOptions = Object.values(LocationCategory).map(
            cat => CategoryDisplayNames[cat] || String(cat)
        );
        const categoryIndex = selectedCategory
            ? Object.values(LocationCategory).indexOf(selectedCategory as LocationCategory)
            : -1;

        // Radius options
        const radiusOptions = ['1km', '3km', '5km', '10km'];
        const radiusValues = [1000, 3000, 5000, 10000];
        const radiusIndex = radiusValues.indexOf(searchRadius);

        // Ensure we have valid markers and include points
        const validMarkers = Array.isArray(markers) ? markers : [];
        const validIncludePoints =
            Array.isArray(includePoints) && includePoints.length > 0
                ? includePoints
                : [{ latitude, longitude }];

        return (
            <View className="map-page">
                <PopUpWindow
                    visible={showPermissionPopup}
                    title="位置权限请求"
                    content={
                        <View className="permission-content">
                            <Text className="permission-text">
                                PlayTime需要获取您的位置信息，以便查找附近的宠物服务和活动场所。
                            </Text>
                            <Text className="permission-subtext">
                                We need your location to find pet-friendly places nearby.
                            </Text>
                            <View className="permission-image-container">
                                <View className="permission-image" />
                            </View>
                        </View>
                    }
                    acceptText="允许"
                    rejectText="拒绝"
                    onAccept={this.handleAcceptPermission}
                    onReject={this.handleRejectPermission}
                />

                {/* Add Location Popup */}
                <PopUpWindow
                    visible={showAddLocationPopup}
                    title="添加新地点"
                    content={
                        <View className="add-location-popup">
                            <Text className="location-name">
                                {selectedLocation?.name || 'Unnamed location'}
                            </Text>
                            <Text className="location-address">
                                {selectedLocation?.address || ''}
                            </Text>
                            <Text className="add-location-hint">将此地点添加到宠物友好场所?</Text>
                        </View>
                    }
                    acceptText="添加地点"
                    rejectText="取消"
                    onAccept={this.handleAddLocation}
                    onReject={this.handleCancelAddLocation}
                />

                <View className="search-container">
                    <Input
                        className="search-input"
                        placeholder="Search for pet-friendly places"
                        value={keyword}
                        onInput={this.handleKeywordChange}
                    />
                    <View className="filter-row">
                        <Picker
                            mode="selector"
                            range={categoryOptions}
                            value={categoryIndex}
                            onChange={this.handleCategoryChange}
                        >
                            <View className="picker">
                                Category:{' '}
                                {selectedCategory ? CategoryDisplayNames[selectedCategory] : 'All'}
                            </View>
                        </Picker>

                        <Picker
                            mode="selector"
                            range={radiusOptions}
                            value={radiusIndex}
                            onChange={this.handleRadiusChange}
                        >
                            <View className="picker">Radius: {radiusOptions[radiusIndex]}</View>
                        </Picker>
                    </View>
                    <Button
                        className="search-button"
                        onClick={this.handleSearch}
                        loading={isLoading}
                    >
                        Search
                    </Button>
                </View>

                <View className="map-container">
                    {/* <Text className="map-title">附近宠物场所</Text> */}

                    {permissionDenied && (
                        <View className="permission-denied-banner">
                            <Text>位置权限被拒绝，展示的是默认位置信息</Text>
                        </View>
                    )}

                    {/* Always try to show the map but with a loading indicator if needed */}
                    <Map
                        className="map"
                        longitude={longitude}
                        latitude={latitude}
                        scale={scale}
                        markers={validMarkers}
                        includePoints={validIncludePoints}
                        showLocation={!permissionDenied}
                        onMarkerTap={this.onMarkerTap}
                        onPoiTap={this.onPoiTap}
                        enableRotate={true}
                        enableZoom={true}
                        onError={this.handleMapError}
                    />

                    {isLoading && (
                        <View className="map-overlay">
                            <View className="loading-indicator">
                                <Text>Loading places...</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View className="location-list">
                    <Text className="list-title">
                        Nearby Pet-Friendly Places ({petFriendlyPlaces.length})
                    </Text>
                    {petFriendlyPlaces.length === 0 ? (
                        <View className="empty-list">
                            <Text>No pet-friendly places found nearby.</Text>
                        </View>
                    ) : (
                        petFriendlyPlaces.map((place, index) => {
                            // Skip invalid places
                            if (!place || !place.location) return null;

                            // Get coordinates based on format
                            let latitude, longitude;
                            try {
                                if (
                                    place.location.type === 'Point' &&
                                    Array.isArray(place.location.coordinates)
                                ) {
                                    // GeoJSON format
                                    longitude = place.location.coordinates[0];
                                    latitude = place.location.coordinates[1];
                                } else if (
                                    'latitude' in place.location &&
                                    'longitude' in place.location
                                ) {
                                    // Direct format
                                    latitude = place.location.latitude;
                                    longitude = place.location.longitude;
                                } else {
                                    return null; // Invalid location format
                                }

                                if (isNaN(latitude) || isNaN(longitude)) return null;
                            } catch (e) {
                                console.error('Error parsing location:', e);
                                return null;
                            }

                            return (
                                <View
                                    className="location-item"
                                    key={place.id || `place-${index}`}
                                    onClick={() => {
                                        // Center map on this location when clicked
                                        if (!isNaN(latitude) && !isNaN(longitude)) {
                                            this.setState({
                                                latitude,
                                                longitude,
                                                scale: 16, // Zoom in a bit
                                            });
                                        }
                                    }}
                                >
                                    <Text className="location-name">
                                        {place.name || 'Unnamed place'}
                                    </Text>
                                    <Text className="location-category">
                                        {place.category
                                            ? CategoryDisplayNames[place.category] || 'Other'
                                            : 'Unknown category'}
                                    </Text>
                                    <Text className="location-address">
                                        {place.address || 'No address'}
                                    </Text>
                                    {place.distance !== undefined && !isNaN(place.distance) && (
                                        <Text className="location-distance">
                                            {(place.distance / 1000).toFixed(1)}km away
                                        </Text>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </View>
        );
    }
}

export default MapPage;
