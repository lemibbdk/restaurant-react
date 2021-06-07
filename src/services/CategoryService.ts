import api from '../api/api';
import CategoryModel from '../models/CategoryModel';
import EventRegister from '../api/EventRegister';

export default class CategoryService {
  public static getTopLevelCategories(): Promise<CategoryModel[]> {
    return new Promise<CategoryModel[]>(resolve => {
      api('GET', '/category', 'user')
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

  public static getCategoryById(categoryId: number): Promise<CategoryModel|null> {
    return new Promise<CategoryModel|null>(resolve => {
      api('GET', '/category/' + categoryId, 'user')
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
