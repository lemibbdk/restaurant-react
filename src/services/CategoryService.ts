import api, { ApiRole } from '../api/api';
import CategoryModel from '../models/CategoryModel';
import EventRegister from '../api/EventRegister';

interface IAddCategory {
  name: string;
  parentCategoryId: number | null;
}

interface IEditCategory {
  name: string;
}

interface IResult {
  success: boolean;
  message?: string;
}

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

  public static addNewCategory(data: IAddCategory): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      api('POST', '/category', 'administrator', data)
        .then(res => {
          if (res?.status === 'error') {
            if (Array.isArray(res?.data?.data)) {
              const field = res?.data?.data[0].instancePath.replace('/', '');
              const msg = res?.data?.data[0]?.message;
              const error = field + ' ' + msg;
              return resolve({
                success: false,
                message: error
              })
            }
          }

          if (res?.data?.errorCode === 1062) {
            return resolve({
              success: false,
              message: 'Category with this name already exists.'
            })
          }

          return resolve({
            success: true
          })
        })
    })
  }

  public static editCategory(categoryId: number, data: IEditCategory): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      api('PUT', '/category/' + categoryId, 'administrator', data)
        .then(res => {
          if (res?.status === 'error') {
            if (Array.isArray(res?.data?.data)) {
              const field = res?.data?.data[0]?.instancePath.replace('/', '');
              const msg   = res?.data?.data[0]?.message;
              const error = field + ' ' + msg;
              return resolve({
                success: false,
                message: error,
              });
            }
          }

          if (res?.data?.errorCode === 1062) {
            return resolve({
              success: false,
              message: 'A category with this name already exists.',
            });
          }

          return resolve({
            success: true,
          });
        })
    });
  }
}
