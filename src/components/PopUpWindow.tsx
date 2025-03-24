import React from 'react';
import { View, Text, Button } from '@tarojs/components';
// Remove CSS import since we're using Tailwind

interface PopUpWindowProps {
    visible: boolean;
    title: string;
    content: string | React.ReactNode;
    acceptText?: string;
    rejectText?: string;
    onAccept: () => void;
    onReject: () => void;
    className?: string;
}

const PopUpWindow: React.FC<PopUpWindowProps> = ({
    visible,
    title,
    content,
    acceptText = 'Accept',
    rejectText = 'Reject',
    onAccept,
    onReject,
    className = '',
}) => {
    if (!visible) return null;

    return (
        <View className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-1000 animate-fadeIn">
            <View
                className={`w-4/5 max-w-600rpx bg-white rounded-16rpx shadow-lg flex flex-col animate-slideUp ${className}`}
            >
                <View className="p-20rpx px-24rpx border-b border-gray-100">
                    <Text className="text-18rpx font-bold text-gray-800">{title}</Text>
                </View>

                <View className="p-24rpx flex-1 min-h-100rpx max-h-60vh overflow-y-auto">
                    {typeof content === 'string' ? (
                        <Text className="text-16rpx leading-normal text-gray-700">{content}</Text>
                    ) : (
                        content
                    )}
                </View>

                <View className="p-16rpx px-24rpx border-t border-gray-100 flex justify-end gap-12rpx">
                    <Button
                        className="min-w-80rpx rounded-8rpx text-16rpx py-8rpx px-16rpx bg-gray-100 text-gray-600"
                        onClick={onReject}
                    >
                        {rejectText}
                    </Button>
                    <Button
                        className="min-w-80rpx rounded-8rpx text-16rpx py-8rpx px-16rpx bg-green-500 text-white"
                        onClick={onAccept}
                    >
                        {acceptText}
                    </Button>
                </View>
            </View>
        </View>
    );
};

// Add custom animation styles to app.css or create these classes with Tailwind's @apply
// @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
// }
// @keyframes slideUp {
//     from { transform: translateY(50px); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
// }
// .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
// .animate-slideUp { animation: slideUp 0.3s ease-out; }

export default PopUpWindow;
