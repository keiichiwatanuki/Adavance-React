import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Item from "./Item";
import Pagination from "./Pagination";
import { perPage } from "../config";

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}){
    items(first: $first, skip: $skip, orderBy: createdAt_DESC ){
      id
      title
      description
      price
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

// the query tags takes a query, and it has to have a function as a child,
// in that function we destructure payload
class Items extends Component {
  /*getPayments(MP) {
    MP.setPublishableKey("TEST-f15ed0e9-0c6d-4e80-b7e1-86f093315b01");
    MP.getPaymentMethod({ bin: 424242 }, (status, res) =>
      console.log(status, res)
    );
    MP.getPaymentMethods();
  }

  componentDidMount(props) {
    this.getPayments(window.Mercadopago);
    console.log(window.Mercadopago);
  }*/
  render() {
    return (
      <Center>
        <Pagination page={parseFloat(this.props.page)} />
        <Query
          query={ALL_ITEMS_QUERY}
          variables={{
            skip: this.props.page * perPage - perPage
          }}
        >
          {({ data, error, loading }) => {
            if (loading) return <p>loading....</p>;
            if (error) return <p>Error: {error.message}</p>;
            return (
              <ItemsList>
                {data.items.map(item => (
                  <Item item={item} key={item.id} />
                ))}
              </ItemsList>
            );
          }}
        </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}

export default Items;
export { ALL_ITEMS_QUERY };
