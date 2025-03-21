import Taro from '@tarojs/taro';

/**
 * Load a custom font for use in the app
 * @param family Font family name
 * @param source URL to the font file
 * @param onSuccess Optional success callback
 * @param onFail Optional failure callback
 */
export const loadFont = (
    family: string,
    source: string,
    onSuccess?: () => void,
    onFail?: (error: any) => void
) => {
    if (process.env.TARO_ENV === 'weapp') {
        console.log(`Loading font ${family} from ${source}`);

        try {
            Taro.loadFontFace({
                global: true, // Make the font available globally
                family: family,
                source: `url("${source}")`,
                success: res => {
                    console.log(`Font ${family} loaded successfully:`, res);
                    if (onSuccess) onSuccess();
                },
                fail: err => {
                    console.error(`Failed to load font ${family}:`, err);
                    if (onFail) onFail(err);
                },
            });
        } catch (error) {
            console.error(`Exception loading font ${family}:`, error);
            if (onFail) onFail(error);
        }
    } else {
        // For H5 or other environments, fonts should be loaded via CSS
        console.log(`Font loading for ${family} not needed in this environment`);
        if (onSuccess) onSuccess();
    }
};
