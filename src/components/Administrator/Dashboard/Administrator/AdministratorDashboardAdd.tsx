import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import AdministratorService from '../../../../services/AdministratorService';
import { Redirect } from 'react-router-dom';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';

class ItemDashboardAddProperties extends BasePageProperties {
  match?: {
    params: {
      aid: string;
    }
  }
}

interface AdministratorDashboardAddState {
  username: string;
  password: string;
  editing: boolean;
  message: string;
  redirectBackToAdmins: boolean;
}

export default class AdministratorDashboardAdd extends BasePage<ItemDashboardAddProperties> {
  state: AdministratorDashboardAddState;

  constructor(props: any) {
    super(props);

    this.state = {
      username: '',
      password: '',
      editing: false,
      message: '',
      redirectBackToAdmins: false
    }
  }

  private getEditAdminId(): number|null {
    const aid = this.props.match?.params.aid;

    return aid ? +(aid) : null;
  }

  private getEditAdminData(aid: number) {
    AdministratorService.getById(aid)
      .then(res => {
        this.setState({
          username: res?.username,
          editing: true
        })
      })
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(loggedIn => {
        if (!loggedIn) return EventRegister.emit("AUTH_EVENT", "force_login");
      });

    if (this.getEditAdminId() !== null) this.getEditAdminData(this.getEditAdminId() as number)
  }

  private onChangeInput(field: 'username' | 'password'):
    (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private handleAddButton(event: React.SyntheticEvent) {
    event.preventDefault();
    const data = {
      username: this.state.username,
      password: this.state.password
    }

    AdministratorService.addAdministrator(data)
      .then(res => {
        if (!res) {
          return this.setState({message: 'Something wrong.'})
        }

        this.setState({redirectBackToAdmins: true})
      })
  }

  private handleEditButton(event: React.SyntheticEvent) {
    event.preventDefault();

    const data = {
      password: this.state.password
    }

    AdministratorService.editAdministrator(this.getEditAdminId() as number, data)
      .then(res => {
        if (!res) {
          return this.setState({message: 'Something wrong with editing.'})
        }

        this.setState({redirectBackToAdmins: true})
      })
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToAdmins) {
      return ( <Redirect to="/dashboard/administrator" /> );
    }

    return (
      <Row className="d-flex justify-content-center">
        <Col sm={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title>
                <b> {this.state.editing ? 'Edit admin' : 'Register admin'} </b>
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Row>
                    <Col>
                      {
                        this.state.editing ?
                          <p> <b>Username:</b> { this.state.username } </p>
                          :
                          <Form.Group className="mt-2">
                            <Form.Label>E-mail:</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter username here..."
                              value={ this.state.username }
                              onChange={ this.onChangeInput("username") }
                            />
                          </Form.Group>
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mt-2">
                        <Form.Label>Password:</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter password here..."
                          value={ this.state.password }
                          onChange={ this.onChangeInput("password") }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="d-grid">
                        {
                          this.state.editing ?
                            <Button variant="primary"
                                    className="mt-3"
                                    type="submit"
                                    onClick= { this.handleEditButton.bind(this) } >
                              Edit
                            </Button>
                            :
                            <Button variant="primary"
                                    className="mt-3"
                                    type="submit"
                                    onClick= { this.handleAddButton.bind(this) } >
                              Add
                            </Button>
                        }
                      </Form.Group>
                    </Col>
                  </Row>

                  {
                    this.state.message
                      ? (<p className="mt-3">{this.state.message} </p>)
                      : ""
                  }
                </Form>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

}
