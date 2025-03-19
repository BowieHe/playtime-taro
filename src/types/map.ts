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
  address: string;
  name: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  // Add other properties as needed based on your backend response
}
