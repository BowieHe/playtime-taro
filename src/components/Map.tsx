import { View, Text, Map } from '@tarojs/components';
import { Component, PropsWithChildren } from 'react';
import { observer } from 'mobx-react';
// No need to import CSS file anymore as we're using Tailwind classes

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
                  // Keep the iconPath if it's a URL (especially our CDN URL)
                  iconPath: marker.iconPath,
              }))
            : [];

        // Log for debugging
        console.log('Map markers:', validMarkers);

        const validIncludePoints =
            Array.isArray(includePoints) && includePoints.length > 0
                ? includePoints
                : [{ latitude, longitude }];

        return (
            <View className="h-full w-full relative">
                {permissionDenied && (
                    <View className="absolute top-0 left-0 right-0 bg-red-500 bg-opacity-80 p-8rpx p-16rpx text-center z-100">
                        <Text className="text-white text-sm-rpx font-bold">
                            位置权限被拒绝，展示的是默认位置信息
                        </Text>
                    </View>
                )}

                <Map
                    className={`w-full h-full ${
                        transition ? 'transition-all duration-300 ease-in-out' : ''
                    }`}
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
                    <View className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-100">
                        <View className="bg-white p-16rpx rounded-lg-rpx shadow">
                            <Text>Loading places...</Text>
                        </View>
                    </View>
                )}

                <View className="absolute bottom-10rpx left-10rpx bg-black bg-opacity-60 text-white p-5rpx p-10rpx rounded-rpx z-50">
                    <Text className="text-white text-xs-rpx">
                        {scale <= 12 ? 'Wide Area' : scale <= 14 ? 'Medium Area' : 'Small Area'}
                    </Text>
                </View>
            </View>
        );
    }
}

export default MapComponent;
