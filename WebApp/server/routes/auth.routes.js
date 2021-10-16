//auth routes

const express = require('express')

//body-parser
const bodyParser = require('body-parser')
//express-validation
const {check, validationResult } = require('express-validator')

const userSchema = require('../models/users')
const confirmationSchema = require('../models/confirmation')
const adminSchema = require('../models/admin')
const deviceSchema = require('../models/device')
const passwordRSSchema = require('../models/passwordRS')


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')        //new
const fs = require('fs')                //used to delete the confirmation file when confirming rq
const nodemailer = require('nodemailer')

//for the bodyParser
/*
Returns middleware that only parses urlencoded bodies.
*/
const urlencodedParser = bodyParser.urlencoded({extended: false})

const storage = multer.diskStorage({        //new   //to adjust how files get stored
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req,file, cb){
        cb(null,Date.now()+"_"+file.originalname)
    }
})



//new
const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null,true);  //saves
    }else {
        cb(null, false);
    }
}

const upload = multer({storage: storage, limits: {
    fileSize: 1024*1024*5       //5Mb
    },
    fileFilter: fileFilter
})      //new       //saves files to the uploads
//This folder is not publically accesibleby deafault (Therfore turn it to a static folder)

const sendMail = (email,subject,body) =>{
    let mailTransporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVER,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
      
    let mailDetails = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: subject,
        attachments: [{
            filename: 'header.jpg',
            path: __dirname +'/email_headers/header.jpg',
            cid: 'header' //same cid value as in the html img src
        }],
        html:   `
                    <div style="background:linear-gradient(45deg,#01da25,#063b0a);margin: 2%;margin-left:10%;margin-right:10%;padding-top:5%;padding-bottom:5%;padding-left:10%;padding-right: 10%;">
                        <table>
                            <tr>
                                <img src="cid:header" style="width: 100%">
                            </tr>
                            <tr>
                                ${body}  
                            </tr>
                        </table>
                    </div>
                `
    };
      
    mailTransporter.sendMail(mailDetails,(err,data)=>{
        if(err){
            console.log("email not sent");
            console.log(err);
        }else{
            console.log("email sent");
        }
    });
}

const authorize = require('../middleware/auth')     //Authentication middleware that we created
const admin_authorize = require('../middleware/auth_admin') 
//device auth
const authorize_device = require('../middleware/auth_device')
const { Router } = require('express')
const { getMaxListeners } = require('../models/users')

const router = express.Router();

//For admin sign in
//For Sign-In user
//formvalidation added
router.post('/signin-admin',urlencodedParser,[

    check('email', 'Email is not valid, Please enter a valid Email')
        .isEmail()
        .normalizeEmail(),
    check('password', 'Please enter a password or Email address')
        .exists()

],(req,res,next)=>{

    //for the form validation error handeling
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array())
    }

    let getUser;                      //let allows to declare vars that are limited to the scope of a block statement

    adminSchema.findOne({            //functin in mongoose
        email: req.body.email       //get the email from the req body
    })
    .then(user => {
        if (!user){     //if no user
            return res.status(401).json({          //parse to json file
                message: "Authentication failed"
            })
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password)     //compare the password
    })
    .then(response => {
        if(!response){
            console.log("pw wrong")
            return res.status(401).json({           //wrong password
                message: "Authentication Faild"
            })
        }

        //on sucessful auth the server creates a JET token or else an error
        let jwtToken = jwt.sign({           //Auth sucess (This is about jwt)
            email: getUser.email,           // .sign takes the payload, secret and option
            userId: getUser._id,
            isAdmin : true
        },"longer-secret-is-better",{
            expiresIn: '2h'                    //after 2h token is expired
        })

        res.status(200).json({          
            token: jwtToken,        //client gets the JWT token in the response body
            expiresIn: 6600,        //client stores that token in local storage
            msg: getUser
        })
        /*
        .catch((err)=>{                         //this should come after then --> check (When I add here when the req body is not with name it gives an error)
            return res.status(401).json({
                message: "Authentication Failed"
            })
        })
        */
        /*
        Form the next time, the client for making any req supplies the JWT token in req headers
        Server upon receiving the JWT validates it and sends sucessful redponde or else errors
        */
    })
    .catch((err)=>{                         //this should come after then (When I add this here works fine)
        console.log(err)
        return res.status(401).json({
            message: "Authentication Failed",
        })
    })
})


//For Sign-In user
//with input validation
router.post('/signin-user',urlencodedParser,[

    //input validation
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),
    
    check('password', 'Please enter a valid password or email')
        .exists()

],(req,res,next)=>{

    //for the form validation error handeling
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array())
    }


    let getUser;                      //let allows to declare vars that are limited to the scope of a block statement

    userSchema.findOne({            //functin in mongoose
        email: req.body.email       //get the email from the req body
    })
    .then(user => {
        if (!user){     //if no user
            return res.status((401).json({          //parse to json file
                message: "Authentication failed"
            }))
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password)     //compare the password
    })
    .then(response => {
        if(!response){
            return res.status(403).json({           //wrong password
                message: "Authentication Faild"
            })
        }

        //on sucessful auth the server creates a JET token or else an error
        let jwtToken = jwt.sign({           //Auth sucess (This is about jwt)
            email: getUser.email,           // .sign takes the payload, secret and option
            userId: getUser._id
        },"longer-secret-is-better",{
            expiresIn: '2h'                    //after 2h token is expired
        })

        res.status(200).json({          
            token: jwtToken,        //client gets the JWT token in the response body
            expiresIn: 6600,        //client stores that token in local storage
            msg: getUser
        })
        /*
        .catch((err)=>{                         //this should come after then --> check (When I add here when the req body is not with name it gives an error)
            return res.status(401).json({
                message: "Authentication Failed"
            })
        })
        */
        /*
        Form the next time, the client for making any req supplies the JWT token in req headers
        Server upon receiving the JWT validates it and sends sucessful redponde or else errors
        */
    })
    .catch((err)=>{                         //this should come after then (When I add this here works fine)
        return res.status(401).json({
            message: "Authentication Failed",
            error: err
        })
    })
})

//route for password reset requests - users
router.post('/user-password-reset-rq',urlencodedParser,[
    //input validation
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail()
],(req,res,next)=>{

    //for the form validation error handeling
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array())
    }

    //find user with provided email
    userSchema.findOne({            
        email: req.body.email       
    })
    .then(user => {
        if (!user){     //if no user
            return res.status(401).json({          //parse to json file
                message: "No user with given email!!"
            })
        }

        //if a user exists create a token
        let jwtToken = jwt.sign({        
            email: user.email,
            isadmin: 0,        
        },"longer-secret-is-better",{
            expiresIn: 1800                   //after 0.5h token is expired
        });

        let link = `http://localhost//:3000/password-rest/${user.email}/${jwtToken}`;

        let body =  `
                        <div style="padding: 5%;background: rgb(255, 255, 255);font-size: 1.2em;">
                            <h2>Hi, ${user.name} </h2>
                            <p>
                                A password reset event has been triggered. The password reset window is limited to half an hour.
                            </p>
                            <p>
                                If you do not reset your password within 30 minutes, you will need to submit a new request.
                            </p>
                            <p>
                                To complete the password reset process, click the link below.
                            </p>
                            <div style="text-align: center;">
                                <a href="${link}"
                                    style="
                                    margin-top: 15px;
                                    background:linear-gradient(45deg,#00ff00,#2fa500);color: white;border-style: hidden;
                                    text-decoration: none;
                                    padding-top: 10px;padding-bottom: 10px;padding-left: 50px;padding-right: 50px;
                                    font-size: 1.1em;
                                    border-radius: 50px;"
                                    onMouseOver="this.style.background='linear-gradient(45deg,#cc00ff,#5900fd)'"
                                    onMouseOut="this.style.background='linear-gradient(45deg,#00ff00,#2fa500)'">
                                    Click Here
                                </a>
                            </div>
                        </div>
                    `;
                        

        //new document to password reset collection
        const request = new passwordRSSchema({                       
            email: req.body.email,
            token: jwtToken       
        })
        //save in DB
        request.save().then((response) => {             
            sendMail(user.email,"User registration confirmed",body);
            res.status(201).json({
                message: 'The password rest link is sent to Your email!',
                data: jwtToken
            })
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({
                message:'Password reset faild'
            })
        })

    })
})

//route for password reset requests - Admins
router.post('/admin-password-reset-rq',urlencodedParser,[
    //input validation
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail()
],(req,res,next)=>{

    //for the form validation error handeling
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array())
    }

    //find user with provided email
    adminSchema.findOne({            
        email: req.body.email       
    })
    .then(user => {
        if (!user){     //if no user
            return res.status(401).json({          //parse to json file
                message: "No user with given email!!"
            })
        }

        //if a user exists create a token
        let jwtToken = jwt.sign({        
            email: user.email,
            isadmin: 1,        
        },"longer-secret-is-better",{
            expiresIn: 1800                   //after 0.5h token is expired
        });

        let link = `http://localhost//:3000/password-rest/${user.email}/${jwtToken}`;

        let body =  `
                        <div style="padding: 5%;background: rgb(255, 255, 255);font-size: 1.2em;">
                            <h2>Hi, ${user.name} </h2>
                            <p>
                                A password reset event has been triggered. The password reset window is limited to half an hour.
                            </p>
                            <p>
                                If you do not reset your password within 30 minutes, you will need to submit a new request.
                            </p>
                            <p>
                                To complete the password reset process, click the link below.
                            </p>
                            <div style="text-align: center;">
                                <a href="${link}"
                                    style="
                                    margin-top: 15px;
                                    background:linear-gradient(45deg,#00ff00,#2fa500);color: white;border-style: hidden;
                                    text-decoration: none;
                                    padding-top: 10px;padding-bottom: 10px;padding-left: 50px;padding-right: 50px;
                                    font-size: 1.1em;
                                    border-radius: 50px;"
                                    onMouseOver="this.style.background='linear-gradient(45deg,#cc00ff,#5900fd)'"
                                    onMouseOut="this.style.background='linear-gradient(45deg,#00ff00,#2fa500)'">
                                    Click Here
                                </a>
                            </div>
                        </div>
                    `;
                        

        //new document to password reset collection
        const request = new passwordRSSchema({                       
            email: req.body.email,
            token: jwtToken       
        })
        //save in DB
        request.save().then((response) => {             
            sendMail(user.email,"User registration confirmed",body);
            res.status(201).json({
                message: 'The password rest link is sent to Your email!',
                data: jwtToken
            })
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({
                message:'Password reset faild'
            })
        })

    })
})

router.post('/password-reset/:email/:token',urlencodedParser,[
    check('password', 'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 ')
        .exists()
        .isLength({min: 8})
],(req,res,next)=>{
    //for the form validation error handeling
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        console.log("validation error")
        return res.status(422).jsonp(errors.array())
    }

    try{
        const token = req.params.token
        jwt.verify(token, "longer-secret-is-better")
        const decodedToken = jwt.decode(token);
        const isadmin = decodedToken.isadmin;

        passwordRSSchema.findOne({           
            email: req.params.email,
            token: token        
        })
        .then(request=>{
            if(!request){
                throw new Error("Invalid link");
            }

            if(!isadmin){
                userSchema.findOne({
                    email : decodedToken.email
                })
                .then(user=>{
                    if(!user){
                        throw new Error("Invalid link");
                    }
                    bcrypt.hash(req.body.password, 10).then(hash=>{
                        user.password = hash;
                        user.save().then(response => {
                            request.delete(); 
                            res.status(201).json({
                                message: 'Passwor reset successful',
                            })
                        })
                        .catch(error => {
                            throw error;
                        })
                    })
                })
                
            }
            else{
                adminSchema.findOne({
                    email : decodedToken.email
                })
                .then(admin=>{
                    if(!admin){
                        throw new Error("Invalid link");
                    }
                    bcrypt.hash(req.body.password, 10).then(hash=>{
                        admin.password = hash;
                        admin.save().then(response => {
                            request.delete(); 
                            res.status(201).json({
                                message: 'Passwor reset successful',
                            })
                        })
                        .catch(error => {
                            throw error;
                        })
                    })
                })
            }
        }).catch(error =>{
            return res.status(401).json({
                message: "Link is not valid or expired try again"
            })
        })
    }catch(error){
        return res.status(401).json({
            message: "Link is not valid or expired try again"
        })
    }

})





//Admin signup
// Signup 
//with form validation
router.post('/register-admin',urlencodedParser,[

    //input validation
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),
    
    check('name', 'The username must be 5+ characters long and can contain only Alphanumeric characters')
        .exists()
        .isLength({min: 5})
        .isAlphanumeric(),

    check('password', 'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 ')
        .exists()
        .isLength({min: 8})

],(req,res,next)=>{

    //for the form validation error handeling
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array())
    }

    bcrypt.hash(req.body.password, 10).then((hash)=>{        // .hash(data, salt, cb) -> look into salt
        const user = new adminSchema({                       //create a user for the DB entry
            name: req.body.name,
            email: req.body.email,
            password: hash          //password was hashed
        })

        user.save().then((response) => {            //mongoose method to save
            res.status(201).json({
                message: 'Admin created',
                result: response
            })
        })
        .catch((error) => {
            res.status(500).json({
                error
            })
        })
    })           
})




// Signup 
router.post('/register-user',upload.single('verificationLetter'),urlencodedParser,[

    
    //input validation
    check('email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),
    
    check('name', 'The username must be 5+ characters long and can contain only Alphanumeric characters')
        .exists()
        .isLength({min: 5})
        .isAlphanumeric(),

    check('password', 'Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 ')
        .exists()
        .isLength({min: 8})


],(req,res,next)=>{
    bcrypt.hash(req.body.password, 10).then((hash)=>{        // .hash(data, salt, cb) -> look into salt
        const user = new confirmationSchema({                       //create a user for the DB entry
            name: req.body.name,
            email: req.body.email,
            password: hash,          //password was hashed
            //add the confirmation letter here (DONE)
            verificationLetter: req.file.path       //new
        })
        user.save().then((response) => {            //mongoose method to save
            res.status(201).json({
                message: 'User created for confirmation',
                result: response
            })
        })
        .catch((error) => {
            res.status(500).json({
                error
            })
        })
    })           
})

//dummy(get all the users) endpoints with authentication (only one route still) This is for admin confirmation
router.route('/all-user-admin').get(admin_authorize, (req, res)=> {         // from .route can create chainable route handlers (like get post put altogether --> see docs)
    confirmationSchema.find((error, response) => {          //finds documents
        if (error) {
            return next(error)
        }else{
            res.status(200).json(response)
        }

    })
})



//dummy (get info of a specific user) -> This is still wrong
router.route('/one-user').get(authorize, (req,res)=> {
    //console.log(req.userEmail)
    
    //console.log(token)
    let getUser;                      //let allows to declare vars that are limited to the scope of a block statement
    
    userSchema.findOne({            //functin in mongoose
        email: req.userEmail        //get the email from the req body
    })
    .then(user => {
        if (!user){     //if no user
            return res.status(401).json({          //parse to json file
                message: "Authentication failed"
            })
        }
        //getUser = user;
        return res.status(200).json({
            message: "Dummy test - Passed",
            user: user
        })
    })
})
    
//accepting a user registration
router.route('/accept-reg').delete(admin_authorize, (req, res)=> {
    let clientRequest;
    let file;
    //find the request from confirm collection
    confirmationSchema.findOne({
        email: req.body.email
    })
    .then(request=>{
        clientRequest = request;
        if(!request){
            throw new Error("No request with given Email"); //if request not exist set error message
        }
        else{
            file = clientRequest.verificationLetter;
            fs.unlink(file, function (err) {
                // if no error, file has been deleted successfully
                if (err){
                    throw new Error("Cannot find the file to delete");
                }
            });
        }
        return confirmationSchema.deleteOne({
            email : request.email
        })
    })
    .then(delResult => {
        userSchema.findOne({            
            email: req.body.email        
        })
        .then(response =>{
            if(response){
                return res.status(401).json({          
                    message: "Confirmation Failed. User with given email exists."
                })
            }
            else{
                if(delResult.deletedCount === 1){
                    //create a new user using data in the confirmation collections doc
                    const user = new userSchema({                   
                        name: clientRequest.name,
                        email: clientRequest.email,
                        password: clientRequest.password          
                    })
                    //save user       
                    user.save().then((response) => {
                        /*let body =  `
                                    <h1>Wild life tracker</h1>
                                    <p>Your request to Wildlife tracker has been confirmed by an admin!!!</p>
                                    <p>you can log into the system using your credentials</p>
                                `;
                        sendMail(req.body.email,"User registration confirmed",body,res);*/
                        
                        res.status(201).json({
                            message: 'User registration confirmed',
                            result: response
                        })
                    })           
                }
            }
        })
    })
    .catch((err) => {
        res.status(500).json({
            message: err.message,
            data : err
        })
    })           
})

//this route is for reject client request
//need email and reason for rejecting from the body
router.route('/reject-reg').post(admin_authorize, (req,res)=>{
    let status_code;
    confirmationSchema.findOne({
        email: req.body.email
    })
    .then(request =>{
        if(!request){
            status_code =401;
            throw new Error("No user with given email!");
        }
        else{
            file = clientRequest.verificationLetter;
            fs.unlink(file, function (err) {
                status_code =401;
                if (err){
                    throw new Error("Cannot find the file to delete");
                }
            });
        }

        return confirmationSchema.deleteOne({
            email: req.body.email
        })
    })
    .then(delResult=>{
        if(delResult.deletedCount === 1){
            res.status(200).json({
                message: "Client request deleted!!"
            })
        }else{
            status_code= 500;
            throw new Error("Client request deletion failed!");
        }
    })
    .catch(err=>{
        res.status(status_code).json({
            message : err.message
        })
    })
})



// DEVICE ROUTES
/*
api/auth/device_photos        (List the url of photos of a device)
api/auth/devices_list       (List the devices)   
api/auth/add_new_device     (Add a new deivce from user)
api/auth/remove_device      (remove a new device from user)
api/auth/delete_photo       (To delete a photo)
api/auth/device_location    (get the xy coordinates)
*/

//route to connect a device with a user profile
//inserts the serial number of the device into user document
router.route('/connect-device').put(authorize, (req,res)=>{
    let status_c=500;
    //find the device by serial_number
    deviceSchema.findOne({
        serial_number: req.body.serial_number
    })
    .then(device =>{
        if(!device){
            //if device with the given serial not in database throw error
            status_c = 404
            throw new Error("No device with given serial number!!")
        }else{
            //check password
            return bcrypt.compare(req.body.password, device.password)
        }
    })
    .then(response =>{
        if(!response){
            //if password is incorrect
            status_c = 403
            throw new Error("Incorrect password!!")
        }
        else{
            //if password is correct update user profile
            userSchema.updateOne(
                {"email":req.body.email},{"$push":{"devices":req.body.serial_number}}
            )
            .then((result) =>{
                if(result.nModified==0){
                    status_c = 404
                    throw new Error("No user with given email!!")
                }
                return res.status(201).json({
                    status: "Success",
                    message: "Device connected",
                });
            })
            .catch((err)=>{
                return res.status(status_c).json({
                    message:err.message
                });
            })
        }
    })
    .catch((err) => {
        return res.status(status_c).json({
            message:err.message
        });
    }) 
})

//route to get all the devices of a user
router.route('/devices_list').get(authorize, (req, res)=> {         // from .route can create chainable route handlers (like get post put altogether --> see docs)
    
    //variables
    let getUser;            //hold the  user
    let serialNumberArray;  //hold the device number array
    let photos;
    
    userSchema.findOne({            //functin in mongoose
        email: req.userEmail        //get the email from the req body
    })
    .then(user => {
        if (!user){     //if no user
            return res.status(401).json({          //parse to json file
                message: "Authentication failed"
            })
        }
        getUser = user;
        serialNumberArray = user.devices
        //console.log(serialNumberArray)

        if(serialNumberArray == null){
            return res.status(200).json({
                message: "No devices connected"
            })
        }

        /*
        
        */
        
        //console.log(photos)

        return serialNumberArray
        
        
    })
    /*
    .then(numArray => {
        //console.log(numArray)
        
        numArray.forEach(element => {
            
            console.log(element)
            console.log("************")
            
            deviceSchema.findOne({
                serial_number: element
            })
            .then(device => {
                if(!device){
                    return res.status(401).json({          //parse to json file
                        message: "No devices with the provided IDs"
                    })
                }

                photos.push(device.photos)
                console.log(photos)
                return photos
            })
            */
            /*
            .catch((err) => {
                return res.status(403).json({
                    message:err.message
                });
            })
        })
        
    })
    */
    .then(devices => {

        //create a jwt for devices
        let jwtToken = jwt.sign({           //Auth sucess (This is about jwt)
            /*
            email: getUser.email,           // .sign takes the payload, secret and option
            userId: getUser._id
            */
            deviceArray: devices
        },"longer-secret-is-better",{
            expiresIn: '2h'                    //after 2h token is expired
        })

        res.status(200).json({          
            token: jwtToken,        //client gets the JWT token in the response body
            expiresIn: 6600,        //client stores that token in local storage
            deviceArray: devices
        })
        /*
        return res.status(200).json({

            deviceArray: devices
        })
        */
    })
    .catch((err) => {
        return res.status(403).json({
            message:err.message
        });
    })
    
})


//Route to get all the photos of one device
router.route('/device_photos/:deviceID').get(authorize_device, (req,res) => {       //device_photos/1
    
    //console.log(req.devices)
    //console.log(req.params)

    let {deviceID} = req.params
    //console.log(deviceID)

    //console.log(req.devices[1])         //this is a test

    deviceSchema.findOne({
        serial_number: req.devices[deviceID]
    })
    .then(device => {
        if(!device){
            return res.status(401).json({          //parse to json file
                message: "No devices with the provided IDs"
            })
        }

        return res.status(200).json({
            message: "Device Photos",
            device: device,
            photos: device.photos 
        })
    })
    .catch((err) => {
        return res.status(403).json({
            message:err.message
        });
    })
})  


//route to delete photos
router.route('/delete_photo/:device&:photoURL').get(authorize_device, (req,res) => {
    let {deviceID} = req.params.device
    let {photoURL} = req.params.photoURL

    deviceSchema.findOne({
        serial_number: req.devices[deviceID]
    })
    .then(device => {
        if(!device){
            return res.status(401).json({          //parse to json file
                message: "No devices with the provided IDs"
            })
        }

        return device.photos
    })
    .then(photoArray => {
        if(!photoArray){
            return res.status(401).json({
                message: "No photos found"
            })
        }
        else{
            //continue from here
        }

    })
})

//to give the location
router.route('/device_location/:deviceID').get(authorize_device, (req, res) => {

    let {deviceID} = req.params

    deviceSchema.findOne({
        serial_number: req.devices[deviceID]
    })
    .then(device => {
        if(!device){
            return res.status(401).json({          //parse to json file
                message: "No devices with the provided IDs"
            })
        }

        return res.status(200).json({
            message: "Still dummy",
            device: device,
            photos: device.location 
        })
    })
    .catch((err) => {
        return res.status(403).json({
            message:err.message
        });
    })
})

//this route is for testing mail sending 
router.route('/send-mail').post(admin_authorize, (req, res)=> {
    let name = "John Doe";
    
    let body =  `
                <div style="border-radius: 25px;padding: 2%;font-size: 1em;font-size: 1.5em;">
                    <div>
                        <h2>`
                            +name+
                        `</h2>
                        <p>&emsp;Your request to wildlife tracking system has been confirmed by an admin.</p>
                    </div>
                </div>
                `
            ;
                        
    
    sendMail(req.body.email,"User registration confirmed",body); 
    return res.status(200).json({
        message: "email in progress"
    })
})

//route to delete a user
router.route('/delete_user').post(authorize, (req,res)=>{
    /*
    Deletes the first document that matches conditions from the collection.
    Behaves like remove(), but deletes at most one document regardless of the single option.
    Returns the query
    */
    userSchema.deleteOne({
        email: req.userEmail
    })
    .then(user => {
        if (!user){     //if no user
            return res.status((401).json({          //parse to json file
                message: "Authentication failed"
            }))
        }

        return res.status(200).json({
            message: "Sucessfully deleted the accout"
        })
    })
    .catch((err) => {
        res.status(500).json({
            message: err.meddage,
            data: err
        })
    })
})



module.exports = router



