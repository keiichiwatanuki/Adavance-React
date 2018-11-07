import Account from "../components/Account";
import PleaseSignIn from "../components/PleaseSignIn";

const AccountPage = props => (
  <PleaseSignIn>
    <Account />
  </PleaseSignIn>
);

export default AccountPage;
