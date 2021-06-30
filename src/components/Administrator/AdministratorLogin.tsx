import BasePage from '../BasePage/BasePage';
import EventRegister from '../../api/EventRegister';
import { Redirect } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import AuthService from '../../services/AuthService';

class AdministratorLoginState {
  username: string = '';
  password: string = '';
  message: string = '';
  isLoggedIn: boolean = false;
}

export default class AdministratorLogin extends BasePage<{}> {
  state: AdministratorLoginState;

  constructor(props: any) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      isLoggedIn: false
    }
  }

  componentDidMount() {
    EventRegister.on("AUTH_EVENT", this.handleAuthEvent.bind(this));
  }

  componentWillUnmount() {
    EventRegister.off("AUTH_EVENT", this.handleAuthEvent.bind(this));
  }

  private handleAuthEvent(status: string, data: any) {
    if (status === 'administrator_login_failed') {
      if (Array.isArray(data?.data) && data?.data[0]?.instancePath === '/username') {
        return this.setState({
          message: 'Invalid username: ' + data?.data[0]?.message
        });
      }

      if (Array.isArray(data?.data) && data?.data[0]?.instancePath === '/password') {
        return this.setState({
          message: 'Invalid password: ' + data?.data[0]?.message
        });
      }

      if (data?.status === 404) {
        return this.setState({
          message: 'Administrator not found: '
        });
      }

      if (data?.status === 400 && data?.data === 'Invalid administrator password.') {
        return this.setState({
          message: 'Wrong password.'
        });
      }

      if (data?.status === 400 && data?.data === 'Administrator account inactive.') {
        return this.setState({
          message: 'Account is inactive.'
        });
      }
    }

    if (status === 'administrator_login') {
      return this.setState({
        username: '',
        password: '',
        isLoggedIn: true,
      });
    }
  }

  private onChangeInput(field: 'username' | 'password'): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private handleLogInButtonClick() {
    AuthService.administratorLogin(this.state.username, this.state.password);
  }

  renderMain(): JSX.Element {
    if (this.state.isLoggedIn) {
      return (
        <Redirect to="/dashboard/category" />
      );
    }

    return (
      <Row>
        <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card>
            <Card.Body>
              <Card.Title>
                <b>Administrator Login</b>
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Form.Group>
                    <Form.Label>Username:</Form.Label>
                    <Form.Control type="text"
                                  placeholder="Enter your username here..."
                                  value={ this.state.username }
                                  onChange={ this.onChangeInput("username") }
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password"
                                  placeholder="Enter your password here..."
                                  value={ this.state.password }
                                  onChange={ this.onChangeInput("password") }
                    />
                  </Form.Group>

                  <Form.Group>
                    <Button variant="primary" className="mt-3"
                            onClick= { () => this.handleLogInButtonClick() } >
                      Log in
                    </Button>
                  </Form.Group>

                  {
                    this.state.message
                      ? (<p className="mt-3">{ this.state.message }</p>)
                      : ''
                  }
                </Form>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }
}
