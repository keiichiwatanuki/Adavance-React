import React, { Component } from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET__MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email:String!){
    requestReset(email:$email){
      message
    }
  }
`;

class RequestReset extends Component {
  state = {
    email: '',
  };

  saveToState = (e) =>{
    this.setState({[e.target.name]:e.target.value});
  }
  render() {
    return (
      <Mutation 
      mutation={REQUEST_RESET__MUTATION} 
      variables={this.state}
      >
      {(reset,{loading,error, called}) => {
      return(<Form method="post" onSubmit={async e => 
      {
        e.preventDefault(); 
        await reset();
        this.setState({email:''})
      }
      }>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Request Password Reset</h2>
          <Error error={error}/>
          {!loading&&!error&&called&&<p>Success check your email for a
            reset link
          </p>}
          <label htmlFor="email"></label>
            Email
            <input type="email" name="email" placeholder="email" 
            value={this.state.email}
            onChange={this.saveToState}/>
             <button type="submit">Request</button>
        </fieldset>
      </Form>)
      }}</Mutation>
    );
  }
}

export default RequestReset;