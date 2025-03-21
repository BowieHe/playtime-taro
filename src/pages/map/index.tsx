import { Component, PropsWithChildren } from 'react';
import { View, Text, Map } from '@tarojs/components';
import { observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import PopUpWindow from '@/components/popUpWindow';
import { reverseGeocode } from '@/service/mapService';
import './index.css';

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
    } | null;
}

@observer
class MapPage extends Component<PropsWithChildren, MapState> {
    state: MapState = {
        latitude: 31.2304, // Default to Shanghai coordinates
        longitude: 121.4737,
        markers: [],
        includePoints: [],
        scale: 14,
        isMapLoaded: false,
        showPermissionPopup: true, // Show permission popup by default
        permissionDenied: false,
        showAddLocationPopup: false,
        selectedLocation: null,
    };

    componentDidMount() {
        // Check permission status instead of directly requesting location
        this.checkLocationPermission();
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

                // Update state with user location instead of opening location chooser
                this.setState({
                    latitude,
                    longitude,
                });

                // Load markers around the user's current location
                this.loadMarkersAroundLocation(latitude, longitude);
            },
            fail: err => {
                console.error('Failed to get location:', err);
                this.loadDefaultMarkers();
            },
        });
    };

    loadMarkersAroundLocation = (latitude: number, longitude: number) => {
        // Sample location markers - replace with your actual data
        const sampleLocations = [
            {
                id: 1,
                name: 'Pet Park',
                latitude: latitude + 0.01,
                longitude: longitude + 0.01,
            },
            {
                id: 2,
                name: 'Pet Shop',
                latitude: latitude - 0.01,
                longitude: longitude - 0.01,
            },
            {
                id: 3,
                name: 'Vet Clinic',
                latitude: latitude + 0.015,
                longitude: longitude - 0.01,
            },
        ];

        // Create markers from the locations
        const markers = sampleLocations.map(location => ({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            callout: {
                content: location.name,
                color: '#000000',
                fontSize: 14,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#cccccc',
                padding: 5,
                display: 'ALWAYS',
            },
            width: 25,
            height: 25,
        }));

        // Points to include in the map view
        const includePoints = [
            { latitude, longitude },
            ...sampleLocations.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
            })),
        ];

        this.setState({
            latitude,
            longitude,
            markers,
            includePoints,
            isMapLoaded: true,
        });
    };

    loadDefaultMarkers() {
        // Fallback locations using the default coordinates
        const { latitude, longitude } = this.state;

        const markers = [
            {
                id: 1,
                latitude: latitude + 0.01,
                longitude: longitude + 0.01,
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
            isMapLoaded: true,
        });
    }

    onMarkerTap = e => {
        console.log('Marker tapped:', e);
        const markerId = e.detail.markerId;
        const marker = this.state.markers.find(m => m.id === markerId);

        if (marker) {
            Taro.showToast({
                title: `Selected: ${marker.callout.content}`,
                icon: 'none',
            });
        }
    };

    onTapMap = async e => {
        console.log('Map tapped:', e);
        const { latitude, longitude } = e.detail;

        try {
            // Use our mapService to get location information
            const locationInfo = await reverseGeocode(latitude, longitude);

            this.setState({
                selectedLocation: {
                    latitude,
                    longitude,
                    address:
                        locationInfo.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    name: locationInfo.name || 'New Location',
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
                    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    name: 'New Location',
                },
                showAddLocationPopup: true,
            });
        }
    };

    handleAddLocation = () => {
        const { selectedLocation } = this.state;

        if (selectedLocation) {
            // Navigate to location creation page with the selected location data
            Taro.navigateTo({
                url: `/pages/location/index?latitude=${selectedLocation.latitude}&longitude=${
                    selectedLocation.longitude
                }&address=${encodeURIComponent(selectedLocation.address)}&name=${encodeURIComponent(
                    selectedLocation.name
                )}`,
            });

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
        } = this.state;

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

                <View className="map-container">
                    {/* <Text className="map-title">附近宠物场所</Text> */}

                    {permissionDenied && (
                        <View className="permission-denied-banner">
                            <Text>位置权限被拒绝，展示的是默认位置信息</Text>
                        </View>
                    )}

                    {isMapLoaded ? (
                        <Map
                            className="map"
                            longitude={longitude}
                            latitude={latitude}
                            scale={scale}
                            markers={markers}
                            includePoints={includePoints}
                            showLocation={!permissionDenied}
                            onMarkerTap={this.onMarkerTap}
                            onTap={this.onTapMap}
                            enableRotate={true}
                            enableZoom={true}
                            onError={this.handleMapError}
                        />
                    ) : (
                        <View className="loading">
                            <Text>Loading map...</Text>
                        </View>
                    )}
                </View>

                <View className="location-list">
                    <Text className="list-title">Nearby Locations</Text>
                    {markers.map(marker => (
                        <View className="location-item" key={marker.id}>
                            <Text className="location-name">{marker.callout.content}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }
}

export default MapPage;
