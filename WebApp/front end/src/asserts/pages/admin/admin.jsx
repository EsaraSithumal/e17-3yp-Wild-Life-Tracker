import { Link , BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ProSidebar, SidebarFooter, SidebarContent, Menu, MenuItem} from 'react-pro-sidebar';
import React, { useState } from "react";
import { Helmet } from 'react-helmet';
import Cookies from 'universal-cookie';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Zoom from 'react-reveal/Zoom';

//import components
import Profile from '../adminprofile/adminprofile';
import Users from '../users/users';
import Logout from '../logout/logout';
import NewAdmin from '../NewAdmin/NewAdmin';

//import stylesheets
import 'react-pro-sidebar/dist/css/styles.css';
import "./styles.css";

//import icons from react icons
import { FaUsers, FaUser , FaBars, FaTimes, FaPlus} from "react-icons/fa";
import { FiHome, FiLogOut} from "react-icons/fi";

const  TITLE = 'Admin panel';
const cookies = new Cookies();
var name; //= cookies.get('name');//'User Name'//
var email; //=cookies.get('email');// 'Email@email.com'//



/*export admin component*/
export default function Admin() {

  function update(){
    name = cookies.get('name');
    email = cookies.get('email');
  }

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
   //create initial menuCollapse state using useState hook
    const [menuCollapse, setMenuCollapse] = useState(false);

    function active(id){
    
      document.getElementById('x').style.backgroundColor = '#205C41';
      document.getElementById('y').style.backgroundColor = '#205C41';
      document.getElementById('z').style.backgroundColor = '#205C41';
      document.getElementById(id).style.backgroundColor = '#7eb9a3';
    }

    //create a custom function that will change menucollapse state from false to true and true to false
    const menuIconClick = () => {
    //condition checking to change state from true to false and vice versa

        if(menuCollapse){
          setMenuCollapse(false);
          document.getElementById("admin-content-body").style.marginLeft = "0px";
          document.getElementById("admin-sidebar").style.width = "0px";
          document.getElementById("admin-usr-x").style.display = 'none';
          document.getElementById("admin-usr-=").style.display = 'inline';
        }
        else{
          setMenuCollapse(true);
          document.getElementById("admin-sidebar").style.width = "200px";
          document.getElementById("admin-content-body").style.marginLeft = "200px";
          document.getElementById("admin-usr-x").style.display = 'inline';
          document.getElementById("admin-usr-=").style.display = 'none';
        } 
              
      };

  return (

  <div>
  <Zoom>
      {/*logout message box*/}
      <Logout handleClose={handleClose} handleShow={handleShow} show={show}/>    

      <Helmet>
        <title>{ TITLE }</title>
      </Helmet>
    
    <Router>

       <div className='row' id='admin-content-header'>
          
            <button onClick={menuIconClick} className='btn' id="menu">
            <FaTimes id='admin-usr-x'/> 
            <FaBars id='admin-usr-='/> Menu</button>
          

          <div className='col-12 text-center'>
            <h1 id='content-logo'><a href="/" target="_blank">WildLife Tracker</a></h1>
          </div>

          <div className='text-center' id="profile-data">
            <Dropdown>
              <Dropdown.Toggle id="dropdown-basic-button" variant="success"><FaUser/></Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu" onClick={update()}>
                  <small>{name}<br/>
                  {email}</small>
              </Dropdown.Menu>
            </Dropdown> 
          </div>
        </div>

      <div id="header-admin">
        <ProSidebar id='admin-sidebar'>
          
          <SidebarContent>
            <Menu iconShape="square">

              <MenuItem icon={<FiHome />} id='x' className='active-tab'>Home
              <Link to='/Admin/profile' onClick={()=>{active('x')}}></Link>
              </MenuItem>
            
              <MenuItem icon={<FaUsers /> } id='y'>Users
               <Link to='/Admin/users' onClick={()=>{active('y')}}></Link>
              </MenuItem>

              <MenuItem icon={<FaPlus />} id='z'>New Admin
               <Link to='/Admin/newadmin' onClick={()=>{active('z')}}></Link>
              </MenuItem>            
            
            </Menu>
          </SidebarContent>
          
          <SidebarFooter>
            <Menu iconShape="square">
              <MenuItem icon={<FiLogOut />} variant="primary" onClick={handleShow}>Logout</MenuItem>
            </Menu>
          </SidebarFooter>
        
        </ProSidebar>

      </div>

      <div id='admin-content'>

          <div className='row' id='admin-content-body'>
            <Switch>
              <Route exact path="/Admin/profile" component={Profile}/>
              <Route exact path="/Admin/users" component={Users}/>
              <Route exact path="/Admin/newadmin" component={NewAdmin}/>
            </Switch>
          </div>

      </div>

    </Router>
  </Zoom>
  </div>
  );
}
