import api, { saveAuthToken, saveRefreshToken } from '../api/api';
import EventRegister from '../api/EventRegister';

export interface IPostalAddressData {
  address: string;
  phoneNumber: string;
}

export interface IUserData {
  email: string;
  password: string;
  forename: string;
  surname: string;
  postalAddresses: IPostalAddressData[];
}

export interface IRegistrationResult {
  success: boolean;
  message?: string;
}

export default class AuthService {
  public static userLogin(email: string, password: string) {
    api('POST', '/auth/user/login', 'user', {
      email,
      password
    }, false)
      .then(res => {
        if (res.status === 'ok') {
          const authToken = res.data?.authToken ?? '';
          const refreshToken = res.data?.refreshToken ?? '';

          saveAuthToken('user', authToken);
          saveRefreshToken('user', refreshToken);

          EventRegister.emit('AUTH_EVENT', 'user_login');
        } else {
          EventRegister.emit('AUTH_EVENT', 'user_login_failed', res.data);
        }
      })
      .catch(err => {
        EventRegister.emit("AUTH_EVENT", "user_login_failed", err);
      })
  }

  public static userRegistration(data: IUserData): Promise<IRegistrationResult> {
    return new Promise<IRegistrationResult>(resolve => {
      api('POST', '/auth/user/register', "user", data)
        .then(res => {
          console.log(res);
          if (res?.status === 'error') {
            if (Array.isArray(res?.data.data)) {
              return resolve({
                success: false,
                message: res?.data.data[0].instancePath.replace('/', '') + ' ' + res?.data.data[0].message
              });
            }

            return resolve({
              success: false,
              message: JSON.stringify(res?.data?.data)
            });
          }

          resolve({
            success: true
          });
        });
    });
  }

  public static administratorLogin(username: string, password: string) {
    api('POST', '/auth/administrator/login', 'administrator', {
      username,
      password
    }, false)
      .then(res => {
        console.log(res)
        if (res.status === 'ok') {
          const authToken = res.data?.authToken ?? '';
          const refreshToken = res.data?.refreshToken ?? '';

          saveAuthToken('administrator', authToken);
          saveRefreshToken('administrator', refreshToken);

          EventRegister.emit('AUTH_EVENT', 'administrator_login');
        } else {
          EventRegister.emit('AUTH_EVENT', 'administrator_login_failed', res.data);
        }
      })
      .catch(err => {
        EventRegister.emit("AUTH_EVENT", "administrator_login_failed", err);
      })
  }
}
