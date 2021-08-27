import BasePage from '../../../BasePage/BasePage';
import ItemModel from '../../../../models/ItemModel';
import ItemService from '../../../../services/ItemService';
import CategoryModel from '../../../../models/CategoryModel';
import CategoryService from '../../../../services/CategoryService';
import { Button, Form, FormGroup } from 'react-bootstrap';
import React from 'react';
import { AppConfiguration } from '../../../../config/app.config';
import { Link } from 'react-router-dom';

interface ItemDashboardListState {
  // categories: Array<CategoryModel[]>;
  categories: CategoryModel[];
  selectedCategory: CategoryModel|null;
  selectedLowLevelCategory: CategoryModel|null;
  items: ItemModel[];
  message: string;
  forms: JSX.Element[];
}

export default class ItemDashboardList extends BasePage<{}> {
  state: ItemDashboardListState;

  constructor(props: any) {
    super(props);

    this.state = {
      categories: [],
      selectedCategory: null,
      selectedLowLevelCategory: null,
      forms: [],
      message: '',
      items: []
    }
  }

  // getCategoryById(id: number) {
  //   CategoryService.getCategoryById(id)
  //     .then(res => {
  //       this.setState({
  //         selectedCategory: res
  //       });
  //     })
  // }

  componentDidMount() {
    this.getAllCategories();
  }

  getAllCategories() {
    CategoryService.getTopLevelCategories('administrator')
      .then(res => {
        this.setState((state: ItemDashboardListState) => {
          state.categories = res;

          return state;
        })
      })
  }

  handleCategorySelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === '0') {
      return  this.setState({
        message: 'Please select category to show items',
        forms: [],
        selectedCategory: null
      })
    }

    this.setState({ message: '' })

    CategoryService.getCategoryById(Number(event.target.value), 'administrator')
      .then(res => {
        this.setState({selectedCategory: res})
        if (res?.subCategories.length === 0) {
          this.getItemsByCategoryId(res.categoryId)

          return this.setState({ selectedLowLevelCategory: res })
        }

        // this.setState((prevState: ItemDashboardListState) => ({forms: prevState.forms.concat([this.newForm(res)])}))
        this.setState({forms: this.state.forms.concat(this.createNewForm(res))})
      })

  }

  private getItemsByCategoryId(cid: number) {
    if (cid !== undefined) {
      ItemService.getItemsByCategoryId(cid, 'administrator')
        .then(items => {
          items.length === 0 ? this.setState({ items: [], forms: [] }) : this.setState({ items })
        })
    }
  }

  private createNewForm(res: CategoryModel|null) {
    return(
      <FormGroup key={"select-element-" + this.state.forms.length}>
        <Form.Control as="select" onChange={this.handleCategorySelectChange.bind(this)} >
          <option value="0">Select category</option>
          {
            res?.subCategories?.map((category: CategoryModel) => (
              <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
            ))
          }
        </Form.Control>
      </FormGroup>
    )
  }

  renderMain(): JSX.Element {
    return (
      <>
        <FormGroup>
          <Form.Control as="select" onChange={this.handleCategorySelectChange.bind(this)} >
            <option value="0">Select category</option>
            {
              this.state.categories.map(category => (
                <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
              ))
            }
          </Form.Control>
        </FormGroup>
        {this.state.message}
        {
          this.state.forms.map((el) => el)
        }

        {
          this.state.selectedCategory?.subCategories.length === 0 ?
            <Link className="nav-link" to={"/dashboard/" + this.state.selectedCategory?.categoryId + "/item/add"}>
              <Button variant="primary">
                Add category item
              </Button>
            </Link>
            : ''
        }

        <h1>Category items</h1>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Photo</th>
              <th>#ID</th>
              <th>Name</th>
              <th>Ingredients</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
          {
            this.state.items.map(el => (
              <tr key={"item-" + el.itemId}>
                <td> <img alt={ el.name }
                          src={ ItemService.getThumbPath(AppConfiguration.API_URL + "/" + el.photos[0].imagePath ) }
                          className="item-image"
                          width={100}/>
                </td>
                <td>{el.itemId}</td>
                <td>{el.name}</td>
                <td>{el.ingredients}</td>
                <td>
                  <Link className="nav-link" to={"/dashboard/" + this.state.selectedCategory?.categoryId + "/item/edit/" + el.itemId}>
                    <Button variant="primary">
                      Edit item
                    </Button>
                  </Link>
                  <Link className="nav-link" to={"/dashboard/" + this.state.selectedCategory?.categoryId + "/item/edit/" + el.itemId + '/photo'}>
                    <Button variant="primary">
                      Edit photo
                    </Button>
                  </Link>
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </>
    );
  }

}
