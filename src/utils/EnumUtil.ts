export enum PlaceCategory {
    ALL = 'all',
    RESTAURANT = 'restaurant',
    PARK = 'park',
    CAFE = 'cafe',
    PET_STORE = 'pet_store',
    MALL = 'mall',
    HOTEL = 'hotel',
    OTHER = 'other',
}

export const getCategoryTranslation = (category: PlaceCategory): string => {
    switch (category) {
        case PlaceCategory.RESTAURANT:
            return '餐厅';
        case PlaceCategory.CAFE:
            return '咖啡厅';
        case PlaceCategory.PET_STORE:
            return '宠物店';
        case PlaceCategory.PARK:
            return '公园';
        case PlaceCategory.HOTEL:
            return '酒店';
        case PlaceCategory.MALL:
            return '商场';
        case PlaceCategory.OTHER:
            return '其他';
        case PlaceCategory.ALL:
            return '全部';
        default:
            return '未知类别';
    }
};

export enum PetSize {
    XS = 'xsmall',
    S = 'small',
    M = 'medium',
    L = 'large',
    XL = 'xlarge',
}
export const getPetSizeTranslation = (size: PetSize): string => {
    switch (size) {
        case PetSize.XS:
            return '超小体';
        case PetSize.S:
            return '小体';
        case PetSize.M:
            return '中体';
        case PetSize.L:
            return '大体';
        case PetSize.XL:
            return '超大体';
        default:
            return '未知大小';
    }
};
