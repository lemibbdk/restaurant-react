import { Link, Redirect } from 'react-router-dom';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import CategoryModel from '../../models/CategoryModel';
import CategoryService from '../../services/CategoryService';
import EventRegister from '../../api/EventRegister';
import ItemModel from '../../models/ItemModel';
import ItemService from '../../services/ItemService';
import { Breadcrumb, CardDeck } from 'react-bootstrap';
import Item from '../Item/Item';
import './CategoryPage.sass';

class CategoryPageProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string
    }
  }
}

class CategoryPageState {
  title: string = '';
  subCategories: CategoryModel[] = [];
  parentCategoryId: number | null = null;
  parentCategory: CategoryModel | null = null;
  isUserLoggedIn: boolean = true;
  items: ItemModel[] = [];
  categoryTree: CategoryModel[];
}

export default class CategoryPage extends BasePage<CategoryPageProperties> {
  state: CategoryPageState;

  constructor(props: CategoryPageProperties) {
    super(props);

    this.state = {
      title: '',
      subCategories: [],
      parentCategoryId: null,
      parentCategory: null,
      isUserLoggedIn: true,
      items: [],
      categoryTree: []
    }
  }

  private getCategoryId(): number|null {
    const cid = this.props.match?.params.cid;

    return cid ? +(cid) : null;
  }

  private getCategoryData() {
    const cId = this.getCategoryId();

    if (cId === null) {
      this.apiGetTopLevelCategories();
    } else {
      this.apiGetCategory(cId);
      this.apiGetItems(cId);
    }
  }

  private apiGetTopLevelCategories() {
    CategoryService.getTopLevelCategories()
      .then(categories => {
        if (categories.length === 0) {
          return this.setState({
            title: 'No categories found',
            subCategories: [],
            parentCategoryId: null
          })
        }

        this.setState({
          title: 'All categories',
          subCategories: categories
        })
      })
  }

  private apiGetCategory(cId: number) {
    CategoryService.getCategoryById(cId)
      .then(result => {
        if (result === null) {
          return this.setState({
            title: 'Category not  found.',
            subCategories: [],
            parentCategoryId: null,
            items: []
          })
        }

        this.setState({
          title: result.name,
          subCategories: result.subCategories,
          parentCategoryId: result.parentCategoryId,
        })

        const newTree = [];
        if (result.parentCategory !== null) {
          result.parentCategory.parentCategory !== null ?
            newTree.push(result.parentCategory.parentCategory)
            : newTree.push(result.parentCategory);

        }
        newTree.push(result);
        this.setState({categoryTree: newTree});
      })
  }

  apiGetItems(cId: number) {
    ItemService.getItemsByCategoryId(cId)
      .then(res => {
        this.setState({
          items: res
        })
      });
  }

  componentDidMount() {
    this.getCategoryData();

    EventRegister.on('AUTH_EVENT', this.authEventHandler.bind(this));
  }

  componentDidUpdate(prevProps: Readonly<CategoryPageProperties>, prevState: Readonly<CategoryPageState>, snapshot?: any) {
    if (prevProps.match?.params.cid !== this.props.match?.params.cid) {
      this.getCategoryData();
    }
  }

  componentWillUnmount() {
    EventRegister.off('AUTH_EVENT', this.authEventHandler.bind(this));
  }

  private authEventHandler(status: string) {
    if (status === 'force_login') {
      this.setState({
        isUserLoggedIn: false
      })
    }
  }

  private createBreadcrumbs() {
    if (this.state.categoryTree.length !== 0) {
      return this.state.categoryTree.map((el, i) =>
        <Breadcrumb.Item linkAs={Link} linkProps={{to: "/category/" + el.categoryId}} active={i === this.state.categoryTree.length-1} >
          { el.name }
        </Breadcrumb.Item>
      )
    }
  }

  renderMain(): JSX.Element {
    if (!this.state.isUserLoggedIn) {
      return (
        <Redirect to='/user/login' />
      );
    }

    return (
      <div>
        {
          this.props.match?.params.cid ?
            <Breadcrumb className="breadcrumb-list">
              <Breadcrumb.Item linkAs={Link} linkProps={{to: "/category"}}>Categories</Breadcrumb.Item>

              {this.createBreadcrumbs()}

            </Breadcrumb>
            : null
        }

        <h1 className="text-center"> { this.state.title } </h1>

        <div className="category-menu">
          {
            this.state.subCategories.length > 0
              ? (
                <>

                  <ul>
                    { this.state.subCategories.map(category => (
                      <li key={ 'category-link-' + category.categoryId }>
                        <Link to={ '/category/' + category.categoryId  } >
                          { category.name }
                        </Link>
                      </li>
                    )) }

                  </ul>
                </>
              )
              : null
          }
        </div>

        {
          this.state.subCategories.length === 0 ?
            <CardDeck className="row justify-content-center">
              {
                this.state.items.map(item => (
                  <Item key={ "item-" + item.itemId } item={ item } />
                ))
              }
            </CardDeck>
            :
            null
        }
      </div>
    );
  }
}

