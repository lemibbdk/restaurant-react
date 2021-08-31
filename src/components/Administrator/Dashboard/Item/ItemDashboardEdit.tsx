import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import ItemService, { IEditItem } from '../../../../services/ItemService';
import { Redirect } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';

class ItemDashboardEditProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string;
      iid: string;
    }
  }
}

interface ItemDashboardEditState {
  name: string;
  ingredients: string;

  itemInfoIdS: number|null,
  energyValueS: string;
  massS: string;
  priceS: string;

  itemInfoIdL: number|null,
  energyValueL: string;
  massL: string;
  priceL: string;

  itemInfoIdXL: number|null,
  energyValueXL: string;
  massXL: string;
  priceXL: string;

  message: string;

  redirectBackToItems: boolean;
}

export default class ItemDashboardEdit extends BasePage<ItemDashboardEditProperties> {
  state: ItemDashboardEditState;

  constructor(props: any) {
    super(props);

    this.state = {
      name: '',
      ingredients: '',

      itemInfoIdS: null,
      energyValueS: '',
      massS: '',
      priceS: '',

      itemInfoIdL: null,
      energyValueL: '',
      massL: '',
      priceL: '',

      itemInfoIdXL: null,
      energyValueXL: '',
      massXL: '',
      priceXL: '',

      message: '',

      redirectBackToItems: false
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) {
          EventRegister.emit('AUTH_EVENT', 'force_login');
        }
      })
    this.loadItemData();
  }

  private getItemId() {
    return +(this.props.match?.params?.iid ?? 0);
  }

  private getCategoryId() {
    return +(this.props.match?.params?.cid ?? 0);
  }

  private loadItemData() {
    ItemService.getItemById(this.getItemId(), 'administrator')
      .then(res => {
        if (res === null) {
          return this.setState({
            message: 'Item not found',
            redirectBackToItems: true
          })
        }

        if (res.categoryId !== this.getCategoryId()) {
          return this.setState({
            message: 'Item is not in given category.',
            redirectBackToItems: true
          })
        }

        return this.setState({
          name: res.name,
          ingredients: res.ingredients,

          itemInfoIdS: res.itemInfoAll[0].itemInfoId,
          energyValueS: res.itemInfoAll[0].energyValue,
          massS: res.itemInfoAll[0].mass,
          priceS: res.itemInfoAll[0].price,

          itemInfoIdL: res.itemInfoAll[1].itemInfoId,
          energyValueL: res.itemInfoAll[1].energyValue,
          massL: res.itemInfoAll[1].mass,
          priceL: res.itemInfoAll[1].price,

          itemInfoIdXL: res.itemInfoAll[2].itemInfoId,
          energyValueXL: res.itemInfoAll[2].energyValue,
          massXL: res.itemInfoAll[2].mass,
          priceXL: res.itemInfoAll[2].price,
        });

      })
  }

  private onChangeInput(field: 'name' | 'ingredients' | 'energyValueS' | 'massS' | 'priceS' | 'energyValueL' | 'massL' |
    'priceL' | 'energyValueXL' | 'massXL' | 'priceXL'):
    (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private handleEditButtonClick() {
    const data: IEditItem = {
      name: this.state.name,
      ingredients: this.state.ingredients,
      itemInfoAll: [
        {
          itemInfoId: this.state.itemInfoIdS,
          energyValue: +(this.state.energyValueS),
          mass: +(this.state.massS),
          price: +(this.state.priceS)
        },
        {
          itemInfoId: this.state.itemInfoIdL,
          energyValue: +(this.state.energyValueL),
          mass: +(this.state.massL),
          price: +(this.state.priceL)
        },
        {
          itemInfoId: this.state.itemInfoIdXL,
          energyValue: +(this.state.energyValueXL),
          mass: +(this.state.massXL),
          price: +(this.state.priceXL)
        }
      ]
    }

    ItemService.editItem(this.getItemId(), data)
      .then(res => {
        if (res.success) {
          this.setState({ redirectBackToItems: true })
        } else return this.setState({ message: res.message })
      })
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToItems) {
      return ( <Redirect to="/dashboard/item" /> );
    }

    return (
      <>
        <Row>
          <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <b>Edit item</b>

                </Card.Title>
                <Card.Text as="div">
                  <Form>
                    <Form.Group>
                      <Form.Label>Name:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter item name"
                                    value={ this.state.name }
                                    onChange={ this.onChangeInput("name") }
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Ingredients:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter ingredients"
                                    value={ this.state.ingredients }
                                    onChange={ this.onChangeInput("ingredients") }
                      />
                    </Form.Group>

                    <Card>
                      <Card.Body>
                        <b>Size S</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueS }
                                        onChange={ this.onChangeInput("energyValueS") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massS }
                                        onChange={ this.onChangeInput("massS") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceS }
                                        onChange={ this.onChangeInput("priceS") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Body>
                        <b>Size L</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueL }
                                        onChange={ this.onChangeInput("energyValueL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massL }
                                        onChange={ this.onChangeInput("massL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceL }
                                        onChange={ this.onChangeInput("priceL") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Body>
                        <b>Size XL</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueXL }
                                        onChange={ this.onChangeInput("energyValueXL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massXL }
                                        onChange={ this.onChangeInput("massXL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceXL }
                                        onChange={ this.onChangeInput("priceXL") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

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
    )
  }
}
