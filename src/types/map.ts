// Types for map-related data

export interface SearchResult {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    // Add other properties as needed
}

export interface GeocodingResult {
    location: Coordinates;
    address: string;
    address_component: AddressComponent | null;
    ad_info: AdInfo | null;
    formatted_addresses: FormattedAddress | null;
    poi_count: number;
    pois: POI[];
}

// Location coordinates
export interface Coordinates {
    lat: number;
    lng: number;
}

// Address formatting options
export interface FormattedAddress {
    recommend: string;
    rough: string;
    standard_address: string;
}

// Address components breakdown
export interface AddressComponent {
    nation: string;
    province: string;
    city: string;
    district: string;
    street: string;
    street_number: string;
}

// Administrative area information
export interface AdInfo {
    nation_code: string;
    adcode: string;
    city_code: string;
    district_code: string;
    nationality_code: string;
}

// Point of interest
export interface POI {
    id: string;
    title: string;
    address: string;
    category: string;
    location: Coordinates;
    _distance: number;
}

// Main location response interface
export interface LocationResponse {
    location: Coordinates;
    address: string;
    address_component: AddressComponent;
    ad_info: AdInfo;
    formatted_addresses: FormattedAddress;
    poi_count: number;
    pois: POI[];
}

// Helper type for extracting a single POI with enhanced address info
export interface EnhancedPOI extends POI {
    province: string;
    city: string;
    district: string;
    formattedAddress: string;
}
