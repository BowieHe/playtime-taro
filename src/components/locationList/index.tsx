import { View, Text } from '@tarojs/components';
import { PetFriendlyPlace, CategoryDisplayNames } from '@/types/location';
import './index.css';

interface LocationListProps {
    places: PetFriendlyPlace[];
    onLocationSelect: (latitude: number, longitude: number) => void;
}

const LocationList: React.FC<LocationListProps> = ({ places, onLocationSelect }) => {
    return (
        <View className="location-list">
            <Text className="list-title">Nearby Pet-Friendly Places ({places.length})</Text>
            {places.length === 0 ? (
                <View className="empty-list">
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
                            className="location-item"
                            key={place.id || `place-${index}`}
                            onClick={() => {
                                // Center map on this location when clicked
                                if (!isNaN(latitude) && !isNaN(longitude)) {
                                    onLocationSelect(latitude, longitude);
                                }
                            }}
                        >
                            <Text className="location-name">{place.name || 'Unnamed place'}</Text>
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
    );
};

export default LocationList;
