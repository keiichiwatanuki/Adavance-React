import Link from 'next/link';
import UpdateItem from '../components/updateItem';
//as the id is passed in the query, i can access it 
//wrapping the export in withRouter, or pass it as a prop
//as it's available at page level, because it was exposed
//in _app.js throw ctx
const Update = ({ query }) => (
  <div>
    <UpdateItem id={query.id}></UpdateItem>
  </div>
)

export default Update;