import withApollo from "next-with-apollo";
import ApolloClient from "apollo-boost";
import { LOCAL_STATE_QUERY } from "../components/Cart";
import { endpoint } from "../config";

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === "development" ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: "include"
        },
        headers
      });
    },
    //local Data
    clientState: {
      resolvers: {
        Mutation: {
          //the third variable is the apollo client, but we will only need cache
          toggleCart(_, variables, { cache }) {
            //read the cart open value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            });
            //Write the cart state to the oposite
            const data = {
              data: { cartOpen: !cartOpen }
            };
            cache.writeData(data);
            return data;
          }
        }
      },
      defaults: {
        cartOpen: false
      }
    }
  });
}

export default withApollo(createClient);
