import UserModel from '../models/UserModel';
import api, { ApiResponse } from '../api/api';
import EventRegister from '../api/EventRegister';
import PostalAddressModel from '../models/PostalAddressModel';

interface IEditUser {
  email: string;
  password: string;
  forename: string;
  surname: string;
  postalAddresses: PostalAddressModel[];
  isActive: boolean;
}

export default class UserService {
  public static getUsers(): Promise<UserModel[]|null> {
    return new Promise<UserModel[]|null>(resolve => {
      api('GET', '/user', 'administrator')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as UserModel[]);
        })
    })
  }

  public static getById(userId: number): Promise<UserModel | null>{
    return new Promise<UserModel | null>(resolve => {
      api('GET', '/user/' + userId, 'user')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as UserModel)
        })
    });
  }

  public static edit(userId: number, data: IEditUser): Promise<UserModel | null> {
    return new Promise<UserModel | null>(resolve => {
     api('PUT', '/user/' + userId, 'user', data)
       .then(res => {
         if (res?.status !== 'ok') {
           if (res.status === 'login') {
             EventRegister.emit('AUTH_EVENT', 'force_login');
           }

           return resolve(null);
         }

         resolve(res.data as UserModel)
       })
    });
  }

  public static delete(userId: number): Promise<ApiResponse | null> {
    return new Promise<ApiResponse|null>(resolve => {
      api('DELETE', '/user/' + userId, 'user')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data)
        })
    });
  }
}
