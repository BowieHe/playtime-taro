import { View, Input, Picker, Button } from '@tarojs/components';
import { LocationCategory, CategoryDisplayNames } from '@/types/location';
// Remove CSS import since we're using Tailwind

interface SearchBarProps {
    keyword: string;
    selectedCategory: LocationCategory | '';
    searchRadius: number;
    isLoading: boolean;
    onKeywordChange: (value: string) => void;
    onCategoryChange: (value: number) => void;
    onRadiusChange: (value: number) => void;
    onSearch: () => void;
    // Add transition prop (optional)
    transition?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    keyword,
    selectedCategory,
    searchRadius,
    isLoading,
    onKeywordChange,
    onCategoryChange,
    onRadiusChange,
    onSearch,
    transition, // Optional prop
}) => {
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

    return (
        <View
            className={`bg-white p-10rpx border-b border-gray-200 ${
                transition ? 'transition-all duration-300 ease-in-out' : ''
            }`}
        >
            <Input
                className="w-full border border-gray-300 rounded-rpx p-8rpx mb-10rpx"
                placeholder="Search for pet-friendly places"
                value={keyword}
                onInput={e => onKeywordChange(e.detail.value)}
            />

            <View className="flex justify-between gap-10rpx mb-10rpx">
                <Picker
                    mode="selector"
                    range={categoryOptions}
                    value={categoryIndex}
                    onChange={e => onCategoryChange(Number(e.detail.value))}
                >
                    <View className="flex-1 bg-gray-100 rounded-rpx p-8rpx text-center text-14rpx">
                        Category:{' '}
                        {selectedCategory ? CategoryDisplayNames[selectedCategory] : 'All'}
                    </View>
                </Picker>

                <Picker
                    mode="selector"
                    range={radiusOptions}
                    value={radiusIndex}
                    onChange={e => onRadiusChange(Number(e.detail.value))}
                >
                    <View className="flex-1 bg-gray-100 rounded-rpx p-8rpx text-center text-14rpx">
                        Search within: {radiusOptions[radiusIndex]}
                    </View>
                </Picker>
            </View>

            <Button
                className="w-full mt-5rpx py-8rpx bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-rpx"
                onClick={onSearch}
                loading={isLoading}
            >
                Search
            </Button>
        </View>
    );
};

export default SearchBar;
