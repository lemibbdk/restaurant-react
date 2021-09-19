import BasePage from '../BasePage/BasePage';
import EventRegister from '../../api/EventRegister';
import { Redirect } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import AuthService from '../../services/AuthService';

class UserLoginState {
  email: string = '';
  password: string = '';
  message: string = '';
  isLoggedIn: boolean = false;
}

export default class UserLogin extends BasePage<{}> {
  state: UserLoginState;

  constructor(props: any) {
    super(props);

    this.state = {
      email: '',
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
    if (status === 'user_login_failed') {
      if (Array.isArray(data?.data) && data?.data[0]?.instancePath === '/email') {
        return this.setState({
          message: 'Invalid email: ' + data?.data[0]?.message
        });
      }

      if (Array.isArray(data?.data) && data?.data[0]?.instancePath === '/password') {
        return this.setState({
          message: 'Invalid password: ' + data?.data[0]?.message
        });
      }

      if (data?.status === 404) {
        return this.setState({
          message: 'User not found: '
        });
      }

      if (data?.status === 400 && data?.data === 'Invalid user password.') {
        return this.setState({
          message: 'Wrong password.'
        });
      }

      if (data?.status === 400 && data?.data === 'User account inactive.') {
        return this.setState({
          message: 'Account is inactive.'
        });
      }
    }

    if (status === "user_login") {
      return this.setState({
        email: "",
        password: "",
        isLoggedIn: true,
      });
    }
  }

  private onChangeInput(field: 'email' | 'password'): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private handleLogInButtonClick() {
    AuthService.userLogin(this.state.email, this.state.password);
  }

  renderMain(): JSX.Element {
    if (this.state.isLoggedIn) {
      return (
        <Redirect to="/category" />
      );
    }

    return (
      <Row>
        <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">
                <b>User Login</b>
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Form.Group>
                    <Form.Label>E-mail:</Form.Label>
                    <Form.Control type="email"
                                  placeholder="Enter your e-mail here..."
                                  value={ this.state.email }
                                  onChange={ this.onChangeInput("email") }
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

                  <Form.Group className="d-flex justify-content-center">
                    <Button variant="primary" className="mt-3 w-50"
                            onClick= { () => this.handleLogInButtonClick() } >
                      Log in
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
    )
  }
}
