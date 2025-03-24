import { Component, PropsWithChildren } from 'react';
import { View } from '@tarojs/components';
import { observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import {
    createMarkersFromPlaces,
    checkLocationPermission,
    requestLocationPermission,
    getUserLocation,
    getScaleFromRadius, // Import this directly
} from '@/utils/mapUtils';
import './index.css';
import { AddressComponent, AdInfo } from '@/types/map';
import { getNearbyPetFriendlyPlaces, reverseGeocode } from '@/service/mapService';
import { PetFriendlyPlace, LocationCategory, PlaceSearchParams } from '@/types/location';
import MapComponent from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import PopUpWindow from '@/components/PopUpWindow';
import LocationList from '@/components/LocationList';

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
        scale: 14, // Changed from 12 to 14 for better initial view
        isMapLoaded: false,
        showPermissionPopup: true,
        permissionDenied: false,
        showAddLocationPopup: false,
        selectedLocation: null,
        keyword: '',
        selectedCategory: '',
        petFriendlyPlaces: [],
        isLoading: false,
        searchRadius: 3000,
    };

    componentDidMount() {
        this.initializeLocation();
        this.setState({ isMapLoaded: true });
    }

    initializeLocation = async () => {
        // Check if location permission is granted
        const isPermissionGranted = await checkLocationPermission();

        if (isPermissionGranted) {
            this.setState({ showPermissionPopup: false });
            this.handleGetUserLocation();
        } else {
            this.setState({ showPermissionPopup: true });
        }
    };

    handleAcceptPermission = async () => {
        this.setState({ showPermissionPopup: false });
        const isPermissionGranted = await requestLocationPermission();

        if (isPermissionGranted) {
            this.handleGetUserLocation();
        } else {
            this.setState({ permissionDenied: true });
        }
    };

    handleRejectPermission = () => {
        this.setState({
            showPermissionPopup: false,
            permissionDenied: true,
        });
    };

    handleGetUserLocation = async () => {
        const locationData = await getUserLocation();

        if (locationData) {
            const { latitude, longitude } = locationData;
            this.setState({ latitude, longitude });
            this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
        }
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

            const placesWithDistance = await getNearbyPetFriendlyPlaces(searchParams);
            const places = placesWithDistance.map(pwd => pwd.location);

            this.setState({ petFriendlyPlaces: places }, () => {
                this.updateMapMarkers(places);
            });
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            Taro.showToast({
                title: 'Failed to load nearby places',
                icon: 'none',
            });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    updateMapMarkers = (places: PetFriendlyPlace[]) => {
        const { latitude, longitude, searchRadius } = this.state;
        const { markers, includePoints, scale } = createMarkersFromPlaces(
            places,
            latitude,
            longitude,
            searchRadius // Pass search radius to set appropriate scale
        );

        this.setState({ markers, includePoints, scale });
    };

    handleKeywordChange = (value: string) => {
        this.setState({ keyword: value });
    };

    handleCategoryChange = (value: number) => {
        const categories = Object.values(LocationCategory);
        const selectedCategory = value < 0 ? '' : categories[value];
        this.setState({ selectedCategory: selectedCategory });
    };

    handleRadiusChange = (value: number) => {
        const radiusOptions = [1000, 3000, 5000, 10000];
        const selectedRadius = radiusOptions[value];
        const currentRadius = this.state.searchRadius;

        // Use the imported function directly instead of requiring it
        const newScale = getScaleFromRadius(selectedRadius);

        // Determine if we're zooming in or out
        const isZoomingOut = selectedRadius > currentRadius;

        // Set the scale immediately for visual feedback
        this.setState({ scale: newScale }, () => {
            // Show loading indicator
            this.setState({ isLoading: true });

            // Small delay to allow animation to be visible
            setTimeout(
                () => {
                    // Then update the radius and fetch new places
                    this.setState({ searchRadius: selectedRadius }, () => {
                        const { latitude, longitude } = this.state;
                        this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
                    });
                },
                isZoomingOut ? 300 : 100
            ); // Longer delay when zooming out for better UX
        });
    };

    handleSearch = () => {
        const { latitude, longitude } = this.state;
        this.fetchNearbyPetFriendlyPlaces(latitude, longitude);
    };

    handleMapError = () => {
        Taro.showToast({
            title: 'Failed to load map',
            icon: 'none',
        });
        this.setState({ isMapLoaded: false });
    };

    onMarkerTap = e => {
        try {
            const markerId = e.detail.markerId;
            const place = this.state.petFriendlyPlaces.find(p => String(p.id) === String(markerId));

            if (place) {
                Taro.showModal({
                    title: place.name || 'Unnamed place',
                    content: `${place.address || 'No address'}\n\n${place.description || ''}`,
                    showCancel: false,
                    confirmText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error handling marker tap:', error);
        }
    };

    onPoiTap = async e => {
        const { name, latitude, longitude } = e.detail;

        try {
            const locationInfo = await reverseGeocode(latitude, longitude);
            const adInfo = locationInfo.ad_info || null;
            const addressComponent = locationInfo.address_component || null;

            this.setState({
                selectedLocation: {
                    latitude,
                    longitude,
                    name,
                    address: locationInfo.address,
                    adInfo,
                    addressComponent,
                },
                showAddLocationPopup: true,
            });
        } catch (error) {
            console.error('Failed to get location info:', error);
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
            this.setState({ showAddLocationPopup: false });
        }
    };

    handleCancelAddLocation = () => {
        this.setState({
            showAddLocationPopup: false,
            selectedLocation: null,
        });
    };

    handleLocationSelect = (latitude: number, longitude: number) => {
        this.setState({
            latitude,
            longitude,
            scale: 15, // Adjusted from 16 to 15 for better viewing
        });
    };

    render() {
        const {
            latitude,
            longitude,
            markers,
            scale,
            includePoints,
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

        return (
            <View className="map-page">
                {/* Permission Popup */}
                <PopUpWindow
                    visible={showPermissionPopup}
                    title="位置权限请求"
                    content={
                        <View className="permission-content">
                            <View className="permission-text">
                                PlayTime需要获取您的位置信息，以便查找附近的宠物服务和活动场所。
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
                            <View className="location-name">
                                {selectedLocation?.name || 'Unnamed location'}
                            </View>
                            <View className="location-address">
                                {selectedLocation?.address || ''}
                            </View>
                            <View className="add-location-hint">将此地点添加到宠物友好场所?</View>
                        </View>
                    }
                    acceptText="添加地点"
                    rejectText="取消"
                    onAccept={this.handleAddLocation}
                    onReject={this.handleCancelAddLocation}
                />

                {/* Search Bar */}
                <SearchBar
                    keyword={keyword}
                    selectedCategory={selectedCategory}
                    searchRadius={searchRadius}
                    isLoading={isLoading}
                    onKeywordChange={this.handleKeywordChange}
                    onCategoryChange={this.handleCategoryChange}
                    onRadiusChange={this.handleRadiusChange}
                    onSearch={this.handleSearch}
                />

                {/* Map Component */}
                <View className="map-wrapper">
                    <MapComponent
                        latitude={latitude}
                        longitude={longitude}
                        scale={scale}
                        markers={markers}
                        includePoints={includePoints}
                        showLocation={!permissionDenied}
                        isLoading={isLoading}
                        permissionDenied={permissionDenied}
                        onMarkerTap={this.onMarkerTap}
                        onPoiTap={this.onPoiTap}
                        onMapError={this.handleMapError}
                        transition={true}
                    />
                </View>

                {/* Location List */}
                <LocationList
                    places={petFriendlyPlaces}
                    onLocationSelect={this.handleLocationSelect}
                />
            </View>
        );
    }
}

export default MapPage;
