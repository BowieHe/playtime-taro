import { Component, PropsWithChildren } from "react";
import { Provider } from "mobx-react";
// import Taro from "@tarojs/taro";

import counterStore from "./store/counter";
import { loadFont } from "./utils/fontLoader";

import "./app.css";

const store = {
  counterStore,
};

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // Load custom font for WeChat Mini Program from local path
    if (process.env.TARO_ENV === "weapp") {
      // For WeChat Mini Program, you need to use a fully qualified URL
      // OR reference the font through the cloud storage path/CDN
      // Local references don't work directly with wx.loadFontFace

      loadFont(
        "Atma",
        "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Atma-Regular.ttf"
      );
      // Taro.loadFontFace({
      //   family: "Atma",
      //   // For mini programs, you need a network address instead of local file path
      //   // Options:
      //   // 1. Upload to CDN and use that URL
      //   source:
      //     'url("https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Atma-Regular.ttf")',
      //   // 2. If using WeChat cloud storage:
      //   // source: 'url("cloud://your-env.your-path/Atma-Regular.ttf")',
      //   success: (res) => {
      //     console.log("Font loaded successfully", res);
      //   },
      //   fail: (err) => {
      //     console.error("Failed to load font", err);
      //   },
      // });
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  // this.props.children 就是要渲染的页面
  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}

export default App;
