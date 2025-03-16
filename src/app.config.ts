export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/userCreate/index",
    "pages/debug/index",
    "pages/pet/index",
    "pages/map/index",
    "pages/test/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  // Comment out TabBar temporarily for testing navigation
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
      {
        pagePath: "pages/map/index",
        text: "地图",
      },
    ],
  },
  permission: {
    "scope.userLocation": {
      desc: "您的位置信息将用于显示您附近的宠物友好场所",
    },
  },
});
