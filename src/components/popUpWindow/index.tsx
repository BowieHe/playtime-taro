import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import './index.css';

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
        <View className="popup-overlay">
            <View className={`popup-window ${className}`}>
                <View className="popup-header">
                    <Text className="popup-title">{title}</Text>
                </View>

                <View className="popup-content">
                    {typeof content === 'string' ? (
                        <Text className="popup-text">{content}</Text>
                    ) : (
                        content
                    )}
                </View>

                <View className="popup-actions">
                    <Button className="popup-button reject-button" onClick={onReject}>
                        {rejectText}
                    </Button>
                    <Button className="popup-button accept-button" onClick={onAccept}>
                        {acceptText}
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default PopUpWindow;
