export default defineAppConfig({
  pages: ["pages/index/index", "pages/pet/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
      },
      {
        pagePath: "pages/pet/index",
        text: "宠物详情",
      },
    ],
  },
});
