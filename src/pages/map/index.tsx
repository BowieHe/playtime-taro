import { Component, PropsWithChildren } from "react";
import { View, Text, Map } from "@tarojs/components";
import { observer } from "mobx-react";
import Taro from "@tarojs/taro";

import "./index.css";

interface MapState {
  latitude: number;
  longitude: number;
  markers: any[];
  includePoints: any[];
  scale: number;
  isMapLoaded: boolean;
}

@observer
class MapPage extends Component<PropsWithChildren, MapState> {
  state: MapState = {
    latitude: 31.2304, // Default to Shanghai coordinates
    longitude: 121.4737,
    markers: [],
    includePoints: [],
    scale: 14,
    isMapLoaded: false,
  };

  componentDidMount() {
    // Get user's current location
    Taro.getLocation({
      type: "gcj02",
      success: (res) => {
        const { latitude, longitude } = res;

        // Sample location markers - replace with your actual data
        const sampleLocations = [
          {
            id: 1,
            name: "Pet Park",
            latitude: latitude + 0.01,
            longitude: longitude + 0.01,
          },
          {
            id: 2,
            name: "Pet Shop",
            latitude: latitude - 0.01,
            longitude: longitude - 0.01,
          },
          {
            id: 3,
            name: "Vet Clinic",
            latitude: latitude + 0.015,
            longitude: longitude - 0.01,
          },
        ];

        // Create markers from the locations
        const markers = sampleLocations.map((location) => ({
          id: location.id,
          latitude: location.latitude,
          longitude: location.longitude,
          callout: {
            content: location.name,
            color: "#000000",
            fontSize: 14,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#cccccc",
            padding: 5,
            display: "ALWAYS",
          },
          width: 25,
          height: 25,
        }));

        // Points to include in the map view
        const includePoints = [
          { latitude, longitude },
          ...sampleLocations.map((loc) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
        ];

        this.setState({
          latitude,
          longitude,
          markers,
          includePoints,
          isMapLoaded: true,
        });
      },
      fail: (err) => {
        console.error("Failed to get location", err);
        Taro.showToast({
          title: "Failed to get your location",
          icon: "none",
        });

        // Load default markers even if we can't get the user's location
        this.loadDefaultMarkers();
      },
    });
  }

  loadDefaultMarkers() {
    // Fallback locations using the default coordinates
    const { latitude, longitude } = this.state;

    const markers = [
      {
        id: 1,
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        callout: {
          content: "Pet Park",
          color: "#000000",
          fontSize: 14,
          borderRadius: 4,
          padding: 5,
          display: "ALWAYS",
        },
        width: 25,
        height: 25,
      },
      {
        id: 2,
        latitude: latitude - 0.01,
        longitude: longitude - 0.01,
        callout: {
          content: "Pet Shop",
          color: "#000000",
          fontSize: 14,
          borderRadius: 4,
          padding: 5,
          display: "ALWAYS",
        },
        width: 25,
        height: 25,
      },
    ];

    this.setState({
      markers,
      includePoints: [
        { latitude, longitude },
        ...markers.map((m) => ({
          latitude: m.latitude,
          longitude: m.longitude,
        })),
      ],
      isMapLoaded: true,
    });
  }

  onMarkerTap = (e) => {
    console.log("Marker tapped:", e);
    const markerId = e.detail.markerId;
    const marker = this.state.markers.find((m) => m.id === markerId);

    if (marker) {
      Taro.showToast({
        title: `Selected: ${marker.callout.content}`,
        icon: "none",
      });
    }
  };

  // Add this method to handle map errors
  handleMapError = (e) => {
    console.error("Map error:", e);
    Taro.showToast({
      title: "Failed to load map",
      icon: "none",
    });
    this.setState({
      isMapLoaded: false,
    });
  };

  render() {
    const { latitude, longitude, markers, scale, includePoints, isMapLoaded } =
      this.state;

    return (
      <View className="map-page">
        <View className="map-container">
          <Text className="map-title">Pet Locations</Text>
          {isMapLoaded ? (
            <Map
              className="map"
              longitude={longitude}
              latitude={latitude}
              scale={scale}
              markers={markers}
              includePoints={includePoints}
              showLocation={true}
              onMarkerTap={this.onMarkerTap}
              enableRotate={true}
              enableZoom={true}
              onError={this.handleMapError}
            />
          ) : (
            <View className="loading">
              <Text>Loading map...</Text>
            </View>
          )}
        </View>

        <View className="location-list">
          <Text className="list-title">Nearby Locations</Text>
          {markers.map((marker) => (
            <View className="location-item" key={marker.id}>
              <Text className="location-name">{marker.callout.content}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
}

export default MapPage;
