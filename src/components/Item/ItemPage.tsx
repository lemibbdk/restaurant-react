import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import ItemModel from '../../models/ItemModel';
import ItemService from '../../services/ItemService';
import {Link} from 'react-router-dom';

class ItemPageProperties extends BasePageProperties {
  match?: {
    params: {
      iid: string;
    }
  }
}

class ItemPageState {
  data: ItemModel|null = null;
}

export default class ItemPage extends BasePage<ItemPageProperties> {
  state: ItemPageState;

  constructor(props: ItemPageProperties) {
    super(props);

    this.state = {
      data: null
    }
  }

  private getItemId(): number {
    return Number(this.props.match?.params.iid);
  }

  private getItemData() {
    ItemService.getItemById(this.getItemId())
      .then(res => {
        this.setState({
          data: res
        })
      })
  }

  componentDidMount() {
    this.getItemData();
  }

  componentDidUpdate(prevProps: Readonly<ItemPageProperties>, prevState: Readonly<{}>) {
    if (prevProps.match?.params.iid !== this.props.match?.params.iid) {
      this.getItemData();
    }
  }

  renderMain(): JSX.Element {
    if (this.state.data === null) {
      return (
        <>
          <h1>Item not found.</h1>
        </>
      );
    }

    const item = this.state.data as ItemModel;

    return (
      <>
        <h1>
          <Link to={ "/category/" + item.categoryId }> &lt; Back </Link> | {item.name}
        </h1>


      </>
    );
  }

}
