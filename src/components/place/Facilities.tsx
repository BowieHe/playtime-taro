import { View, Text } from '@tarojs/components';

import {
    GiftCardOutlined,
    HomeOutlined,
    Logistics,
    ServiceOutlined,
    SmileCommentOutlined,
} from '@taroify/icons';

interface FacilitiesProps {
    wifi: boolean;
    parking: boolean;
    petSnacks: boolean;
    PetToys: boolean;
    PetToilet: boolean;
}

const Facilities: React.FC<FacilitiesProps> = ({
    wifi,
    parking,
    petSnacks,
    PetToys,
    PetToilet,
}) => {
    const enableColor = '#6B7280';
    const disableColor = '#CE3B22';
    return (
        <View className="mb-6">
            <Text className="text-lg font-bold mb-3">设施服务</Text>
            <View className="grid grid-cols-2 gap-2">
                <View className="flex items-center">
                    <ServiceOutlined
                        size="16"
                        color={wifi ? enableColor : disableColor}
                        className="mr-2"
                    />
                    <Text>免费WiFi</Text>
                </View>
                <View className="flex items-center">
                    <Logistics
                        size="16"
                        color={parking ? enableColor : disableColor}
                        className="mr-2"
                    />
                    <Text>停车场</Text>
                </View>
                <View className="flex items-center">
                    <GiftCardOutlined
                        size="16"
                        color={petSnacks ? enableColor : disableColor}
                        className="mr-2"
                    />
                    <Text>宠物零食</Text>
                </View>
                <View className="flex items-center">
                    <HomeOutlined
                        size="16"
                        color={PetToys ? enableColor : disableColor}
                        className="mr-2"
                    />
                    <Text>宠物玩具</Text>
                </View>
                <View className="flex items-center">
                    <SmileCommentOutlined
                        size="16"
                        color={PetToilet ? enableColor : disableColor}
                        className="mr-2"
                    />
                    <Text>宠物厕所</Text>
                </View>
            </View>
        </View>
    );
};

export default Facilities;
