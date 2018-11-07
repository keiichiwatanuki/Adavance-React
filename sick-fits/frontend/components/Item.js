import React, { Component } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import Title from "./styles/Title";
import ItemStyles from "./styles/ItemStyles";
import PriceTag from "./styles/PriceTag";
import formatMoney from "../lib/formatMoney";
import DeleteItem from "./DeleteItem";
import AddToCart from "./AddToCart";
import User from "./User";

class Item extends Component {
  render() {
    return (
      <User>
        {({ data }) => {
          const { item } = this.props;
          return (
            <ItemStyles>
              {item.image && <img src={item.image} alt={item.title} />}
              <Title>
                <Link
                  href={{
                    pathname: "/item",
                    query: { id: item.id }
                  }}
                >
                  <a>{item.title}</a>
                </Link>
              </Title>
              <PriceTag>{item.price}</PriceTag>
              <p>{item.description}</p>
              <div className="buttonList">
                {data.me &&
                  data.me.id === item.user.id && (
                    <Link
                      href={{
                        pathname: "update",
                        query: { id: item.id }
                      }}
                    >
                      <a>Edit ✏️</a>
                    </Link>
                  )}
                <AddToCart id={item.id} />
                <DeleteItem id={item.id}>Delete Item</DeleteItem>
              </div>
            </ItemStyles>
          );
        }}
      </User>
    );
  }
}

Item.propTypes = {
  //instead of just object you can use PropTypes.shape({}) to give the shape of an specific object
  item: PropTypes.object.isRequired
};

export default Item;
