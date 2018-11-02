import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]
const ALL_USERS_QUERY = gql`
query ALL_USERS_QUERY{
  users{
    id
    name
    permissions
    email
  }
}
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
mutation UPDATE_PERMISSIONS_MUTATION($userId:ID!,$permissions:[Permission]){
  updatePermissions(userId:$userId,permissions:$permissions){
    id
    name
    permissions
    email
  }
}
`;

const Permissions = props => (
    <Query query={ALL_USERS_QUERY}>
    {({data,loading,error})=> (
      <div>
        {console.log(!error)}
      <Error error={error}/>
      <h2>Manage Permissions</h2>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
            <th>👇🏻</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map(user => <UserPermissions key={user.id} user={user}></UserPermissions>)}
        </tbody>
      </Table>
      </div>)}
    </Query>
  );

class UserPermissions extends React.Component{
  static propTypes ={
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };
//this shouldn't be done, because if we take state from a prop and then
    //it changes at a higher level, it will not be updated here, but because
    //we are seeding the data, and if we change it here we will then click
    //update and send it to the backendPermissions
  state={
    permissions: this.props.user.permissions,
  }

  handlePermissionChange = (e) =>{
    const checkbox = e.target;
    //take a copy of the current permissions
    //if a copy it directly it will just pass it by reference and we dont want that
    let updatedPermissions = [...this.state.permissions];
    //figure out if we need to remove or add the permission
    if(checkbox.checked){
      updatedPermissions.push(checkbox.value);
    }else {
      updatedPermissions = updatedPermissions.filter(permission => (permission!==checkbox.value));
    }
    this.setState({ permissions: updatedPermissions });
  }

  render(){
    console.log(this.state.permissions);
    const user = this.props.user;
    return(
      <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables=
      {{
        permissions: this.state.permissions,
        userId: user.id,
      }}>
      {(updatePermissions,{loading,error}) => (
        <>
        {error && <Error error={error}></Error>}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission =>(
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-
            ${permission}`}>
            <input id={`${user.id}-permission-
            ${permission}`} type="checkbox" checked={this.state.permissions.includes(permission)}
            value={permission} onChange={this.handlePermissionChange}
            ></input>
            </label>
            </td>
        ))}
        <td>
        <SickButton type="button" disabled={loading} 
        onClick={updatePermissions}>Updat{loading?'ing':'e'}</SickButton>
        </td>
      </tr>
      </>)}
      </Mutation>
    )
    }
}

export default Permissions;