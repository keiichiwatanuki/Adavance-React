//import { Component } from 'react'; it's needed because next JS imports react

/*class Home extends Component {
  render(){
    return (
      <p>Hey!</p>
    );
  }
}*/
//<script src="https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js" />
import Link from "next/link";
import Items from "../components/Items";

const Home = props => (
  <div>
    <Items page={props.query.page || 1} />
  </div>
);

export default Home;
