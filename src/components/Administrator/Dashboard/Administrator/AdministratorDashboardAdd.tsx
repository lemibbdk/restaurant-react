import BasePage from '../../../BasePage/BasePage';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import AdministratorService from '../../../../services/AdministratorService';
import { Redirect } from 'react-router-dom';

interface AdministratorDashboardAddState {
  username: string;
  password: string;
  message: string;
  redirectBackToAdmins: boolean;
}

export default class AdministratorDashboardAdd extends BasePage<{}> {
  state: AdministratorDashboardAddState;

  constructor(props: any) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      redirectBackToAdmins: false
    }
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
                <b>User Register</b>
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Row>
                    <Col>
                      <Form.Group className="mt-2">
                        <Form.Label>E-mail:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username here..."
                          value={ this.state.username }
                          onChange={ this.onChangeInput("username") }
                        />
                      </Form.Group>
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
                        <Button variant="primary"
                                className="mt-3"
                                type="submit"
                                onClick= { this.handleAddButton.bind(this) } >
                          Add
                        </Button>
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
