import { Component, PropsWithChildren } from 'react';
import { Provider } from 'mobx-react';
import userStore from './store/user';
import petStore from './store/pet';
import { loadFont } from './utils/fontLoader';
import './app.css';
import './styles/common.css';
// Import tailwind styles
// import './styles/tailwind.css';
// Comment out or remove this line if you're not using Taro UI components

const store = {
    userStore,
    petStore,
};

class App extends Component<PropsWithChildren> {
    componentDidMount() {
        // Load custom font for WeChat Mini Program
        // this.loadCustomFonts("Capriola", "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Capriola-Regular.ttf");
        // this.loadCustomFonts("LXGWWenKai", "https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/LXGWWenKai-Regular.ttf");
        this.loadCustomFonts(
            'Atma',
            'https://blog-1321748307.cos.ap-shanghai.myqcloud.com/Atma-font/Atma-Regular.ttf'
        );
        // this.loadCustomFonts(
        //     "'Maple Mono'",
        //     'https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-normal.ttf'
        // );
    }

    loadCustomFonts = (family: string, source: string) => {
        if (process.env.TARO_ENV === 'weapp') {
            // For WeChat Mini Program
            console.log('Loading font for WeChat Mini Program...');

            // Try to load font with our utility first
            loadFont(
                family,
                source,
                () => {
                    console.log('Font loaded successfully with utility');
                },
                err => {
                    console.error('Failed to load font with utility', err);
                }
            );
        }
    };

    onLaunch() {
        console.log('App launched');
    }

    componentDidShow() {}

    componentDidHide() {}

    render() {
        return <Provider store={store}>{this.props.children}</Provider>;
    }
}

export default App;
