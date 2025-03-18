import { observable, action, computed } from "mobx";
import { Pet } from "@/types/pet";

export class PetStore {
  @observable pets: Pet[] = [];
  @observable currentPet: Pet | null = null;
  @observable isLoading = false;
  @observable error: string | null = null;

  @action
  setPets(pets: Pet[]) {
    this.pets = pets;
  }

  @action
  addPet(pet: Pet) {
    this.pets.push(pet);
  }

  @action
  updatePet(updatedPet: Pet) {
    const index = this.pets.findIndex((p) => p.id === updatedPet.id);
    if (index !== -1) {
      this.pets[index] = updatedPet;
    }
  }

  @action
  removePet(id: string) {
    this.pets = this.pets.filter((pet) => pet.id !== id);
  }

  @action
  setCurrentPet(pet: Pet | null) {
    this.currentPet = pet;
  }

  @action
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  @action
  setError(error: string | null) {
    this.error = error;
  }

  @computed
  get petCount() {
    return this.pets.length;
  }

  @computed
  get hasPets() {
    return this.pets.length > 0;
  }

  // Get all pets for a specific owner
  @computed
  get petsByOwner() {
    return (ownerId: string) =>
      this.pets.filter((pet) => pet.ownerId === ownerId);
  }
}

const petStore = new PetStore();
export default petStore;
