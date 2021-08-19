import React from 'react';
import { Link } from 'react-router-dom';
import Template from './asserts/pages/template';
import Logo from './asserts/pages/logo';


export default function App() {

  const logo = <Logo />
  const page = <Page />
  
  return (
    <div className="App">
         <Template left={logo} right={page} />
    </div>
  );
}

///page content
function Page() {
  return (
    <div className="row">
      <div className="col-6">
        <div className="list-group" id="list-tab" role="tablist">
            Home
           <Link className="list-group-item list-group-item-action" to='/Login'> Login </Link>
           <Link className="list-group-item list-group-item-action" to='/Register'> Register </Link>
           <Link className="list-group-item list-group-item-action" to='/Dashboard/profile'> Dashboard </Link>
           <Link className="list-group-item list-group-item-action" to='/Admin/profile'> Admin-panel </Link>       
        </div>
      </div>
    </div>
  );
}
