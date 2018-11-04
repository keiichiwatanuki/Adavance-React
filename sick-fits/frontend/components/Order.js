import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { format } from "date-fns";
import Head from "next/head";
import gql from "graphql-tag";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";
import OrderStyles from "./styles/OrderStyles";
//en esta consulta no va el where porque al tener un custom resolver
//paso los parametros y el backend se encarga del resto como el where
const ORDER_QUERY = gql`
  query ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      items {
        id
        title
        price
        description
        image
        quantity
      }
      total
      user {
        id
      }
      charge
      createdAt
    }
  }
`;

class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  render() {
    return (
      <Query query={ORDER_QUERY} variables={{ id: this.props.id }}>
        {({ data, error, loading }) => {
          const order = data.order;
          if (error) <Error error={error} />;
          if (loading) <p>Loading....</p>;
          return (
            <OrderStyles>
              <Head>
                <title>Sick Fits Order {order.id}</title>
              </Head>
              <p>
                <span>Order Id:</span>
                <span>{order.id}</span>
              </p>
              <p>
                <span>Charge:</span>
                <span>{order.charge}</span>
              </p>
              <p>
                <span>Date:</span>
                <span>{format(order.createdAt, "MMMM d, YYYY h:mm a")}</span>
              </p>
              <p>
                <span>Total:</span>
                <span>{order.total}</span>
              </p>
              <p>
                <span>Item Count:</span>
                <span>{order.items.length}</span>
              </p>
              <div className="items">
                {order.items.map(item => (
                  <div className="order-item" key={item.id}>
                    <img src={item.image} alt={item.title} />
                    <div className="item-details">
                      <h2>{item.title}</h2>
                      <p>Qty: {item.quantity}</p>
                      <p>Each: {formatMoney(item.price)}</p>
                      <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </OrderStyles>
          );
        }}
      </Query>
    );
  }
}

export default Order;
