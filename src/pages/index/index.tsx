import { Component, PropsWithChildren } from "react";
import { View, Button, Text } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import Taro from "@tarojs/taro";

import "./index.css";

interface PageProps extends PropsWithChildren {
  store: {
    counterStore: {
      counter: number;
      increment: Function;
      decrement: Function;
      incrementAsync: Function;
    };
  };
}

@inject("store")
@observer
class Index extends Component<PageProps> {
  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  increment = () => {
    const { counterStore } = this.props.store;
    counterStore.increment();
  };

  decrement = () => {
    const { counterStore } = this.props.store;
    counterStore.decrement();
  };

  incrementAsync = () => {
    const { counterStore } = this.props.store;
    counterStore.incrementAsync();
  };

  navigateToIndex = () => {
    Taro.switchTab({
      url: "/pages/pet/index",
    });
  };

  render() {
    const {
      counterStore: { counter },
    } = this.props.store;
    return (
      <View className="index">
        <Button onClick={this.increment}>+</Button>
        <Button onClick={this.decrement}>-</Button>
        <Button onClick={this.incrementAsync}>Add Async</Button>
        <Text>{counter}</Text>

        <Button className="nav-button" onClick={this.navigateToIndex}>
          Go to Pet Page
        </Button>
      </View>
    );
  }
}

export default Index;
