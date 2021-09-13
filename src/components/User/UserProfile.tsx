import BasePage, {IFormErrors} from '../BasePage/BasePage';
import CartModel from '../../models/CartModel';
import UserService from '../../services/UserService';
import { getIdentity } from '../../api/api';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import PostalAddressModel from '../../models/PostalAddressModel';

interface UserProfileState {
  userId: number;
  email: string;
  password: string;
  forename: string;
  surname: string;
  postalAddresses: PostalAddressModel[];
  isActive: boolean;
  carts: CartModel[];
  showEditProfileForm: boolean;
  message: string;
  errors: IFormErrors;
}

export default class UserProfile extends BasePage<{}> {
  state: UserProfileState;

  constructor(props: any) {
    super(props);

    this.state = {
      userId: 0,
      email: '',
      password: '',
      forename: '',
      surname: '',
      postalAddresses: [],
      isActive: false,
      carts: [],
      showEditProfileForm: false,
      message: '',
      errors: {}
    }
  }

  componentDidMount() {
    this.getUser();
  }

  private getUser() {
    const userId = +(getIdentity('user'));
    this.setState({userId})
    UserService.getById(userId)
      .then(res => {
        if (!res) return this.setState({message: 'Something wrong'});
        this.setState({
          email: res.email,
          forename: res.forename,
          surname: res.surname,
          postalAddresses: res.postalAddresses,
          isActive: res.isActive
        });
      })
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
      <Col key={i} className="mt-3">
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
    this.setState({postalAddresses: [...this.state.postalAddresses, {address: '', phoneNumber: ''}]} );
  }

  removeAddressField(i: number){
    let values = [...this.state.postalAddresses];
    values.splice(i,1);
    this.setState({ postalAddresses: values });
  }

  findFormErrors(): IFormErrors {
    const {email, password, forename, surname, postalAddresses} = this.state;
    const newErrors: IFormErrors = {};

    if (!email || email === '') newErrors.email = 'Cannot be blank!';
    else if (email.length > 30) newErrors.email = 'Name is too long';

    if (!password || password === '') newErrors.password = 'Cannot be blank!';
    else if (password.length > 30) newErrors.password = 'Name is too long';

    if (!forename || forename === '') newErrors.forename = 'Cannot be blank!';
    else if (forename.length > 30) newErrors.forename = 'Name is too long';

    if (!surname || surname === '') newErrors.surname = 'Cannot be blank!';
    else if (surname.length > 30) newErrors.surname = 'Name is too long';

    if (postalAddresses.length === 0) {
      this.setState({message: 'Must give at least one address.'})
      newErrors.postalAddresses = 'Give one address';
    } else {
      let errorCounter = 0;
      postalAddresses.forEach(address => {
        if (address.address === '' || address.phoneNumber === '') {
          this.setState({message: 'Address fields should not be empty.'})
          newErrors.postalAddresses = 'Address fields should not be empty.';
          errorCounter++;
        }

        if (errorCounter === 0) {
          this.setState({message: ''});
          delete newErrors.postalAddresses;
        }
      })


    }

    return newErrors;
  }

  private handleEditButton(type: 'edit' | 'cancel' | 'save') {
    if (type === 'edit') return this.setState({showEditProfileForm: true});
    if (type === 'cancel') return this.setState({showEditProfileForm: false});
    if (type === 'save') {
      this.setState({errors: {}, password: ''});
      const newErrors = this.findFormErrors();

      if (Object.keys(newErrors).length > 0) {
        this.setState({errors: newErrors})
        return;
      }

      const data = {
        email: this.state.email,
        password: this.state.password,
        forename: this.state.forename,
        surname: this.state.surname,
        isActive: this.state.isActive,
        postalAddresses: this.state.postalAddresses
      };

      UserService.edit(this.state.userId, data)
        .then(res => {
          if (!res) return this.setState({message: 'Something wrong.'})

          this.setState({user: res, showEditProfileForm: false, message: ''});
        })
    }
  }

  renderMain(): JSX.Element {
    return (
      <Row>
        <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <Card.Title><h2>Profile</h2></Card.Title>
              <Card.Text as="div">

                {
                  !this.state.showEditProfileForm ?
                    <div>
                      <span><b>Email:</b> { this.state.email }</span>
                      <br/>
                      <span><b>Name:</b> { this.state.forename }</span>
                      <br/>
                      <span><b>Surname:</b> { this.state.surname }</span>
                      <div>
                        <b>Postal addresses</b>
                        <br/>
                        <hr/>
                        {
                          this.state.postalAddresses.map((address, i) => (
                            <div key={i}>
                              <b>Address {i+1}:</b>
                              <br/>
                              Street: {address.address}
                              <br/>
                              Phone: {address.phoneNumber}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  : this.showForm()
                }


              </Card.Text>
              <div className="d-grid">
                {
                  !this.state.showEditProfileForm ?
                    <Button className="d-grid" variant="primary" onClick={ this.handleEditButton.bind(this, "edit")}>
                      Edit
                    </Button>
                    :
                    <Button className="d-grid mt-3" variant="danger" onClick={ this.handleEditButton.bind(this, "cancel")}>
                      Cancel
                    </Button>
                }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  showForm() {
    return (
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
                isInvalid={ !!this.state.errors.email }
              />

              <Form.Control.Feedback type='invalid'>
                {this.state.errors.email}
              </Form.Control.Feedback>
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
                isInvalid={ !!this.state.errors.password }
              />

              <Form.Control.Feedback type='invalid'>
                {this.state.errors.password}
              </Form.Control.Feedback>
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
                isInvalid={ !!this.state.errors.forename }
              />

              <Form.Control.Feedback type='invalid'>
                {this.state.errors.forename}
              </Form.Control.Feedback>
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
                isInvalid={ !!this.state.errors.surname }
              />

              <Form.Control.Feedback type='invalid'>
                {this.state.errors.surname}
              </Form.Control.Feedback>
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
                      onClick= { this.handleEditButton.bind(this, "save") } >
                Save
              </Button>
            </Form.Group>
          </Col>
        </Row>

        {
          this.state.message !== '' ?

          <p className="error-text">this.state.message</p>
            :
            null
        }
      </Form>
    )
  }
}
