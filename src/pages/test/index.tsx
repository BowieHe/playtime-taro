import React, { Component } from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";

/**
 * Simple Test Page
 * Used as a fallback navigation destination
 */
export default class TestPage extends Component {
  componentDidMount() {
    console.log("Test page mounted successfully!");
  }

  navigateToUserCreate = () => {
    console.log("Testing navigation to UserCreate page...");

    // Try three different navigation methods
    this.tryNavigate("navigateTo");
  };

  tryNavigate = (method) => {
    const url = "/pages/userCreate/index";
    console.log(`Trying ${method} to ${url}`);

    if (method === "navigateTo") {
      Taro.navigateTo({
        url,
        success: () => console.log(`${method} successful`),
        fail: (err) => {
          console.error(`${method} failed:`, err);
          this.tryNavigate("redirectTo");
        },
      });
    } else if (method === "redirectTo") {
      Taro.redirectTo({
        url,
        success: () => console.log(`${method} successful`),
        fail: (err) => {
          console.error(`${method} failed:`, err);
          this.tryNavigate("reLaunch");
        },
      });
    } else if (method === "reLaunch") {
      Taro.reLaunch({
        url,
        success: () => console.log(`${method} successful`),
        fail: (err) => {
          console.error(`${method} failed:`, err);
          console.log("All navigation methods failed");
        },
      });
    }
  };

  render() {
    return (
      <View
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          Test Page
        </Text>

        <Button
          type="primary"
          onClick={this.navigateToUserCreate}
          style={{
            marginBottom: "15px",
          }}
        >
          Test Navigation to UserCreate
        </Button>

        <Text
          style={{
            fontSize: "14px",
            color: "#666",
            marginTop: "20px",
          }}
        >
          Check console for navigation logs
        </Text>
      </View>
    );
  }
}
