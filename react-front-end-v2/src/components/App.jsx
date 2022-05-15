import './styles/App.scss';
import axios from 'axios';
import Header from './Header';
import TierList from './TierList'

import useApplicationData from '../hooks/useApplicationData';

export default function App(props) {

  const { state, user } = useApplicationData();

  // const fetchCategories = () => {
  //   axios.get('/api/categories') // You can simply make your requests to "/api/whatever you want"
  //   .then((response) => {
  //     // handle success
  //     console.log(response.data) // The entire response from the Rails API

  //     console.log(response.data.message) // Just the message
  //     this.setState({
  //       message: response.data.message
  //     });
  //   }) 
  // }

  return (
    <div className="App">
      <Header mode={state.header}/>
      <TierList products={state.products}/>
    </div>
  );
}