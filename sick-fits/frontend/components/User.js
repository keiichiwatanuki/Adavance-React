import { Query } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";

//in the item if i wanted to, i could go one level deeper and
//ask for the user that created/is selling each item
const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      name
      email
      permissions
      cart {
        id
        quantity
        item {
          description
          title
          id
          price
          image
        }
      }
    }
  }
`;
//when we use user, it will take any props from the parent and pass them down
const User = props => {
  return (
    <Query {...props} query={CURRENT_USER_QUERY}>
      {payload => props.children(payload)}
    </Query>
  );
};
//the only thing that has to be pass as a child is a function
User.propTypes = {
  children: PropTypes.func.isRequired
};

export default User;
export { CURRENT_USER_QUERY };
