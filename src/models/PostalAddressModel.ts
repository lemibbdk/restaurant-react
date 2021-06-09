import IModel from './IModel.interface';
import UserModel from './UserModel';

class PostalAddressModel implements IModel {
  postalAddressId: number;
  userId: number;
  address: string;
  phoneNumber: string;
  user: UserModel;
  isActive: boolean;
}

export default PostalAddressModel;
