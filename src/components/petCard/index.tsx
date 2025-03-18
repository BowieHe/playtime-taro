import React from "react";
import { View, Text, Image } from "@tarojs/components";
import "./index.css";
import { Pet } from "@/types/pet";

interface PetCardProps {
  pet: Pet;
  onClick?: (pet: Pet) => void;
  className?: string;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick, className = "" }) => {
  const handleClick = () => {
    if (onClick) onClick(pet);
  };

  // Get appropriate size text for display
  const getSizeText = (size: string) => {
    switch (size) {
      case "small":
        return "小型";
      case "medium":
        return "中型";
      case "large":
        return "大型";
      default:
        return "未知";
    }
  };

  // Get appropriate gender text and icon
  const getGenderDisplay = (gender: string) => {
    if (gender === "male") {
      return { text: "公", icon: "♂", class: "male" };
    } else {
      return { text: "母", icon: "♀", class: "female" };
    }
  };

  const genderInfo = getGenderDisplay(pet.gender);

  return (
    <View className={`pet-card ${className}`} onClick={handleClick}>
      <View className="pet-card-image-container">
        <Image
          className="pet-card-image"
          src={pet.avatar || "https://via.placeholder.com/150"}
          mode="aspectFill"
        />
        <View className={`pet-gender-badge ${genderInfo.class}`}>
          {genderInfo.icon}
        </View>
      </View>
      <View className="pet-card-content">
        <View className="pet-card-header">
          <Text className="pet-card-name">{pet.name}</Text>
          <View className="pet-info-row">
            {pet.breed && <Text className="pet-card-breed">{pet.breed}</Text>}
            {pet.age !== undefined && (
              <Text className="pet-card-age">{pet.age} 岁</Text>
            )}
            <Text className="pet-card-size">{getSizeText(pet.size)}</Text>
          </View>
        </View>
        {pet.desc && <Text className="pet-card-description">{pet.desc}</Text>}
      </View>
    </View>
  );
};

export default PetCard;
