import App, {Container} from 'next/app';
import Page from '../components/Page';

class MyApp extends App{
  render(){
    const {Component} = this.props;
    //component is going to be the component that has to be rendered by the route
    return(
      <Container>
        <Page>
          <Component/>
        </Page>
      </Container>
    )
  }
}

export default MyApp;
  