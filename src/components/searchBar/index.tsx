import { View, Input, Picker, Button } from '@tarojs/components';
import { LocationCategory, CategoryDisplayNames } from '@/types/location';
import './index.css';

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
        <View className={`search-container ${transition ? 'search-transition' : ''}`}>
            <Input
                className="search-input"
                placeholder="Search for pet-friendly places"
                value={keyword}
                onInput={e => onKeywordChange(e.detail.value)}
            />
            <View className="filter-row">
                <Picker
                    mode="selector"
                    range={categoryOptions}
                    value={categoryIndex}
                    onChange={e => onCategoryChange(Number(e.detail.value))}
                >
                    <View className="picker">
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
                    <View className="picker">Search within: {radiusOptions[radiusIndex]}</View>
                </Picker>
            </View>
            <Button className="search-button" onClick={onSearch} loading={isLoading}>
                Search
            </Button>
        </View>
    );
};

export default SearchBar;
