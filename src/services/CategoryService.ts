import api, { ApiRole } from '../api/api';
import CategoryModel from '../models/CategoryModel';
import EventRegister from '../api/EventRegister';

export default class CategoryService {
  public static getTopLevelCategories(role: ApiRole = 'user'): Promise<CategoryModel[]> {
    return new Promise<CategoryModel[]>(resolve => {
      api('GET', '/category', role)
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve([]);
          }

          resolve(res.data as CategoryModel[])
        });
    })
  }

  public static getCategoryById(categoryId: number, role: ApiRole = 'user'): Promise<CategoryModel|null> {
    return new Promise<CategoryModel|null>(resolve => {
      api('GET', '/category/' + categoryId, role)
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as CategoryModel);
        });
    })
  }
}
