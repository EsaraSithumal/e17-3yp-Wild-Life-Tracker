import React,{useState} from 'react';
import { Link , useHistory } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Helmet } from 'react-helmet';
import Loader from "react-loader-spinner";

//import components
import Template from '../template';
import Logo from '../logo';

//import stylesheet
import './styles.css'

/*cookies*/
const cookies = new Cookies();

/*backend url*/
const URL = process.env.REACT_APP_BACKEND_URL;

/*page title*/
const  TITLE = 'Sign-in';




/*export login page*/
export default function Login() {

  const logo = <Logo /> //logo of the page
  const form = <Form/>;

  //return template --> left side = logo , right side = login form 
  return (
    <div>
        <Helmet>
          <title>{ TITLE }</title>
        </Helmet>
      <Template left={logo} right={form} /> 
    </div>
  );
}


/*login form implementation*/
function Form() {

   const history = useHistory();

   //states
   const [data, setData] = useState({

    email : "" ,
    password : ""

   });

   //update changes
   const handleChange = e => {
            const { name, value } = e.target;
            setData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };

  //submit - post
  const handleSubmit = (evt) => {

    evt.preventDefault();
    document.getElementById('button-login').className += ' disabled';
    document.getElementById('error-field').style.display ='none';
    document.getElementById('loader').style.display ='block';

    axios.post(`${URL}api/auth/signin-user`,data)
  
    .then(function (response) {
        cookies.set('name', response.data.msg.name, { path: '/' });
        cookies.set('email', response.data.msg.email , { path: '/' });
        cookies.set('token', response.data.token , { path: '/' });
        cookies.set('isSigned', true , { path: '/' });
        history.push('/Dashboard/profile');
    })
  
    .catch(function (error) {
        cookies.set('isSigned', false , { path: '/' });
        if(error.response){
          if(error.response.status===401){
            document.getElementById('loader').style.display ='none';
            document.getElementById('button-login').className = document.getElementById('button-login').className.replace("disabled", "");
            document.getElementById('error-field').style.display ='block';
            document.getElementById('error-field').innerHTML = "!!!Wrong username & password. Plesse try again!!!";
          }
        }else{
            document.getElementById('loader').style.display ='none';
            document.getElementById('button-login').className = document.getElementById('button-login').className.replace("disabled", "");
            document.getElementById('error-field').style.display ='block';
            document.getElementById('error-field').innerHTML = "!!!Something went to wrong. Plesse try again later!!!";
            
        }
        
    }); 
  }

  return (
    
    <div id='log-form'>

      <form onSubmit={handleSubmit}>
        <div className="text-center">
          <h1>Sign-in</h1>

        {/*loding animation - initially it is hidden*/}
          <div id='loader'><Loader type="ThreeDots" color="#00BFFF" height={50} width={50}/></div>
        <div id='error-field'></div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
          name="email" onChange={handleChange} required></input>
        </div>
  
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
          <input type="password" className="form-control" id="exampleInputPassword1"
           name="password" onChange={handleChange} required></input>
        </div>
  
        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
        </div>
 
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-block btn-primary" id="button-login">Login</button>
        </div>

        <div>
          <small>Dont have an account? <Link to='/Register'> Register </Link><br/>
          Forgot password? <a href="#fogotPW">Password Recovery</a></small>
        </div>
      </form>
     </div> 
    );
  }