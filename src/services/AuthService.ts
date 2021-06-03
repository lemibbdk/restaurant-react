import api, { saveAuthToken, saveRefreshToken } from '../api/api';
import EventRegister from '../api/EventRegister';

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

      })
  }
}
