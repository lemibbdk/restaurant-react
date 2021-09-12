import BasePage, {BasePageProperties, IFormErrors} from '../BasePage/BasePage';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { isRoleLoggedIn } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import CartService from '../../services/CartService';

class EvaluationAddProperties extends BasePageProperties {
  match?: {
    params: {
      oid: string;
    }
  }
}

interface EvaluationAddState {
  score: string;
  remark: string;
  message: string;
  redirectBackToOrders: boolean;
  isValid: boolean;
  cartId: number | null;
  errors: IFormErrors;
}

export default class EvaluationAdd extends BasePage<EvaluationAddProperties> {
  state: EvaluationAddState;

  constructor(props: any) {
    super(props);

    this.state = {
      score: '',
      remark: '',
      message: '',
      redirectBackToOrders: false,
      isValid: false,
      cartId: null,
      errors: {}
    }
  }

  private getOrderId(): number|null {
    const oid = this.props.match?.params.oid;

    return oid ? +(oid) : null;
  }

  componentDidMount() {
    isRoleLoggedIn('user')
      .then(loggedIn => {
        if (!loggedIn) return EventRegister.emit("AUTH_EVENT", "force_login");
      });

    this.checkUserOrder()
  }

  private checkUserOrder(): void {
    CartService.getUserOrders()
      .then(res => {
        res.forEach(el => {
          if (el.order?.orderId === this.getOrderId() && el.order?.status === 'completed') {
            this.setState({ isValid: true, cartId: el.cartId })
          }
        })
      })
  }

  private onChangeInput(field: 'score' | 'remark'):
    (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      if (field === 'score' && (event.target.value.length > 1 || +(event.target.value) > 5)) {
        return this.setState({
          score: ''
        })
      }
      this.setState({
        [field]: event.target.value
      })
    }
  }

  findFormErrors(): IFormErrors {
    const {score, remark} = this.state;
    const newErrors: IFormErrors = {};

    if (!score || score === '') newErrors.score = 'Cannot be blank!';
    else if (!score.match('^(1|2|3|4|5)$')) newErrors.score = 'Score must be one of this [1|2|3|4|5]';

    if (!remark || remark === '') {
      newErrors.remark = "Cannot be blank!";
    }

    return newErrors;
  }

  private handleAddButton() {
    if (this.getOrderId === null) {
      return this.setState({message: 'Wrong order number'})
    }

    const newErrors = this.findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      this.setState({errors: newErrors})
      return;
    }

    const data = {
      score: this.state.score,
      remark: this.state.remark,
      orderId: this.getOrderId() as number,
      cartId: this.state.cartId as number
    }

    CartService.addEvaluation(data)
      .then(res => {
        if (!res.success) {
          return this.setState({message: 'Something wrong.'})
        }

        this.setState({redirectBackToOrders: true})
      })
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToOrders) {
      return ( <Redirect to="/order" /> );
    }

    if (!this.state.isValid) {
      return ( <p>You can't evaluate this order.</p> )
    }

    return (
      <Row className="d-flex justify-content-center">
        <Col sm={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title>
                Evaluation of order
              </Card.Title>
              <Card.Text as="div">
                <Form>
                  <Row>
                    <Col>
                      <Form.Group className="mt-2">
                        <Form.Label>Score</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Enter score here"
                          value={ this.state.score }
                          onChange={ this.onChangeInput("score") }
                          isInvalid={ !!this.state.errors.score }
                        />

                        <Form.Control.Feedback type='invalid'>
                          {this.state.errors.score}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mt-2">
                        <Form.Label>Remark</Form.Label>
                        <Form.Control
                          type="textarea"
                          placeholder="Enter remark here..."
                          value={ this.state.remark }
                          onChange={ this.onChangeInput("remark") }
                          isInvalid={ !!this.state.errors.remark }
                        />

                        <Form.Control.Feedback type='invalid'>
                          {this.state.errors.remark}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="d-grid">
                        <Button variant="primary"
                                className="mt-3"
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
