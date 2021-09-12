import BasePage from '../../../BasePage/BasePage';
import CategoryModel from '../../../../models/CategoryModel';
import { Link } from 'react-router-dom';
import CategoryService from '../../../../services/CategoryService';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import {Button} from "react-bootstrap";

interface CategoryDashboardListState {
  categories: CategoryModel[];
}

export default class CategoryDashboardList extends BasePage<{}> {
  state: CategoryDashboardListState;

  constructor(props: any) {
    super(props);
    this.state = {
      categories: []
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) {
          EventRegister.emit('AUTH_EVENT', 'force_login');
          this.loadCategories();
        }
      })
    this.loadCategories()
  }

  loadCategories() {
    CategoryService.getTopLevelCategories('administrator')
      .then(res => {
        this.setState({
          categories: res
        })
      });
  }

  renderMain(): JSX.Element {
    return (
      <>
        <h1>Categories</h1>
        <div>
          <Link to="/dashboard/category/add" className="btn btn-sm btn-link">
            <Button variant="primary">Add new category</Button>
          </Link>
        </div>
        <div>
          { this.renderCategoryGroup(this.state.categories) }
        </div>
      </>
    )
  }

  private renderCategoryGroup(categories: CategoryModel[]): JSX.Element {
    return (
      <ul>
        {
          categories.map(category => (
            <li key={"category-list-item-" + category.categoryId}>
              <b> {category.name} </b> { this.renderCategoryOptions(category) }
              { this.renderCategoryGroup(category.subCategories) }
            </li>
          ))
        }
      </ul>
    );
  }

  renderCategoryOptions(category: CategoryModel): JSX.Element {
    return (
      <>
        <Link to={ "/dashboard/category/edit/" + category.categoryId }
              className="btn btn-sm btn-link"
              title="Click here to edit this category"
        >
          <Button variant="primary">Edit</Button>
        </Link>

        <Link to={ "/dashboard/category/feature" + category.categoryId } className="btn btn-sm btn-link">
          <Button variant="info">List features</Button>
        </Link>
      </>
    )
  }

}
