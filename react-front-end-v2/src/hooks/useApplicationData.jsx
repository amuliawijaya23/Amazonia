import { useReducer, useEffect } from "react";
import axios from "axios";
import reducer, {
  SET_PRODUCTS,
  SET_SEARCH,
  SET_USER,
  SET_REVIEWS,
  SET_APPLICATION_DATA,
  SET_CATEGORIES,
  SET_WISHES
} from '../reducers/app';

export default function useApplicationData() {

  const [state, dispatch] = useReducer(reducer, {
    searchTerm: null,
    categories: [],
    category: null,
    childCategories: [],
    childCategory: null,
    products: [],
    wishes: [],
    user: null,
    currentReviews: [],
    image: null,
    reviews: []
  });

  useEffect(() => {

    // check local storage for user information
    const loginUser = JSON.parse(window.localStorage.getItem("user"));
    const currentDate = new Date().getTime();

    // check if cookie is still valid
    if (loginUser && (currentDate - loginUser.dateCreated) < 24 * 60 * 60 * 1000) {
      
      // check local storage for stored wishlist
      const userWishes = JSON.parse(window.localStorage.getItem('wishList'));

      if(userWishes) { // set category data and user wishlist if exist   
        axios.get(`api/categories?api_key=${process.env.REACT_APP_API_KEY}&domain=amazon.com`)  
          .then((response) => {
            dispatch({
              type: SET_APPLICATION_DATA,
              value: {categories: response.data.categories, wishes: userWishes, user: loginUser}
            });
          })
          .catch(error => console.error(error));
      } else {
        // set category data and grab wishlist from database if it does not exist in local storage
        Promise.all([
          axios.get(`api/categories?api_key=${process.env.REACT_APP_API_KEY}&domain=amazon.com`),
          axios.get(`app/products/wishes/${loginUser.id}`)
        ]).then((response) => {
          const [ categories, wishes ] = response;
          dispatch({
            type: SET_APPLICATION_DATA,
            value: {categories: categories.data.categories, wishes: wishes.data, user: loginUser}
          });
        })
        .catch(error => console.error(error));
      }
      return;
    };

    // clear user data from local storage if cookie has expired (exceeds 24 hours)
    localStorage.removeItem('user');

    // set category data
    axios.get(`api/categories?api_key=${process.env.REACT_APP_API_KEY}&domain=amazon.com`)
    .then((response) => {
        dispatch({
          type: SET_APPLICATION_DATA,
          value: {categories: response.data.categories, wishes: [], user: null}
        });
      });
    }, []);
  
  // takes login information and returns user object if login credentials matches database
  const setUser = (input) => {
    return axios.post(`app/user/login`, input)
      .then((user) => {
        const loginUser = {...user.data};        
        return axios.get(`app/products/wishes/${loginUser.id}`)
          .then((response) => {
            dispatch({
              type: SET_USER,
              value: {user: loginUser, wishes: response.data}
            });
            const currentDate = new Date().getTime();
            window.localStorage.setItem('user', JSON.stringify({...loginUser, dateCreated: currentDate}));
          });     
      })
      .catch(error => console.error(error));
  };
  
  // clear user state and local storage on sign out
  const signOut = () => {
    return axios.post('app/user/logout')
      .then(() => {
        dispatch({
          type: SET_USER,
          value: { user: null}
        });
        localStorage.removeItem('user');
      });
  };

  // get wish list for a specified user id
  const getWishList = () => {
    return axios.get(`app/products/wishes/${state.user.id}`)
      .then((response) => {
        dispatch({
          type: SET_WISHES,
          value: { wishes: response.data }
        });
      })
    .catch(error => console.error(error)); 
  };

  // update position for wish items in database
  const updateList = (items) => {
    Promise.all([
      items.forEach((item, i) => {
        return axios.put(`app/products/wishes/save`, {...item, position: i + 1})
      })
    ]).then(() => {
      dispatch({
        type: SET_WISHES,
        value: { wishes: items.map((item, i) => ({...item, position: i + 1})) }
      });
    })
    .catch(error => console.error(error));
  };

  // add wish an item to your wishlist
  const addWish = (item) => {
    return axios.post(`app/products/wishes/${state.user.id}`, item)
      .then(() => {
        console.log('Added wish!');
        return axios.get(`app/products/wishes/${state.user.id}`)
          .then((response) => {
            dispatch({
              type: SET_WISHES,
              value: { wishes: response.data }
            })
            window.localStorage.setItem('wishList', JSON.stringify(response.data))
        });
      })
      .catch(error => console.error(error));
  };

  // remove an item from your wish list
  const removeWish = (id) => {
    return axios.post(`app/products/remove/${state.user.id}/${id}`)
      .then(() => {
        console.log('Removed wish!');
        return axios.get(`app/products/wishes/${state.user.id}`)
          .then((response) => {
            dispatch({
              type: SET_WISHES,
              value: { wishes: response.data }
            });
            window.localStorage.setItem('wishList', JSON.stringify(response.data));
          });
      })
      .catch(error => console.error(error));
  };

  // function to set parent category
  const setMainCategory = (category) => {

    const setCategory = state.category === category ? null : category;

    dispatch({
      type: SET_CATEGORIES,
      value: { category: setCategory, childCategories: [], childCategory: null, searchTerm: null }
    })

    // fetch child categories if exist
    if(setCategory && state.categories.find(parent => parent.id === setCategory).has_children) {
      return axios.get(`api/categories?api_key=${process.env.REACT_APP_API_KEY}&parent_id=${category}&domain=amazon.com`)      
        .then((response) => {
          dispatch({
            type: SET_CATEGORIES,
            value: { category: category, childCategories: response.data.categories, childCategory: null, searchTerm: null }
          })
          return;
        }).catch(err => console.error(err.message))
    };
  };

  // function to select child category and fetch products for selected category
  const selectCategory = (category) => {

    dispatch({
      type: SET_CATEGORIES,
      value: {category: state.category, childCategories: state.childCategories, childCategory: category, searchTerm: null}
    });

    dispatch({
      type: SET_PRODUCTS,
      value: { products: [] }
    });

    const params = {
      api_key: process.env.REACT_APP_API_KEY,
      type: "category",
      category_id: category,
      amazon_domain: "amazon.com"
    }

    return axios.get('api/request', { params })
    .then((res) => {
      const response = res.data.category_results
      dispatch({
        type: SET_PRODUCTS,
        value: { products: response }
      });
    })
    .catch(err => console.error(err.message));
  };

  // set search term for nav search bar
  const setSearchTerm = (search) => {
    dispatch({
      type: SET_SEARCH,
      value: { searchTerm: search }
    });
  };

  // fetch products for the specified search parameters
  const setProductsBySearch = (term) => {

    dispatch({
      type: SET_PRODUCTS,
      value: { products: [] }
    });

    // search within a selected category if exist
    if (state.childCategory || state.category) {
      const currentCategory = state.childCategories ? state.childCategory : state.category;

      const params = {
        api_key: process.env.REACT_APP_API_KEY,
        type: "search",
        category_id: currentCategory,
        search_term: term,
        amazon_domain: "amazon.com"
      };


      return axios.get('api/request', { params })
      .then((res) => {
        const response = res.data.search_results;
        dispatch({
          type: SET_PRODUCTS,
          value: { products: response }
        });
        return;
      })
      .catch(error => console.error(error));
    };

    // do a broader search if no category has been selected

    const params = {
      api_key: process.env.REACT_APP_API_KEY,
      type: "search",
      search_term: term || '',
      amazon_domain: "amazon.com"
    };

    return axios.get('api/request', { params })
    .then((res) => {
      const response = res.data.search_results;
      dispatch({
        type: SET_PRODUCTS,
        value: {         
          products: response
        }
      });
      return;
    })
    .catch(error => console.error(error));
  }

  // get reviews for specified product ASIN
  const getReviewsByAsin = (asin) => {

    dispatch({
      type: SET_REVIEWS,
      value: { 
        reviews: []
      }
    });

    // set up the request parameters
    const params = {
      api_key: process.env.REACT_APP_API_KEY,
      type: "reviews",
      amazon_domain: "amazon.com",
      asin: asin
    }

    return axios.get('api/request', { params })
      .then((res) => {

        console.log('RES IS', res)
        dispatch({
          type: SET_REVIEWS,
          value: { 
            reviews: res.data.reviews
        }
      })
    })
    .catch(error => console.error(error));
  }

  // search for products based on VISION AI result
  const getProductsByImageLabel = (label) => {

    dispatch({
      type: SET_PRODUCTS,
      value: { products: [] }
    });

    const params = {
      api_key: process.env.REACT_APP_API_KEY,
      type: "search",
      search_term: label,
      amazon_domain: "amazon.com"
    };


    return axios.get('api/request', { params })
    .then((res) => {
      const response = res.data.search_results;
      console.log(response)
      dispatch({
        type: SET_PRODUCTS,
        value: {
          products: response,
          category: state.category,
          childCategories: state.childCategories,
          childCategory: state.childCategory
        }
      });
    })
    .catch(error => console.error(error));
  };

  return { 
    state,
    setMainCategory,
    setProductsBySearch,
    selectCategory,
    setSearchTerm,
    setUser,
    signOut,
    addWish,
    removeWish,
    getWishList,
    updateList,
    getReviewsByAsin,
    getProductsByImageLabel
  };
};