import React from "react";
import User from "./User";
import ItemStyles from "./styles/ItemStyles";
import { ENUM_VALUE_DEFINITION } from "graphql/language/kinds";

const Account = props => {
  return (
    <User>
      {({ data: { me } }) => (
        <ItemStyles>
          <h1>Name: {me.name}</h1>
          <h2>Email: {me.email}</h2>
        </ItemStyles>
      )}
    </User>
  );
};

export default Account;
