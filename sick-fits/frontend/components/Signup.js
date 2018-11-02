import React, { Component } from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
const SIGN_UP_MUTATION = gql`
  mutation SIGN_UP_MUTATION($name:String!,$password:String!,$email:String!){
    signup(name:$name,password:$password,email:$email){
      id
      email
      name
    }
  }
`;

class Signup extends Component {
  state = {
    name: '',
    email: '',
    password: '',
  };

  saveToState = (e) =>{
    this.setState({[e.target.name]:e.target.value});
  }
  render() {
    return (
      <Mutation 
      mutation={SIGN_UP_MUTATION} 
      variables={this.state}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
      {(signup,{loading,error}) => {
      return(<Form method="post" onSubmit={async e => 
      {
        e.preventDefault(); 
        await signup();
        this.setState({name:'',password:'',email:''})
      }
      }>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Sign Up for an Account</h2>
          <Error error={error}/>
          <label htmlFor="email"></label>
            Email
            <input type="email" name="email" placeholder="email" 
            value={this.state.email}
            onChange={this.saveToState}/>
          <label htmlFor="name"></label>
            Name
            <input type="text" name="name" placeholder="name" 
            value={this.state.name}
            onChange={this.saveToState}/>
          <label htmlFor="password"></label>
            Password
            <input type="password" name="password" placeholder="password" 
            value={this.state.password}
            onChange={this.saveToState}/>
            <button type="submit">Sign Up</button>
        </fieldset>
      </Form>)
      }}</Mutation>
    );
  }
}

export default Signup;