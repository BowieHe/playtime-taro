import Taro from "@tarojs/taro";

/**
 * Load a custom font for WeChat Mini Program
 * @param family Font family name
 * @param source URL of the font file
 */
export const loadFont = (family: string, source: string): void => {
  if (process.env.TARO_ENV === "weapp") {
    Taro.loadFontFace({
      family,
      source: `url("${source}")`,
      success: (res) => {
        console.log(`Font ${family} loaded successfully`, res);
      },
      fail: (err) => {
        console.error(`Failed to load font ${family}`, err);
      },
    });
  } else {
    console.log(
      `Font loading not implemented for environment: ${process.env.TARO_ENV}`
    );
  }
};
