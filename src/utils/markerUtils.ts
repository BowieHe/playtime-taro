import Taro from '@tarojs/taro';

// Function to convert SVG to base64 data URL for marker icons
export const svgToDataURL = (svgElement: SVGSVGElement): string => {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const base64 = Taro.arrayBufferToBase64(new TextEncoder().encode(svgString));
    return `data:image/svg+xml;base64,${base64}`;
};

// Function to create marker icons for the map
export const createMarkerIcon = (type: string): string => {
    // In a real app, you'd generate SVG markers dynamically
    // For now, we'll use static image paths
    switch (type) {
        case 'restaurant':
            return '../../assets/marker-icons/restaurant-marker.png';
        case 'cafe':
            return '../../assets/marker-icons/cafe-marker.png';
        case 'park':
            return '../../assets/marker-icons/park-marker.png';
        case 'hotel':
            return '../../assets/marker-icons/hotel-marker.png';
        case 'mall':
            return '../../assets/marker-icons/mall-marker.png';
        case 'pet_shop':
            return '../../assets/marker-icons/pet-shop-marker.png';
        default:
            return '../../assets/marker-icons/default-marker.png';
    }
};
