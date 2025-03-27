import { AddPlaceRequest, PetFriendlyPlace } from '@/types/location';
import { getRequest, postRequest } from '@/utils/httpRequest';

export const addPetFriendlyPlace = async (place: AddPlaceRequest) => {
    try {
        console.log('Sending place data to backend:', place);

        // Ensure the full object with adInfo and addressComponent is being sent
        return postRequest('map', place);
    } catch (error) {
        console.error('Failed to add pet-friendly place:', error);
        throw error;
    }
};

export const getPlaceById = (id: string): Promise<PetFriendlyPlace> => {
    return getRequest<PetFriendlyPlace>(`/map/${id}`);
};
