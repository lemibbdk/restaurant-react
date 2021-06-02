import { Link } from 'react-router-dom';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import CategoryModel from '../../models/CategoryModel';
import CategoryService from '../../services/CategoryService';

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
  showBackButton: boolean = false;
  parentCategoryId: number | null = null;
}

export default class CategoryPage extends BasePage<CategoryPageProperties> {
  state: CategoryPageState;

  constructor(props: CategoryPageProperties) {
    super(props);

    this.state = {
      title: '',
      subCategories: [],
      showBackButton: false,
      parentCategoryId: null
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
      this.apiGetCategory(cId)
    }
  }

  private apiGetTopLevelCategories() {
    CategoryService.getTopLevelCategories()
      .then(categories => {
        if (categories.length === 0) {
          return this.setState({
            title: 'No categories found',
            subCategories: [],
            showBackButton: true,
            parentCategoryId: null
          })
        }

        this.setState({
          title: 'All categories',
          subCategories: categories,
          showBackButton: false
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
            showBackButton: true,
            parentCategoryId: null
          })
        }

        this.setState({
          title: result.name,
          subCategories: result.subCategories,
          parentCategoryId: result.parentCategoryId,
          showBackButton: true
        })
      })
  }

  componentDidMount() {
    this.getCategoryData();
  }

  componentDidUpdate(prevProps: Readonly<CategoryPageProperties>, prevState: Readonly<CategoryPageState>, snapshot?: any) {
    if (prevProps.match?.params.cid !== this.props.match?.params.cid) {
      this.getCategoryData();
    }
  }

  renderMain(): JSX.Element {
    return (
      <>
        {
          this.state.showBackButton
            ? (
              <Link to={ '/category/' + (this.state.parentCategoryId ?? '') }>
                &lt; Back
              </Link>
            )
            : ''
        }
        <h1> { this.state.title } </h1>

        {
          this.state.subCategories.length > 0
            ? (
              <>
                <p>Podkategorije:</p>
                <ul>
                  { this.state.subCategories.map(category => (
                    <li key={ 'category-link-' + category.categoryId }>
                      <Link to={ '/category/' + category.categoryId  } >
                        Podkategorija { category.name }
                      </Link>
                    </li>
                  )) }

                </ul>
              </>
            )
            : ''
        }
      </>
    );
  }
}

