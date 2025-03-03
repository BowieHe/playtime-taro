import Taro from "@tarojs/taro";
/**
 * Load a font for WeChat Mini Program using different strategies based on environment
 */
export const loadFont = async (
  fontFamily: string,
  fontPath: string,
  cdnPath: string
) => {
  if (process.env.TARO_ENV === "weapp") {
    // For WeChat Mini Program, use CDN path
    Taro.loadFontFace({
      family: fontFamily,
      source: `url("${cdnPath}")`,
      success: (res) => console.log("Font loaded successfully", res),
      fail: (err) => console.error("Failed to load font", err),
    });
  }
  // No need to do anything for H5 as it will use the CSS @font-face
};
