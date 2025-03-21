import { Component, PropsWithChildren } from 'react';
import { View, Button, Text, Input, Picker, Image } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Taro from '@tarojs/taro';
import { PetStore } from '@/store/pet';
import './index.css';
import { Pet as PetInfo, PetSize, PetGender } from '@/types/pet';
import { createPet, updatePet } from '@/service/petService';
import { uploadImage } from '@/service/wechatService';

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
        desc: string;
        gender: PetGender;
        size: PetSize;
    };
    genderIndex: number;
    sizeIndex: number;
    isEditing: boolean;
}

interface OptionType {
    value: string;
    display: string;
}

@inject('store')
@observer
class PetPage extends Component<PageProps, PageState> {
    genderOptions: OptionType[] = [
        { value: 'male', display: 'Male' },
        { value: 'female', display: 'Female' },
    ];

    sizeOptions: OptionType[] = [
        { value: 'small', display: 'Small' },
        { value: 'medium', display: 'Medium' },
        { value: 'large', display: 'Large' },
    ];

    constructor(props) {
        super(props);

        this.state = {
            pet: {
                name: '',
                avatar: '',
                breed: '',
                desc: '',
                gender: 'male',
                size: 'medium',
            },
            genderIndex: 0,
            sizeIndex: 1,
            isEditing: false,
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
                    // Find the index of gender and size in our options
                    const genderIndex = this.genderOptions.findIndex(
                        o => o.value === existingPet.gender
                    );
                    const sizeIndex = this.sizeOptions.findIndex(o => o.value === existingPet.size);

                    this.setState({
                        pet: { ...existingPet },
                        genderIndex: genderIndex >= 0 ? genderIndex : 0,
                        sizeIndex: sizeIndex >= 0 ? sizeIndex : 1,
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

    handleGenderChange = e => {
        const index = e.detail.value;
        this.setState({
            genderIndex: index,
            pet: {
                ...this.state.pet,
                gender: this.genderOptions[index].value as PetGender,
            },
        });
    };

    handleSizeChange = e => {
        const index = e.detail.value;
        this.setState({
            sizeIndex: index,
            pet: {
                ...this.state.pet,
                size: this.sizeOptions[index].value as PetSize,
            },
        });
    };

    handleSubmit = async () => {
        const { petStore } = this.props.store;
        const { pet, isEditing } = this.state;

        try {
            console.log('upload avatar first');
            const avatar = await uploadImage(pet.avatar);
            this.setState({
                pet: {
                    ...pet,
                    avatar: avatar.url,
                },
            });
            if (isEditing) {
                const uploadResponse = await updatePet(pet?.id || '', pet as PetInfo);

                console.log('Updating existing pet');
                petStore.updatePet(uploadResponse);
            } else {
                const createResponse = await createPet(pet as PetInfo);
                console.log('Creating new pet');
                petStore.addPet(createResponse);
            }

            Taro.showToast({
                title: 'Information saved!',
                icon: 'success',
            });

            Taro.navigateTo({
                url: '/pages/index/index',
            });
        } catch (error) {
            console.error('Error saving pet information:', error);
            Taro.showToast({
                title: 'Failed to save information',
                icon: 'none',
            });
        }
    };

    render() {
        const { pet, genderIndex, sizeIndex } = this.state;
        const genderDisplayValues = this.genderOptions.map(option => option.display);
        const sizeDisplayValues = this.sizeOptions.map(option => option.display);

        return (
            <View className="pet">
                <View className="avatar-container">
                    {pet.avatar ? (
                        <Image className="app-avatar" src={pet.avatar} mode="aspectFill" />
                    ) : (
                        <View className="avatar-placeholder">选择头像</View>
                    )}
                    <Button onClick={this.handleAvatarUpload}>选择头像</Button>
                </View>

                <View className="form-item">
                    <Text className="label">Name:</Text>
                    <Input
                        className="input"
                        value={pet.name}
                        onInput={e => this.handleInputChange('name', e)}
                        placeholder="Enter pet name"
                    />
                </View>

                <View className="form-item">
                    <Text className="label">Gender:</Text>
                    <Picker
                        mode="selector"
                        range={genderDisplayValues}
                        value={genderIndex}
                        onChange={this.handleGenderChange}
                    >
                        <View className="picker">
                            {genderDisplayValues[genderIndex] || 'Select Gender'}
                        </View>
                    </Picker>
                </View>

                <View className="form-item">
                    <Text className="label">Size:</Text>
                    <Picker
                        mode="selector"
                        range={sizeDisplayValues}
                        value={sizeIndex}
                        onChange={this.handleSizeChange}
                    >
                        <View className="picker">
                            {sizeDisplayValues[sizeIndex] || 'Select Size'}
                        </View>
                    </Picker>
                </View>

                <View className="form-item">
                    <Text className="label">Breed:</Text>
                    <Input
                        className="input"
                        value={pet.breed}
                        onInput={e => this.handleInputChange('breed', e)}
                        placeholder="Enter breed"
                    />
                </View>
                <View className="form-item">
                    <Text className="label">Desc:</Text>
                    <Input
                        className="input"
                        value={pet.desc}
                        onInput={e => this.handleInputChange('desc', e)}
                        placeholder="Enter description"
                    />
                </View>

                <Button className="submit-button" onClick={this.handleSubmit}>
                    Save Pet Information
                </Button>
            </View>
        );
    }
}

export default PetPage;
