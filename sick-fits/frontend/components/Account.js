import React from "react";
import User from "./User";
import ItemStyles from "./styles/ItemStyles";

const Account = props => {
  const me = props.user.data.me;
  return (
    <User>
      <ItemStyles>
        <h2>{me.name}</h2>
        <h1>{me.email}</h1>
      </ItemStyles>
    </User>
  );
};

export default Account;
