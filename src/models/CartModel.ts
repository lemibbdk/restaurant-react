import IModel from './IModel.interface';
import UserModel from './UserModel';
import ItemInfoModel from './ItemInfoModel';
import PostalAddressModel from './PostalAddressModel';

type OrderStatus = 'pending' | 'rejected' | 'accepted' | 'completed';

class OrderModel implements IModel {
  orderId: number;
  addressId: number;
  address: PostalAddressModel;
  createdAt: Date;
  status: OrderStatus;
  desiredDeliveryTime: Date;
  footnote: string;
}

class CartItemModel implements IModel {
  cartItemId: number;
  quantity: number;
  itemInfoId: number;
  itemInfo: ItemInfoModel;
}

export default class CartModel implements IModel {
  cartId: number;
  userId: number;
  createdAt: Date;
  user: UserModel;
  itemInfos: CartItemModel[] = [];
  order?: OrderModel|null = null;
}

export { CartItemModel, OrderModel };
export type { OrderStatus };

