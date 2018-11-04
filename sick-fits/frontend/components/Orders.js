import React, { Component } from "react";
import { Query } from "react-apollo";
import { formatDistance } from "date-fns";
import gql from "graphql-tag";
import Link from "next/link";
import styled from "styled-components";
import Error from "./ErrorMessage";
import User from "./User";
import OrderItemStyles from "./styles/OrderItemStyles";

const ALL_ORDERS_QUERY = gql`
  query ALL_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, min-max(40%, 1fr));
`;
class Orders extends Component {
  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Query query={ALL_ORDERS_QUERY}>
            {({ data: { orders }, error, loading }) => {
              if (loading) return <p>loading....</p>;
              if (error) return <Error error={error} />;
              return (
                <div>
                  <h2>You have {orders.length} orders</h2>
                  <OrderUl>
                    {orders.map(order => (
                      <OrderItemStyles key={order.id}>
                        <Link
                          href={{
                            pathname: "/order",
                            query: { id: order.id }
                          }}
                        >
                          <a>
                            <div className="order-meta">
                              <p>
                                {order.items.reduce(
                                  (a, b) => a + b.quantity,
                                  0
                                )}
                                Items
                              </p>
                              <p>{order.items.length} Products</p>
                              <p>
                                {formatDistance(order.createdAt, new Date())}
                              </p>
                              <p>$ {order.total}</p>
                            </div>
                            <div className="images">
                              {order.items.map(item => (
                                <img
                                  key={item.id}
                                  src={item.image}
                                  alt={item.title}
                                />
                              ))}
                            </div>
                          </a>
                        </Link>
                      </OrderItemStyles>
                    ))}
                  </OrderUl>
                </div>
              );
            }}
          </Query>
        )}
      </User>
    );
  }
}

export default Orders;
