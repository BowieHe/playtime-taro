import { PetFriendlyPlace } from '@/types/location';
import Taro from '@tarojs/taro';

/**
 * Checks if location permission is granted
 * @returns A promise that resolves to a boolean indicating if permission is granted
 */
export const checkLocationPermission = (): Promise<boolean> => {
    return new Promise(resolve => {
        Taro.getSetting({
            success: res => {
                if (res.authSetting['scope.userLocation']) {
                    console.log('Location permission already granted');
                    resolve(true);
                } else {
                    console.log('Location permission not granted yet');
                    resolve(false);
                }
            },
            fail: () => {
                console.error('Failed to get permission settings');
                resolve(false);
            },
        });
    });
};

/**
 * Requests location permission through WeChat API
 * @returns A promise that resolves to a boolean indicating if permission was granted
 */
export const requestLocationPermission = (): Promise<boolean> => {
    return new Promise(resolve => {
        Taro.authorize({
            scope: 'scope.userLocation',
            success: () => {
                console.log('Location permission granted');
                resolve(true);
            },
            fail: err => {
                console.error('Location permission denied:', err);

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

                resolve(false);
            },
        });
    });
};

/**
 * Gets the user's current location
 * @returns A promise with the user's coordinates or null if location fetching fails
 */
export const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise(resolve => {
        Taro.getLocation({
            isHighAccuracy: true,
            type: 'gcj02',
            success: res => {
                const { latitude, longitude } = res;
                console.log('Got location:', latitude, longitude);
                resolve({ latitude, longitude });
            },
            fail: err => {
                console.error('Failed to get location:', err);
                Taro.showToast({
                    title: 'Failed to get location',
                    icon: 'none',
                });
                resolve(null);
            },
        });
    });
};

/**
 * Get appropriate map scale based on search radius
 * @param radius Search radius in meters
 * @returns Map scale value
 */
export const getScaleFromRadius = (radius: number): number => {
    // WeChat map scale values roughly correspond to:
    // 18: ~50m, 17: ~100m, 16: ~200m, 15: ~500m, 14: ~1km, 13: ~2km, 12: ~5km, 11: ~10km, 10: ~20km

    // Make the scale calculation more precise for better UX
    if (radius <= 1000) return 16; // 1km - show a bit more detail
    if (radius <= 3000) return 14; // 3km
    if (radius <= 5000) return 13; // 5km
    if (radius <= 10000) return 11; // 10km
    return 10; // Larger radius
};

/**
 * Creates markers from pet-friendly places
 */
export const createMarkersFromPlaces = (
    places: PetFriendlyPlace[],
    defaultLat: number,
    defaultLng: number,
    searchRadius: number = 3000 // Default to 3km
) => {
    if (!places || places.length === 0) {
        return {
            markers: [],
            includePoints: [{ latitude: defaultLat, longitude: defaultLng }],
            scale: getScaleFromRadius(searchRadius), // Set scale based on radius
        };
    }

    try {
        // Filter out places with invalid coordinates
        const validPlaces = places.filter(place => {
            try {
                // First check if place exists
                if (!place || !place.location) return false;

                // Handle GeoJSON format (type: "Point", coordinates: [lng, lat])
                if (place.location.type === 'Point' && Array.isArray(place.location.coordinates)) {
                    const lng = place.location.coordinates[0];
                    const lat = place.location.coordinates[1];

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

                    return (
                        typeof lat === 'number' &&
                        typeof lng === 'number' &&
                        !isNaN(lat) &&
                        !isNaN(lng) &&
                        isFinite(lat) &&
                        isFinite(lng)
                    );
                }

                return false;
            } catch (e) {
                console.error('Error validating place:', e);
                return false;
            }
        });

        if (validPlaces.length === 0) {
            return {
                markers: [],
                includePoints: [{ latitude: defaultLat, longitude: defaultLng }],
                scale: getScaleFromRadius(searchRadius), // Set scale based on radius
            };
        }

        // Create markers from the pet-friendly places with valid coordinates
        const markers = validPlaces
            .map((place, index) => {
                try {
                    // Ensure we have a valid ID string that's converted to a number
                    // WeChat requires marker IDs to be numbers
                    const markerId =
                        typeof place.id === 'string' && /^\d+$/.test(place.id)
                            ? Number(place.id)
                            : index + 1; // Use index+1 as fallback ID (must be a number)

                    // Get coordinates based on the format
                    let latitude, longitude;

                    if (
                        place.location.type === 'Point' &&
                        Array.isArray(place.location.coordinates)
                    ) {
                        longitude = place.location.coordinates[0];
                        latitude = place.location.coordinates[1];
                    } else if ('latitude' in place.location && 'longitude' in place.location) {
                        latitude = place.location.latitude;
                        longitude = place.location.longitude;
                    } else {
                        return null;
                    }

                    return {
                        id: markerId, // Now using a numeric ID
                        latitude,
                        longitude,
                        // Remove iconPath to use default WeChat marker
                        // iconPath: iconPath,
                        width: 20, // Make markers a bit smaller
                        height: 20,
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

        // Points to include in the map view
        let includePoints: Array<{ latitude: number; longitude: number }> = [];

        // Add user location to includePoints
        includePoints.push({ latitude: defaultLat, longitude: defaultLng });

        // Add valid place coordinates to includePoints
        validPlaces.forEach(place => {
            try {
                let latitude, longitude;

                if (place.location.type === 'Point' && Array.isArray(place.location.coordinates)) {
                    longitude = place.location.coordinates[0];
                    latitude = place.location.coordinates[1];
                } else if ('latitude' in place.location && 'longitude' in place.location) {
                    latitude = place.location.latitude;
                    longitude = place.location.longitude;
                } else {
                    return;
                }

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

        // Set scale based on search radius
        const scale = getScaleFromRadius(searchRadius);

        return { markers, includePoints, scale };
    } catch (error) {
        console.error('Error in createMarkersFromPlaces:', error);
        return {
            markers: [],
            includePoints: [{ latitude: defaultLat, longitude: defaultLng }],
            scale: getScaleFromRadius(searchRadius),
        };
    }
};
