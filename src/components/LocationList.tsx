import { View, Text } from '@tarojs/components';
import { PetFriendlyPlace, CategoryDisplayNames } from '@/types/location';
// Remove CSS import since we're using Tailwind

interface LocationListProps {
    places: PetFriendlyPlace[];
    onLocationSelect: (latitude: number, longitude: number) => void;
}

const LocationList: React.FC<LocationListProps> = ({ places, onLocationSelect }) => {
    return (
        <View className="flex-1 overflow-y-auto p-10rpx bg-white border-t border-gray-200">
            <Text className="font-bold text-16rpx mb-10rpx text-gray-800">
                Nearby Pet-Friendly Places ({places.length})
            </Text>

            {places.length === 0 ? (
                <View className="flex justify-center items-center h-100rpx text-gray-500">
                    <Text>No pet-friendly places found nearby.</Text>
                </View>
            ) : (
                places.map((place, index) => {
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
                        } else if ('latitude' in place.location && 'longitude' in place.location) {
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
                            className="p-10rpx border-b border-gray-200 flex flex-col active:bg-gray-50"
                            key={place.id || `place-${index}`}
                            hoverClass="bg-gray-50"
                            onClick={() => {
                                // Center map on this location when clicked
                                if (!isNaN(latitude) && !isNaN(longitude)) {
                                    onLocationSelect(latitude, longitude);
                                }
                            }}
                        >
                            <Text className="text-16rpx font-bold mb-4rpx text-gray-800">
                                {place.name || 'Unnamed place'}
                            </Text>
                            <Text className="text-14rpx text-gray-600 mb-4rpx">
                                {place.category
                                    ? CategoryDisplayNames[place.category] || 'Other'
                                    : 'Unknown category'}
                            </Text>
                            <Text className="text-14rpx text-gray-700 mb-4rpx">
                                {place.address || 'No address'}
                            </Text>
                            {place.distance !== undefined && !isNaN(place.distance) && (
                                <Text className="text-12rpx text-blue-600">
                                    {(place.distance / 1000).toFixed(1)}km away
                                </Text>
                            )}
                        </View>
                    );
                })
            )}
        </View>
    );
};

export default LocationList;
