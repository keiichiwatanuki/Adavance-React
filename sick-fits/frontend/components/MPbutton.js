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
import SickButton from "./styles/SickButton";
//TODO reset the button if something is added to the cart
const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION {
    createOrderMP
  }
`;

class MPbutton extends Component {
  state = {
    link: ""
  };
  handleOrder = async createOrderMP => {
    if (this.state.link !== "") return;
    const { data } = await createOrderMP();
    this.setState({
      link: data.createOrderMP
    });
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation mutation={CREATE_ORDER_MUTATION}>
            {(createOrderMP, { loading, error }) => (
              <a href={this.state.link === "" ? null : this.state.link}>
                <SickButton
                  disabled={loading}
                  onClick={() => this.handleOrder(createOrderMP)}
                >
                  {this.state.link === "" ? "Pay withMP" : "Click to check out"}
                </SickButton>
              </a>
            )}
          </Mutation>
        )}
      </User>
    );
  }
}

export default MPbutton;
