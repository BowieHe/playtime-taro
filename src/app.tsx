import { Component, PropsWithChildren } from "react";
import { Provider } from "mobx-react";
import userStore from "./store/user";
import { loadFont } from "./utils/fontLoader";
import Taro from "@tarojs/taro";
import "./app.css";

const store = {
    userStore,
};

class App extends Component<PropsWithChildren> {
    componentDidMount() {
        // Load custom font for WeChat Mini Program
        this.loadCustomFonts("Capriola", "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Capriola-Regular.ttf");
        this.loadCustomFonts("LXGWWenKai", "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/LXGWWenKai-Regular.ttf");
        this.loadCustomFonts("Atma", "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Atma-Regular.ttf")
    }

    loadCustomFonts = (family: string, source: string) => {
        if (process.env.TARO_ENV === "weapp") {
            // For WeChat Mini Program
            console.log("Loading font for WeChat Mini Program...");

            // Try to load font with our utility first
            loadFont(
                family,
                source,
                () => {
                    console.log("Font loaded successfully with utility");
                },
                (err) => {
                    console.error("Failed to load font with utility", err);

                    // Fallback to direct Taro API
                    Taro.loadFontFace({
                        family: family,
                        source:
                            `url("${source}")`,
                        success: (res) => {
                            console.log("Font loaded successfully with direct API", res);
                        },
                        fail: (err) => {
                            console.error("Failed to load font with direct API", err);
                        },
                        complete: () => {
                            // Force a re-render to apply font
                            this.forceUpdate();
                        },
                    });
                }
            );
        }
    };



    onLaunch() {
        console.log("App launched");
    }

    componentDidShow() { }

    componentDidHide() { }

    render() {
        return <Provider store={store}>{this.props.children}</Provider>;
    }
}

export default App;
