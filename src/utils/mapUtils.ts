import { PlaceCategory, PetFriendlyPlace } from '@/types/place';
import { MapProps } from '@tarojs/components/types/Map';
import Taro from '@tarojs/taro';
import {
    CafeIcon,
    HotelIcon,
    MallIcon,
    MapPinIcon,
    ParkIcon,
    PetStoreIcon,
    RestaurantIcon,
} from './icons';

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

export const createMarkersFromPlaces = (placesData: PetFriendlyPlace[]): MapProps.marker[] => {
    if (!placesData.length) return [];

    let index = 0;
    // Create valid marker objects with required properties
    const newMarkers = placesData.map(place => {
        // Ensure the iconPath exists and is valid
        const iconPath = getMarkerIcon(place.category);

        return {
            id: index++,
            latitude: place.latitude,
            longitude: place.longitude,
            width: 35,
            height: 35,
            iconPath: iconPath,
            alpha: 1,
            callout: {
                content: place.name,
                color: '#000000',
                fontSize: 14,
                borderRadius: 4,
                bgColor: '#ffffff',
                padding: 8,
                display: 'BYCLICK', // This is already cast correctly
                // Change this:
                // textAlign: 'center',
                // To this:
                textAlign: 'center' as 'center', // Specify the exact literal type
                anchorY: 1,
                anchorX: 0.5,
                borderWidth: 1,
                borderColor: '#000000',
            },
        };
    });

    // Cast the entire array to satisfy TypeScript
    // setMarkers(newMarkers as MapProps.marker[]);
    console.log('Created markers:', newMarkers);
    return newMarkers as MapProps.marker[];
};

const getMarkerIcon = (placeType: PlaceCategory): string => {
    // For testing, you can use a default marker first to ensure it works
    const defaultMarker = MapPinIcon;

    // Make sure these icon URLs are accessible and valid
    try {
        switch (placeType) {
            case PlaceCategory.RESTAURANT:
                return RestaurantIcon;
            case PlaceCategory.CAFE:
                return CafeIcon;
            case PlaceCategory.PARK:
                return ParkIcon;
            case PlaceCategory.HOTEL:
                return HotelIcon;
            case PlaceCategory.MALL:
                return MallIcon;
            case PlaceCategory.PET_STORE:
                return PetStoreIcon;
            default:
                return defaultMarker;
        }
    } catch (e) {
        console.error('Error getting marker icon:', e);
        return defaultMarker;
    }
};
