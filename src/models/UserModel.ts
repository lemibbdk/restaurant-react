import IModel from './IModel.interface';
import PostalAddressModel from './PostalAddressModel';


class UserModel implements IModel {
  userId: number;
  createdAt: Date;
  email: string;
  passwordHash: string;
  passwordResetCode?: string|null = null;
  forename: string;
  surname: string;
  isActive: boolean;
  postalAddresses: PostalAddressModel[] = [];
}

export default UserModel;
