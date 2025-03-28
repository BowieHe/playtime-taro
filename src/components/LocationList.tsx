import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { PetFriendlyPlace } from '@/types/place';
import { samplePicture } from '@/constants/SampleData';
import { ArrowDown, ArrowUp } from '@taroify/icons';

interface LocationListProps {
    /**
     * Array of pet-friendly places to display
     */
    places: PetFriendlyPlace[];
    /**
     * Whether the places list is currently expanded
     */
    showPlacesList: boolean;
    /**
     * Callback when user toggles the places list visibility
     */
    onTogglePlacesList: () => void;
    /**
     * Callback when user selects a place to view details
     */
    onPlaceSelect: (placeId: string) => void;
    /**
     * Whether the component is currently animating (for smooth transitions)
     */
    isAnimating?: boolean;
}

/**
 * A reusable component that displays a list of pet-friendly places with expand/collapse functionality.
 * Includes place images, ratings, and detailed information.
 */
const LocationList: React.FC<LocationListProps> = ({
    places,
    showPlacesList,
    onTogglePlacesList,
    onPlaceSelect,
    isAnimating = false,
}) => {
    return (
        <View
            className={`bg-white border-t border-gray-100 z-10 absolute left-0 right-0 ${
                !isAnimating ? (showPlacesList ? 'bottom-0' : 'bottom-[-70%]') : ''
            }`}
            style={{
                height: showPlacesList ? '70%' : '60px',
                bottom: 0,
                transition: 'height 0.15s ease-out',
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
            }}
        >
            {/* Places List Header - Always visible */}
            <View
                className="px-4 flex items-center cursor-pointer"
                onClick={onTogglePlacesList}
                style={{
                    height: '60px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                }}
            >
                <View className="bg-gray-100 rounded-full px-4 py-3 flex items-center justify-between w-full">
                    <Text className="text-gray-800 text-sm">
                        附近发现{places.length}个宠物友好场所
                    </Text>
                    {showPlacesList ? (
                        <View style={{ fontSize: '20px', color: '#555' }}>
                            <ArrowDown />
                        </View>
                    ) : (
                        <View style={{ fontSize: '20px', color: '#555' }}>
                            <ArrowUp />
                        </View>
                    )}
                </View>
            </View>

            {/* Places List Content - Only visible when expanded */}
            {showPlacesList && (
                <ScrollView scrollY className="px-4 pb-4" style={{ height: 'calc(100% - 60px)' }}>
                    {places.map(place => (
                        <View
                            key={place.id}
                            className="flex flex-row items-center p-3 border-b border-gray-100"
                            onClick={() => onPlaceSelect(place.id)}
                        >
                            <Image
                                src={place.photos?.[0] || samplePicture}
                                className="w-16 h-16 rounded-lg mr-3 object-cover"
                                mode="aspectFill"
                            />
                            <View className="flex-1">
                                <Text className="font-medium text-base">{place.name}</Text>
                                <View className="flex flex-row items-center mt-1">
                                    <Text className="text-yellow-500 mr-1">★</Text>
                                    <Text className="text-sm mr-2">{place.rating}</Text>
                                    <Text className="text-xs text-gray-500">
                                        {place.reviews}条评价
                                    </Text>
                                    <Text className="text-xs text-gray-500 ml-2">
                                        · {place.distance}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-500 mt-1">{place.address}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default LocationList;
