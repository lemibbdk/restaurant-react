import BasePage from '../BasePage/BasePage';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import AuthService, { IPostalAddressData } from '../../services/AuthService';
import { Redirect } from 'react-router-dom';

class UserRegistrationState {
  email: string;
  password: string;
  forename: string;
  surname: string;
  // postalAddresses: string[] = [];
  // phones: string[] = [];

  postalAddresses: IPostalAddressData[] = [];

  counter: number;
  message: string = '';
  isRegistered: boolean = false;
}

export default class UserRegistration extends BasePage<{}> {
  state: UserRegistrationState;

  constructor(props: any) {
    super(props);

    this.state = {
      email: '',
      password: '',
      forename: '',
      surname: '',
      // postalAddresses: [],
      // phones: [],

      postalAddresses: [{
        address: '',
        phoneNumber: ''
      }],

      counter: 0,
      message: '',
      isRegistered: false
    }
  }

  private onChangeInput(field: 'email' | 'password' | 'forename' | 'surname'):
    (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })

    }
  }

  private onChangeInputAddress(field: 'address' | 'phoneNumber', i: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      let postalAddresses = [...this.state.postalAddresses];
      let targeted = {...postalAddresses[i]};
      targeted[field] = event.target.value;
      postalAddresses[i] = targeted;

      this.setState({postalAddresses})
    }
  }

  private createAddressFields(){
    return this.state.postalAddresses.map((el, i) =>
      <Col xs={12} md={6} key={i} className="mt-3">
        <Form.Group className="mt-2">
          <Form.Label>Address {i + 1}:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address here..."
            value={ this.state.postalAddresses[i].address }
            onChange={ this.onChangeInputAddress('address', i) }
          />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Phone number:</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Enter your phone number here..."
            value={ this.state.postalAddresses[i].phoneNumber }
            onChange={ this.onChangeInputAddress('phoneNumber', i) }
          />
        </Form.Group>
        <Form.Group className="d-grid">
          <Button variant="danger" className="mt-3" onClick={this.removeAddressField.bind(this, i)}>
            Remove address
          </Button>
        </Form.Group>
      </Col>
    )
  }

  private addAddressField(){
    this.setState((prevState: UserRegistrationState) => ({ postalAddresses: [...prevState.postalAddresses, {address: '', phoneNumber: ''}]}))
  }

  removeAddressField(i: number){
    let values = [...this.state.postalAddresses];
    values.splice(i,1);
    this.setState({ postalAddresses: values });
  }

  private handleRegisterButtonClick(event: React.SyntheticEvent) {
    event.preventDefault();
    AuthService.userRegistration({
      email: this.state.email,
      password: this.state.password,
      forename: this.state.forename,
      surname: this.state.surname,
      postalAddresses: this.state.postalAddresses
    })
      .then(res => {
        if (res.success) {
          return this.setState({
            isRegistered: true,
          });
        }

        this.setState({
          message: res.message,
        });
      });
  }

  renderMain(): JSX.Element {
    if (this.state.isRegistered) {
      return (
        <Redirect to="/user/login" />
      )
    }

    return (
      <Row>
        <Col sm={12} lg={{ span: 10, offset: 1 }}>
          <Card>
            <Card.Body>
              <Card.Title>
                <b>User Register</b>
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="mt-2">
                        <Form.Label>E-mail:</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your e-mail here..."
                          value={ this.state.email }
                          onChange={ this.onChangeInput("email") }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group className="mt-2">
                        <Form.Label>Password:</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter your password here..."
                          value={ this.state.password }
                          onChange={ this.onChangeInput("password") }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group className="mt-2">
                        <Form.Label>Forename:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your forename here..."
                          value={ this.state.forename }
                          onChange={ this.onChangeInput("forename") }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group className="mt-2">
                        <Form.Label>Surname:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your surname here..."
                          value={ this.state.surname }
                          onChange={ this.onChangeInput("surname") }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group className="d-grid">
                        <Button variant="primary" className="mt-3" onClick={this.addAddressField.bind(this)}>
                          Add address
                        </Button>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    {this.createAddressFields()}
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="d-grid">
                        <Button variant="primary"
                                className="mt-3"
                                type="submit"
                                onClick= { this.handleRegisterButtonClick.bind(this) } >
                          Register
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
