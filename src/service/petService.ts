import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/httpRequest';
// import Taro from "@tarojs/taro";
import { Pet } from '@/types/pet';

/**
 * Create a new pet
 * @param pet Pet data to create
 * @returns The created pet with ID
 */
export const createPet = async (pet: Pet): Promise<Pet> => {
    try {
        return await postRequest<Pet>('pet', pet);
    } catch (error) {
        console.error('Error creating pet:', error);
        throw error;
    }
};

/**
 * Get pets by owner ID
 * @param ownerId User ID of the pet owner
 * @returns List of pets belonging to the owner
 */
export const getPetsByOwner = async (ownerId: string): Promise<Pet[]> => {
    try {
        const petList = await getRequest<Pet[]>(`pet?ownerId=${ownerId}`);
        if (!petList) {
            return [];
        }
        return petList;
    } catch (error) {
        console.error('Error getting pets by owner:', error);
        return [];
    }
};

/**
 * Get a pet by its ID
 * @param id Pet ID
 * @returns Pet information
 */
export const getPetById = async (id: string): Promise<Pet> => {
    try {
        return await getRequest<Pet>(`pet/${id}`);
    } catch (error) {
        console.error(`Error getting pet with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Update an existing pet
 * @param id Pet ID
 * @param petData Updated pet data
 * @returns Updated pet information
 */
export const updatePet = async (id: string, petData: Partial<Pet>): Promise<Pet> => {
    try {
        if (petData.age && typeof petData.age === 'string') {
            petData.age = parseInt(petData.age, 10);
        }
        console.log('update pet', id, petData);
        return await putRequest<Pet>(`pet/${id}`, petData);
    } catch (error) {
        console.error(`Error updating pet with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a pet
 * @param id Pet ID
 * @returns True if deletion was successful
 */
export const deletePet = async (id: string): Promise<boolean> => {
    try {
        await deleteRequest<any>(`pet/${id}`);
        return true;
    } catch (error) {
        console.error(`Error deleting pet with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Get all pets nearby (no filter)
 * @returns List of all pets
 */
export const getAllPets = async (): Promise<Pet[]> => {
    try {
        return await getRequest<Pet[]>('pet');
    } catch (error) {
        console.error('Error getting all pets:', error);
        throw error;
    }
};
