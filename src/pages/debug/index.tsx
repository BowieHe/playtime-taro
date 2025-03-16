import { Component } from "react";
import { View, Button, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";

// Simple debugging page to test navigation
class Debug extends Component {
  componentDidMount() {
    console.log("Debug page mounted!");
  }

  navigateToIndex = () => {
    Taro.navigateTo({
      url: "/pages/index/index",
      success: () => console.log("Navigation to index successful"),
      fail: (err) => console.error("Navigation to index failed:", err),
    });
  };

  navigateToUserCreate = () => {
    Taro.navigateTo({
      url: "/pages/userCreate/index",
      success: () => console.log("Navigation to userCreate successful"),
      fail: (err) => console.error("Navigation to userCreate failed:", err),
    });
  };

  render() {
    return (
      <View style={{ padding: "20px" }}>
        <Text
          style={{ fontSize: "24px", marginBottom: "20px", display: "block" }}
        >
          Navigation Debug Page
        </Text>

        <View style={{ marginBottom: "20px" }}>
          <Button onClick={this.navigateToIndex} type="primary">
            Go to Index Page
          </Button>
        </View>

        <View>
          <Button onClick={this.navigateToUserCreate} type="primary">
            Go to UserCreate Page
          </Button>
        </View>
      </View>
    );
  }
}

export default Debug;
