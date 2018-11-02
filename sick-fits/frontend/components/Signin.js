import React, { Component } from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGN_IN_MUTATION = gql`
  mutation SIGN_IN_MUTATION($password:String!,$email:String!){
    signin(password:$password,email:$email){
      id
      email
      name
    }
  }
`;

class Signin extends Component {
  state = {
    email: '',
    password: '',
  };

  saveToState = (e) =>{
    this.setState({[e.target.name]:e.target.value});
  }
  render() {
    return (
      <Mutation 
      mutation={SIGN_IN_MUTATION} 
      variables={this.state} 
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
      {(signin,{loading,error}) => {
      return(<Form method="post" onSubmit={async e => 
      {
        e.preventDefault(); 
        await signin();
        this.setState({password:'',email:''})
      }
      }>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Sign In</h2>
          <Error error={error}/>
          <label htmlFor="email"></label>
            Email
            <input type="email" name="email" placeholder="email" 
            value={this.state.email}
            onChange={this.saveToState}/>
          <label htmlFor="password"></label>
            Password
            <input type="password" name="password" placeholder="password" 
            value={this.state.password}
            onChange={this.saveToState}/>
            <button type="submit">Sign In</button>
        </fieldset>
      </Form>)
      }}</Mutation>
    );
  }
}

export default Signin;