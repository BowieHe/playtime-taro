import { Component, PropsWithChildren } from 'react';
import { View, Button, Text, Input, Image, Textarea } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Taro from '@tarojs/taro';
import { PetStore } from '@/store/pet';
import { Pet as PetInfo, PetGender } from '@/types/pet';
import { createPet, updatePet } from '@/service/petService';
import { uploadImage } from '@/service/wechatService';
import { getPetSizeTranslation, PetSize } from '@/utils/EnumUtil';

interface PageProps extends PropsWithChildren {
    store: {
        petStore: PetStore;
    };
}

interface PageState {
    pet: {
        id?: string;
        ownerId?: string;
        name: string;
        avatar: string;
        breed: string;
        gender: PetGender;
        size: PetSize;
        age: number;
        character: string;
    };
    genderIndex: number;
    sizeIndex: number;
    isEditing: boolean;
    isLoading: boolean;
}

interface OptionType {
    value: string;
    display: string;
}

@inject('store')
@observer
class PetPage extends Component<PageProps, PageState> {
    genderOptions: OptionType[] = [
        { value: 'male', display: '公' },
        { value: 'female', display: '母' },
    ];

    sizeOptions: OptionType[] = Object.values(PetSize).map(size => ({
        value: size,
        display: getPetSizeTranslation(size),
    }));

    constructor(props) {
        super(props);

        this.state = {
            pet: {
                name: '',
                avatar: '',
                breed: '',
                gender: 'male',
                size: PetSize.M,
                character: '',
                age: 0,
            },
            genderIndex: 0,
            sizeIndex: 2,
            isEditing: false,
            isLoading: false,
        };
    }

    componentDidMount(): void {
        const params = Taro.getCurrentInstance().router?.params;
        console.log('Params received in pet:', params);

        const { petStore } = this.props.store;

        if (params) {
            if (params.id) {
                console.log('Editing pet with ID:', params.id);
                const existingPet = petStore.getPetById(params.id);

                if (existingPet) {
                    const genderIndex = this.genderOptions.findIndex(
                        o => o.value === existingPet.gender
                    );
                    const sizeIndex = this.sizeOptions.findIndex(o => o.value === existingPet.size);

                    this.setState({
                        pet: { ...existingPet },
                        genderIndex: genderIndex >= 0 ? genderIndex : 0,
                        sizeIndex: sizeIndex >= 0 ? sizeIndex : 2,
                        isEditing: true,
                    });
                }
            } else if (params.ownerId) {
                this.setState({
                    pet: {
                        ...this.state.pet,
                        ownerId: params.ownerId,
                    },
                });
            }
        }
    }

    handleAvatarUpload = () => {
        Taro.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                this.setState({
                    pet: {
                        ...this.state.pet,
                        avatar: res.tempFilePaths[0],
                    },
                });
            },
        });
    };

    handleInputChange = (key: string, e) => {
        this.setState({
            pet: {
                ...this.state.pet,
                [key]: e.detail.value,
            },
        });
    };

    handleSizeSelect = (size: PetSize) => {
        this.setState({
            pet: {
                ...this.state.pet,
                size,
            },
            sizeIndex: this.sizeOptions.findIndex(o => o.value === size) || 2,
        });
    };

    handleGenderSelect = (gender: PetGender) => {
        this.setState({
            pet: {
                ...this.state.pet,
                gender,
            },
            genderIndex: gender === 'male' ? 0 : 1,
        });
    };

    handleSubmit = async () => {
        const { petStore } = this.props.store;
        const { pet, isEditing } = this.state;

        this.setState({ isLoading: true });

        try {
            let avatarUrl = pet.avatar;
            if (avatarUrl && !avatarUrl.startsWith('http')) {
                console.log('Uploading avatar...');
                const avatar = await uploadImage(pet.avatar);
                avatarUrl = avatar.url;
            }

            const updatedPet = {
                ...pet,
                avatar: avatarUrl,
            };

            if (isEditing) {
                console.log('Updating existing pet');
                const uploadResponse = await updatePet(pet?.id || '', updatedPet as PetInfo);
                petStore.updatePet(uploadResponse);
            } else {
                console.log('Creating new pet');
                const createResponse = await createPet(updatedPet as PetInfo);
                petStore.addPet(createResponse);
            }

            Taro.showToast({
                title: '保存成功！',
                icon: 'success',
            });

            setTimeout(() => {
                Taro.navigateBack();
            }, 1500);
        } catch (error) {
            console.error('Error saving pet information:', error);
            Taro.showToast({
                title: '保存失败',
                icon: 'none',
            });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    render() {
        const { pet, isEditing, isLoading } = this.state;

        return (
            <View className="flex flex-col w-full min-h-screen bg-[#ffffff] dark:bg-[#121212] text-[#334155] dark:text-white">
                <View className="w-full px-4 pb-4 pt-3">
                    <View className="w-full bg-white dark:bg-[#181818] rounded-2xl overflow-hidden">
                        {/* Pet Avatar - Square with rounded corners like pet cards */}
                        <View className="p-5 flex justify-center items-center border-b border-gray-100 dark:border-gray-800">
                            <View
                                onClick={this.handleAvatarUpload}
                                className="relative w-full aspect-[3/2] max-h-[240px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800"
                            >
                                {pet.avatar ? (
                                    <Image
                                        className="w-full h-full object-cover"
                                        src={pet.avatar}
                                        mode="aspectFill"
                                    />
                                ) : (
                                    <View className="w-full h-full flex items-center justify-center">
                                        <Text className="text-gray-500 dark:text-gray-400 text-lg">
                                            点击添加宠物照片
                                        </Text>
                                    </View>
                                )}

                                {/* Large "+" button in bottom right */}
                                <View className="absolute bottom-4 right-4 w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg">
                                    <Text className="text-white text-2xl font-bold">+</Text>
                                </View>

                                {/* Optional gradient overlay for better text readability */}
                                {pet.avatar && (
                                    <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></View>
                                )}
                            </View>
                        </View>

                        <View className="px-5">
                            {/* Pet Name */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-24">
                                    名称
                                </Text>
                                <Input
                                    className="flex-1 text-base text-gray-800 dark:text-white bg-transparent"
                                    value={pet.name}
                                    onInput={e => this.handleInputChange('name', e)}
                                    placeholder="请输入宠物名称"
                                />
                            </View>

                            {/* Gender Selection - Radio buttons */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-24">
                                    性别
                                </Text>
                                <View className="flex flex-1 gap-6">
                                    <View
                                        className={`flex items-center py-1.5 px-3 rounded-full ${
                                            pet.gender === 'male'
                                                ? 'bg-blue-100 dark:bg-blue-900'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                        }`}
                                        onClick={() => this.handleGenderSelect('male')}
                                    >
                                        <View
                                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                                pet.gender === 'male'
                                                    ? 'border-blue-500'
                                                    : 'border-gray-400'
                                            }`}
                                        >
                                            {pet.gender === 'male' && (
                                                <View className="w-2 h-2 bg-blue-500 rounded-full"></View>
                                            )}
                                        </View>
                                        <Text
                                            className={`${
                                                pet.gender === 'male'
                                                    ? 'text-blue-600 dark:text-blue-300 font-medium'
                                                    : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            公 ♂
                                        </Text>
                                    </View>
                                    <View
                                        className={`flex items-center py-1.5 px-3 rounded-full ${
                                            pet.gender === 'female'
                                                ? 'bg-pink-100 dark:bg-pink-900'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                        }`}
                                        onClick={() => this.handleGenderSelect('female')}
                                    >
                                        <View
                                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                                pet.gender === 'female'
                                                    ? 'border-pink-500'
                                                    : 'border-gray-400'
                                            }`}
                                        >
                                            {pet.gender === 'female' && (
                                                <View className="w-2 h-2 bg-pink-500 rounded-full"></View>
                                            )}
                                        </View>
                                        <Text
                                            className={`${
                                                pet.gender === 'female'
                                                    ? 'text-pink-600 dark:text-pink-300 font-medium'
                                                    : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            母 ♀
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Pet Breed */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-24">
                                    品种
                                </Text>
                                <Input
                                    className="flex-1 text-base text-gray-800 dark:text-white bg-transparent"
                                    value={pet.breed}
                                    onInput={e => this.handleInputChange('breed', e)}
                                    placeholder="请输入品种"
                                />
                            </View>

                            {/* Pet Age */}
                            <View className="flex items-center py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base w-24">
                                    年龄
                                </Text>
                                <Input
                                    className="flex-1 text-base text-gray-800 dark:text-white bg-transparent"
                                    value={pet.age?.toString() || ''}
                                    onInput={e => this.handleInputChange('age', e)}
                                    placeholder="请输入年龄"
                                    type="number"
                                />
                            </View>

                            {/* Pet Size Selection - 5 buttons in one row */}
                            <View className="py-4 border-b border-gray-100 dark:border-gray-800">
                                <Text className="text-gray-500 dark:text-gray-400 text-base mb-3">
                                    体型
                                </Text>
                                <View className="flex justify-between">
                                    {this.sizeOptions.map(option => (
                                        <View
                                            key={option.value}
                                            className={`py-1.5 px-2 rounded-lg ${
                                                pet.size === option.value
                                                    ? 'bg-[#22c55e] text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                            }`}
                                            onClick={() =>
                                                this.handleSizeSelect(option.value as PetSize)
                                            }
                                        >
                                            <Text
                                                className={`text-xs ${
                                                    pet.size === option.value ? 'font-medium' : ''
                                                }`}
                                            >
                                                {option.display}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Pet Character Description - fixed overflow */}
                            <View className="py-4">
                                <Text className="text-gray-500 dark:text-gray-400 text-base mb-2">
                                    性格描述
                                </Text>
                                <Textarea
                                    className="w-full box-border bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-base text-gray-800 dark:text-white"
                                    value={pet.character || ''}
                                    onInput={e => this.handleInputChange('character', e)}
                                    placeholder="请输入宠物的性格描述"
                                    style="height: 100px; max-width: 100%;"
                                />
                            </View>
                        </View>

                        <View className="p-2 mt-2">
                            <Button
                                className={`w-full py-3 rounded-lg font-medium text-lg text-white text-center ${
                                    isLoading ? 'bg-gray-400' : 'bg-[#22c55e]'
                                }`}
                                onClick={this.handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? '保存中...' : isEditing ? '保存修改' : '添加宠物'}
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

export default PetPage;
