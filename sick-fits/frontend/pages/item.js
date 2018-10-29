import SingleItem from '../components/SingleItem';

//paso el id desde la pagina hacia el componente
const Item = props => (
  <div>
    <SingleItem id={props.query.id}></SingleItem>
  </div>
);

export default Item;