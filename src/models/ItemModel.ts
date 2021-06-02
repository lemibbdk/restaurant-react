import IModel from './IModel.interface';
import CategoryModel from './CategoryModel';
import ItemInfoModel from './ItemInfoModel';

class Photo implements IModel {
  photoId: number;
  imagePath: string;
}

class ItemModel implements IModel {
  itemId: number;
  name: string;
  ingredients: string;
  categoryId: number;
  category: CategoryModel | null = null;
  itemInfoAll: ItemInfoModel[] = [];
  photos: Photo[] = [];
}

export default ItemModel;
export { Photo as ItemPhoto }
