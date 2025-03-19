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
    const petList = await getRequest<Pet[]>(`pet?ownerId=${ownerId}`);
    console.log("Get pets by owner:", petList);
    return petList;
  } catch (error) {
    console.error("Error getting pets by owner:", error);
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
    console.log("Uploading pet avatar image:", filePath);

    const contentType = getContentTypeFromFilePath(filePath);
    console.log(`Detected content type: ${contentType}`);
    // Upload file using Taro's upload file API
    const uploadResponse = await Taro.uploadFile({
      url: "https://trip.playtime.pet/wechat/upload",
      filePath: filePath,
      name: "file",
      header: {
        "Content-Type": contentType,
      },
      formData: {
        type: "pet-avatar",
      },
    });

    if (uploadResponse.statusCode !== 200) {
      throw new Error(
        `Upload failed with status code ${uploadResponse.statusCode}`
      );
    }

    // Parse response to get the image URL
    const result = JSON.parse(uploadResponse.data);

    if (result.code !== 0) {
      throw new Error(result.message || "Failed to upload image");
    }

    console.log("Avatar uploaded successfully:", result.data.url);
    return result.data.url;
  } catch (error) {
    console.error("Error uploading pet avatar:", error);
    throw new Error("Failed to upload image: " + error.message);
  }
};

/**
 * Helper function to determine content type from file path
 * @param filePath Path to the file
 * @returns Content-Type string
 */
function getContentTypeFromFilePath(filePath: string): string {
  // Default content type for images
  let contentType = "image/jpeg";

  // Get file extension (convert to lowercase)
  const ext = filePath.substring(filePath.lastIndexOf(".") + 1).toLowerCase();

  // Map extensions to content types
  switch (ext) {
    case "png":
      contentType = "image/png";
      break;
    case "jpg":
    case "jpeg":
      contentType = "image/jpeg";
      break;
    case "gif":
      contentType = "image/gif";
      break;
    case "webp":
      contentType = "image/webp";
      break;
    case "bmp":
      contentType = "image/bmp";
      break;
    case "heic":
      contentType = "image/heic";
      break;
    case "svg":
      contentType = "image/svg+xml";
      break;
    default:
      console.warn(
        `Unknown file extension: ${ext}, using default content type`
      );
  }

  return contentType;
}
