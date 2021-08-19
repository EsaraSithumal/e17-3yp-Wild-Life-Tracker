import { Link } from 'react-router-dom';
import Profile from '../profile/profile';

//import useState hook to create menu collapse state
import React, { useState } from "react";

import { ProSidebar, SidebarHeader, SidebarFooter, SidebarContent, Menu, MenuItem} from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import "./styles.css";

//import icons from react icons
import { FaWifi, FaImage, FaBars, FaTimes, FaPhone } from "react-icons/fa";
import { FiHome, FiLogOut} from "react-icons/fi";

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

export default function Dashboard() {
  
   //create initial menuCollapse state using useState hook
    const [menuCollapse, setMenuCollapse] = useState(false);

    //create a custom function that will change menucollapse state from false to true and true to false
    const menuIconClick = () => {
    //condition checking to change state from true to false and vice versa

        (menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true));
      
        
      };

  return (

  <div>
    <Router>

      <div id="header">
        <ProSidebar collapsed={menuCollapse}>

          <SidebarHeader>
            <div className="closemenu" onClick={menuIconClick}>
              <FaTimes/>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <Menu iconShape="square">

              <MenuItem active={true} icon={<FiHome />}>Home
              <Link to='/dashboard/profile'></Link>
              </MenuItem>
            
              <MenuItem icon={<FaWifi />}>Devices 
               <Link to=''></Link>
              </MenuItem>
            
              <MenuItem icon={<FaImage />}>Photos
              <Link to=''></Link>
              </MenuItem>
            
              <MenuItem icon={<FaPhone />}>Contact us
              <Link to=''></Link>
              </MenuItem>
            
            </Menu>
          </SidebarContent>
          
          <SidebarFooter>
            <Menu iconShape="square">
              <MenuItem icon={<FiLogOut />}>Logout</MenuItem>
            </Menu>
          </SidebarFooter>
        
        </ProSidebar>

      </div>

      <div id='content' className='container-fluid'>

          <div className='row' id='content-header'>
            <div className='col-4 col-md-1'>
              <button onClick={menuIconClick} className='btn' id='button'> <FaBars/> Menu</button>
            </div>

            <div className='col-8 col-md-9 text-center'>
              <h1 id='content-logo'>WildLife Tracker</h1>
            </div>

          </div>

          <div className='row' id='content-body'>
            <Switch>
              <Route exact path="/dashboard/profile" component={Profile}/>
            </Switch>
          </div>

      </div>

    </Router>
  </div>
  );
}
