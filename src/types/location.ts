import { AddressComponent, AdInfo } from './map';

export interface AddLocationRequest {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    adInfo: AdInfo | null;
    addressComponent: AddressComponent | null;
    isPetFriendly: boolean;
    petSize: string;
    petType: string;
    zone: string;
    description: string;
}
