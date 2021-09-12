import CategoryModel from '../../../../models/CategoryModel';
import BasePage, {IFormErrors} from '../../../BasePage/BasePage';
import { Link, Redirect } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import { Fragment } from 'react';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import CategoryService from '../../../../services/CategoryService';

interface CategoryDashboardAddState {
  categories: CategoryModel[];
  name: string;
  selectedParent: string;
  message: string;
  redirectBackToCategories: boolean;
  errors: IFormErrors;
}

export default class CategoryDashboardAdd extends BasePage<{}> {
  state: CategoryDashboardAddState;

  constructor(props: any) {
    super(props);

    this.state = {
      categories: [],
      name: '',
      selectedParent: '',
      message: '',
      redirectBackToCategories: false,
      errors: {}
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
    this.loadCategories();
  }

  loadCategories() {
    CategoryService.getTopLevelCategories('administrator')
      .then(res => {
        this.setState({
          categories: res
        })
      });
  }

  private onChangeInput(field: 'name'): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private onChangeSelect(field: 'selectedParent'): (event: React.ChangeEvent<HTMLSelectElement>) => void {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      this.setState({
        [field]: event.target?.value + ''
      })
    }
  }

  findFormErrors(): IFormErrors {
    const {name, selectedParent} = this.state;
    const newErrors: IFormErrors = {};

    if (!name || name === '') newErrors.name = 'Cannot be blank!';
    else if (name.length > 30) newErrors.name = 'Name is too long';

    if (!selectedParent || selectedParent === '') {
      newErrors.selectedParent = "Cannot be blank!";
    }

    return newErrors;
  }

  private handleAddButtonClick() {
    const newErrors = this.findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      this.setState({errors: newErrors})
      return;
    }

    let parentCategoryId: number|null = null;

    if (this.state.selectedParent !== '') {
      parentCategoryId = +(this.state.selectedParent);
    }

    CategoryService.addNewCategory({
      name: this.state.name,
      parentCategoryId: parentCategoryId
    })
      .then(res => {
        if (!res.success) {
          return this.setState({
            message: res.message
          })
        }

        this.setState({
          redirectBackToCategories: true
        })
      })
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToCategories) {
      return (
        <Redirect to="/dashboard/category" />
      )
    }

    return (
      <>
        <Row>
          <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <b>Add new category</b>
                </Card.Title>
                <Card.Text as="div">
                  <Form>
                    <Form.Group>
                      <Form.Label>Name:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter category name"
                                    value={ this.state.name }
                                    onChange={ this.onChangeInput("name") }
                                    isInvalid={ !!this.state.errors.name }
                      />

                      <Form.Control.Feedback type='invalid'>
                        {this.state.errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Parent category:</Form.Label>
                      <Form.Control as="select"
                                    value={ this.state.selectedParent }
                                    onChange={ this.onChangeSelect("selectedParent") }
                                    isInvalid={ !!this.state.errors.selectedParent }
                      >
                        <option value="">Top level category</option>
                        {
                          this.state.categories.map(category => this.createSelectOptionGroup(category))
                        }
                      </Form.Control>

                      <Form.Control.Feedback type='invalid'>
                        {this.state.errors.selectedParent}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="d-grid">
                      <Button variant="primary" className="mt-3"
                              onClick= { () => this.handleAddButtonClick() } >
                        Add
                      </Button>
                    </Form.Group>

                    {
                      this.state.message
                        ? (<p className="mt-3">{ this.state.message }</p>)
                        : ""
                    }
                  </Form>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  private createSelectOptionGroup(category: CategoryModel, level: number = 0): JSX.Element {
    const levelPrefix = '» '.repeat(level);
    return (
      <Fragment key={ "category-and-subcategory-fragment-" + category.categoryId }>
        <option key={ "parent-category-option-" + category.categoryId } value={ category.categoryId }>
          { levelPrefix }{ category.name }
        </option>
        { category.subCategories.map(subCategory => this.createSelectOptionGroup(subCategory, level + 1)) }
      </Fragment>
    );
  }

  renderCategoryOptions(category: CategoryModel): JSX.Element {
    return (
      <>
        <Link to={ "/dashboard/category/edit/" + category.categoryId }
              className="btn btn-sm btn-link"
              title="Click here to edit this category"
        >
          Edit
        </Link>

        <Link to={ "/dashboard/category/feature" + category.categoryId } className="btn btn-sm btn-link">
          List features
        </Link>
      </>
    )
  }
}
