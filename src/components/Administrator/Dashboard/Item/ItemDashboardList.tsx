import BasePage from '../../../BasePage/BasePage';
import ItemModel from '../../../../models/ItemModel';
import ItemService from '../../../../services/ItemService';
import CategoryModel from '../../../../models/CategoryModel';
import CategoryService from '../../../../services/CategoryService';
import { Button, Form, FormGroup } from 'react-bootstrap';
import React from 'react';
import { AppConfiguration } from '../../../../config/app.config';
import { Link } from 'react-router-dom';
import ConfirmAction from '../../../Misc/ConfirmAction';

interface ItemDashboardListState {
  // categories: Array<CategoryModel[]>;
  categories: CategoryModel[];
  selectedCategory: CategoryModel|null;
  selectedLowLevelCategory: CategoryModel|null;
  items: ItemModel[];
  message: string;
  forms: JSX.Element[];
  showDeleteDialog: boolean;
  deleteDialogYesHandler: () => void;
  deleteDialogNoHandler: () => void;
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
      items: [],
      showDeleteDialog: false,
      deleteDialogYesHandler: () => {},
      deleteDialogNoHandler: () => {
        this.setState({
          showDeleteDialog: false,
        })
      },
    }
  }

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
        items: [],
        selectedCategory: null
      })
    }

    this.setState({ message: '' })

    CategoryService.getCategoryById(Number(event.target.value), 'administrator')
      .then(res => {
        if (!res) {
          return this.setState({message: 'Something wrong'});
        }

        this.setState({selectedCategory: res})
        if (res?.subCategories.length === 0) {
          this.getItemsByCategoryId(res.categoryId)
          if(!res.parentCategoryId) {
            this.setState({forms: this.state.forms.splice(0, (res?.subCategories.length-1))});
          }
        } else {
          this.setState({forms: []});
          this.setState({forms: this.state.forms.splice(res?.subCategories.length).concat(this.createNewForm(res))})
        }
      })

  }

  private getItemsByCategoryId(cid: number) {
    if (cid !== undefined) {
      ItemService.getItemsByCategoryId(cid, 'administrator')
        .then(items => {
          items.length === 0 ? this.setState({ items: [] }) : this.setState({ items })
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

  private deleteButtonHandler(itemId: number) {
    return () => {
      this.setState({
        showDeleteDialog: true,
        deleteDialogYesHandler: () => {
          ItemService.delete(itemId)
            .then(res => {
              if (res !== null) {
                const filtered = this.state.items.filter(el => el.itemId !== itemId);
                this.setState({items: filtered, showDeleteDialog: false});
              }
            })
        }
      })
    }
  }

  renderMain(): JSX.Element {
    return (
      <>
        {
          this.state.showDeleteDialog ? (
            <ConfirmAction
              title="Delete item"
              message="Are you sure that you want delete item?"
              yesHandler={ this.state.deleteDialogYesHandler }
              noHandler={ this.state.deleteDialogNoHandler } />
          ): ""
        }

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
        <div className="table-container-responsive">
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
                    <Button variant="danger" onClick={ this.deleteButtonHandler(el.itemId) }>
                      Delete item
                    </Button>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </>
    );
  }

}
