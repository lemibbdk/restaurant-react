import { Link } from 'react-router-dom';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import axios from 'axios';
import CategoryModel from '../../../../node/src/components/category/model';

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
    axios({
      method: 'GET',
      baseURL: 'http://localhost:40080',
      url: '/category',
      timeout: 10000,
      responseType: 'text',
      headers: {
        Authorization: 'Bearer FAKE-TOKEN'
      },
      // withCredentials: true,
      maxRedirects: 0
    })
      .then(res => {
        if (!Array.isArray(res.data)) {
          throw new Error();
        }

        this.setState({
          title: 'All categories',
          subCategories: res.data,
          showBackButton: false
        })
      })
      .catch(err => {
        const errorMessage = '' + err;

        if (errorMessage.includes('404')) {
          this.setState({
            title: 'No categories found',
            subCategories: []
          })
        } else {
          console.log(err)
          this.setState({
            title: 'Unable to load categories.',
            subCategories: []
          })
        }
      })
  }

  private apiGetCategory(cId: number) {
    axios({
      method: 'GET',
      baseURL: 'http://localhost:40080',
      url: '/category/' + cId,
      timeout: 10000,
      responseType: 'text',
      headers: {
        Authorization: 'Bearer FAKE-TOKEN'
      },
      // withCredentials: true,
      maxRedirects: 0
    })
      .then(res => {
        this.setState({
          title: res.data?.name,
          subCategories: res.data?.subCategories,
          parentCategoryId: res.data?.parentCategoryId,
          showBackButton: true
        })

        console.log(res.data)
      })
      .catch(err => {
        const errorMessage = '' + err;

        if (errorMessage.includes('404')) {
          this.setState({
            title: 'No category found',
            subCategories: []
          })
        } else {
          console.log(err)
          this.setState({
            title: 'Unable to load category.',
            subCategories: []
          })
        }
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

