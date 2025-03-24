/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            // Custom spacing to use 'rpx' units for WeChat mini-program
            spacing: {
                '1rpx': '1rpx',
                '2rpx': '2rpx',
                '4rpx': '4rpx',
                '8rpx': '8rpx',
                '16rpx': '16rpx',
                '24rpx': '24rpx',
                '32rpx': '32rpx',
                '48rpx': '48rpx',
                '64rpx': '64rpx',
                '96rpx': '96rpx',
                '128rpx': '128rpx',
            },
            fontSize: {
                'xs-rpx': ['24rpx', { lineHeight: '32rpx' }],
                'sm-rpx': ['28rpx', { lineHeight: '40rpx' }],
                'base-rpx': ['32rpx', { lineHeight: '48rpx' }],
                'lg-rpx': ['36rpx', { lineHeight: '52rpx' }],
                'xl-rpx': ['40rpx', { lineHeight: '56rpx' }],
            },
            borderRadius: {
                rpx: '8rpx',
                'md-rpx': '12rpx',
                'lg-rpx': '16rpx',
                'full-rpx': '9999rpx',
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false, // Disable preflight to avoid conflicts with mini program styles
    },
};
