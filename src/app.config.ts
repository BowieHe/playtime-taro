export default defineAppConfig({
    pages: [
        'pages/index/index',
        'pages/map/index',
        'pages/user/index',
        'pages/pet/index',
        'pages/location/index',
        // Add any other pages your app uses
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'PlayTime',
        navigationBarTextStyle: 'black',
    },
    // tabBar: {
    //     color: '#8a8a8a',
    //     selectedColor: '#22c55e', // Green color to match your button
    //     backgroundColor: '#ffffff',
    //     borderStyle: 'black',
    //     list: [
    //         {
    //             pagePath: 'pages/index/index',
    //             text: 'Home',
    //             // iconPath: 'assets/icons/home.png',
    //             // selectedIconPath: 'assets/icons/home-active.png',
    //         },
    //         {
    //             pagePath: 'pages/map/index',
    //             text: 'Play',
    //             // iconPath: 'assets/icons/play.png',
    //             // selectedIconPath: 'assets/icons/play-active.png',
    //         },
    //         {
    //             pagePath: 'pages/user/index',
    //             text: 'Profile',
    //             // iconPath: 'assets/icons/user.png',
    //             // selectedIconPath: 'assets/icons/user-active.png',
    //         },
    //     ],
    // },
    permission: {
        'scope.userLocation': {
            desc: '您的位置信息将用于查找附近的宠物友好场所和服务', // Updated description
        },
    },
    requiredPrivateInfos: ['getLocation'],
});
