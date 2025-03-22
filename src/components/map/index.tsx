import { View, Text, Map } from '@tarojs/components';
import { Component, PropsWithChildren } from 'react';
import { observer } from 'mobx-react';
import './index.css';

interface MapComponentProps {
    latitude: number;
    longitude: number;
    scale: number;
    markers: any[];
    includePoints: any[];
    showLocation: boolean;
    isLoading: boolean;
    permissionDenied: boolean;
    onMarkerTap: (e: any) => void;
    onPoiTap: (e: any) => void;
    onMapError: (e: any) => void;
    transition?: boolean;
}

@observer
class MapComponent extends Component<PropsWithChildren<MapComponentProps>> {
    static defaultProps = {
        transition: true,
    };

    render() {
        const {
            latitude,
            longitude,
            scale,
            markers,
            includePoints,
            showLocation,
            isLoading,
            permissionDenied,
            onMarkerTap,
            onPoiTap,
            onMapError,
            transition,
        } = this.props;

        // Log scale for debugging
        console.log('Map scale:', scale);

        // Ensure we have valid markers with numeric IDs
        const validMarkers = Array.isArray(markers)
            ? markers.map(marker => ({
                  ...marker,
                  id: typeof marker.id === 'number' ? marker.id : Number(marker.id) || 1,
                  // Remove iconPath to use default markers
                  iconPath: undefined,
              }))
            : [];

        // Log for debugging
        console.log('Map markers:', validMarkers);

        const validIncludePoints =
            Array.isArray(includePoints) && includePoints.length > 0
                ? includePoints
                : [{ latitude, longitude }];

        return (
            <View className="map-container">
                {permissionDenied && (
                    <View className="permission-denied-banner">
                        <Text>位置权限被拒绝，展示的是默认位置信息</Text>
                    </View>
                )}

                <Map
                    className={`map ${transition ? 'map-transition' : ''}`}
                    longitude={longitude}
                    latitude={latitude}
                    scale={scale}
                    markers={validMarkers}
                    includePoints={validIncludePoints}
                    showLocation={showLocation}
                    onMarkerTap={onMarkerTap}
                    onPoiTap={onPoiTap}
                    enableRotate={true}
                    enableZoom={true}
                    onError={onMapError}
                />

                {isLoading && (
                    <View className="map-overlay">
                        <View className="loading-indicator">
                            <Text>Loading places...</Text>
                        </View>
                    </View>
                )}

                <View className="radius-indicator">
                    <Text className="radius-text">
                        {scale <= 12 ? 'Wide Area' : scale <= 14 ? 'Medium Area' : 'Small Area'}
                    </Text>
                </View>
            </View>
        );
    }
}

export default MapComponent;
