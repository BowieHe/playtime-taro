# Font Usage in WeChat Mini Program

For WeChat Mini Program, `wx.loadFontFace` requires fonts to be loaded from a network URL, not a local file path. Here are the options:

## Option 1: Using WeChat Cloud Storage

1. Upload your font files to WeChat Cloud Storage
2. Get the downloadable URL
3. Use that URL in `wx.loadFontFace`

```js
Taro.loadFontFace({
  family: "Atma",
  source: 'url("cloud://your-env-id.your-path/Atma-Regular.ttf")',
  success: console.log,
});
```

## Option 2: Using External CDN

1. Upload your font files to a CDN (Aliyun OSS, Qiniu, etc.)
2. Use the CDN URL in `wx.loadFontFace`

```js
Taro.loadFontFace({
  family: "Atma",
  source: 'url("https://your-cdn.com/fonts/Atma-Regular.ttf")',
  success: console.log,
});
```

## Option 3: Base64 Encoding (for small fonts only)

For small font files, you can use base64 encoding:

```js
Taro.loadFontFace({
  family: "Atma",
  source: "data:font/ttf;base64,YOUR_BASE64_ENCODED_FONT",
  success: console.log,
});
```

## CSS Usage

In CSS, you can still use the standard font-face approach which will work for H5 builds:

```css
@font-face {
  font-family: "Atma";
  src: url("./Atma-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
}
```

But for the Mini Program builds, the dynamic loading approach above is required.
