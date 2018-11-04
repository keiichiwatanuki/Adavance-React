import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import NProgress from "nprogress";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

const CREATE_ORDERMP_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION {
    createOrderMP {
      id
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends Component {
  onToken = (res, createOrder) => {
    console.log(res.id);
    //manually call the mutation once we have the stripe token
    createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => alert(err.message));
  };
  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Sick Fits"
                description={`Order of ${totalItems(me.cart)}`}
                image={me.cart[0].item && me.cart[0].item.image}
                stripeKey="pk_test_9tQTKRAne7uXCBDjLgJNsYHA"
                currency="ARS"
                email={me.email}
                token={res => this.onToken(res, createOrder)}
              >
                {this.props.children}
                <Mutation mutation={CREATE_ORDERMP_MUTATION}>
                  {createOrderMP => {
                    return (
                      <button
                        onClick={() => {
                          createOrderMP().then(e => console.log(e));
                        }}
                      >
                        MP
                      </button>
                    );
                  }}
                </Mutation>
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
