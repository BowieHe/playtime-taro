import { AddPlaceRequest, PetFriendlyPlace, Review } from '@/types/place';
import { getRequest, postRequest } from '@/utils/httpRequest';

export const addPetFriendlyPlace = async (place: AddPlaceRequest): Promise<PetFriendlyPlace> => {
    try {
        console.log('Sending place data to backend:', place);

        // Ensure the full object with adInfo and addressComponent is being sent
        return postRequest<PetFriendlyPlace>('map', place);
    } catch (error) {
        console.error('Failed to add pet-friendly place:', error);
        throw error;
    }
};

export const getPlaceById = (id: string): Promise<PetFriendlyPlace> => {
    return getRequest<PetFriendlyPlace>(`/place/${id}`);
};

export const addReview = (review: Review) => {
    try {
        return postRequest('/review', review);
    } catch (error) {
        console.error('falied to create review', error);
        throw error;
    }
};

// this id is a place id
export const getReviewsByPlace = (id: string): Promise<Review[]> => {
    try {
        const uri = `/review/place/${id}`;
        return getRequest<Review[]>(uri);
    } catch (error) {
        console.error(`failed to get place: ${id}'s reviews `, error);
        throw error;
    }
};
