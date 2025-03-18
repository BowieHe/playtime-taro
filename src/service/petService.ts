import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/utils/httpRequest";
import Taro from "@tarojs/taro";
import { Pet } from "@/types/pet";
// export interface Pet {
//   id?: string;
//   name: string;
//   gender: "male" | "female";
//   avatar: string;
//   size: "small" | "medium" | "large";
//   breed?: string;
//   desc?: string;
//   age?: number;
//   ownerId: string;
// }

/**
 * Create a new pet
 * @param pet Pet data to create
 * @returns The created pet with ID
 */
export const createPet = async (pet: Pet): Promise<Pet> => {
  try {
    return await postRequest<Pet>("pet", pet);
  } catch (error) {
    console.error("Error creating pet:", error);
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
    return await getRequest<Pet[]>(`pet?ownerId=${ownerId}`);
  } catch (error) {
    console.error("Error getting pets by owner:", error);
    throw error;
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
export const updatePet = async (
  id: string,
  petData: Partial<Pet>
): Promise<Pet> => {
  try {
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
    return await getRequest<Pet[]>("pet");
  } catch (error) {
    console.error("Error getting all pets:", error);
    throw error;
  }
};

/**
 * Upload pet avatar image
 * @param filePath Local file path of the image
 * @returns URL of the uploaded image
 */
export const uploadPetAvatar = async (filePath: string): Promise<string> => {
  try {
    // Since file upload requires a different approach than JSON requests,
    // we'll keep using Taro.uploadFile directly
    const uploadResponse = await Taro.uploadFile({
      url: "https://trip.playtime.pet/upload",
      filePath: filePath,
      name: "file",
      formData: {
        type: "pet-avatar",
      },
    });

    if (uploadResponse.statusCode === 200) {
      const data = JSON.parse(uploadResponse.data);
      console.log("Avatar uploaded successfully:", data.url);
      return data.url;
    } else {
      throw new Error(`Failed to upload avatar: ${uploadResponse.statusCode}`);
    }
  } catch (error) {
    console.error("Error uploading pet avatar:", error);
    throw error;
  }
};
