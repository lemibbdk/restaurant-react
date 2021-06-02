import IModel from './IModel.interface';
import ItemModel from './ItemModel';

class ItemInfoModel implements IModel {
  itemInfoId: number;
  size: string;
  energyValue: number;
  mass: number;
  price: number;
  itemId: number | null = null;
  item: ItemModel | null = null;
}

export default ItemInfoModel;
