//import { Component } from 'react'; it's needed because next JS imports react

/*class Home extends Component {
  render(){
    return (
      <p>Hey!</p>
    );
  }
}*/
import Link from 'next/link';
import Items from '../components/Items';

const Home = props => (
  <div>
    <Items/>
  </div>
)

export default Home;
