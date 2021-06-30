import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import { Redirect } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import CategoryService from '../../../../services/CategoryService';

class CategoryDashboardEditProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string;
    }
  }
}

interface CategoryDashboardEditState {
  name: string;
  message: string;
  redirectBackToCategories: boolean;
}

export default class CategoryDashboardEdit extends BasePage<CategoryDashboardEditProperties> {
  state: CategoryDashboardEditState;

  constructor(props: CategoryDashboardEditProperties) {
    super(props);

    this.state = {
      name: '',
      message: '',
      redirectBackToCategories: false
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) {
          EventRegister.emit('AUTH_EVENT', 'force_login');
        }
      })
    this.loadCategoryData();
  }

  private loadCategoryData() {
    CategoryService.getCategoryById(this.getCategoryId(), "administrator")
      .then(res => {
        if (res === null) {
          return this.setState({
            message: 'Category not found.',
            redirectBackToCategories: true,
          });
        }

        this.setState({
          name: res.name
        });
      });
  }

  private onChangeInput(field: 'name'): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private getCategoryId(): number {
    return +(this.props.match?.params.cid ?? 0);
  }

  private handleEditButtonClick() {
    CategoryService.editCategory(this.getCategoryId(), {
      name: this.state.name
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
                  <b>Edit category</b>
                </Card.Title>
                <Card.Text as="div">
                  <Form>
                    <Form.Group>
                      <Form.Label>Name:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter category name"
                                    value={ this.state.name }
                                    onChange={ this.onChangeInput("name") }
                      />
                    </Form.Group>

                    <Form.Group className="d-grid">
                      <Button variant="primary" className="mt-3"
                              onClick= { () => this.handleEditButtonClick() } >
                        Edit
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
}
