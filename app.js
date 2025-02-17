if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}
// var req = require("./node_modules/req/node_modules/request");
const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const path =require("path");
const ejsMate = require("ejs-mate");
const multer = require('multer');
const {storage} = require("./cloudConfig.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const upload = multer({ storage });
const flash = require('connect-flash');
const AskAgro = require("./models/askAgro.js");
const AskAgro1 = require("./models/askAgro1.js");
const wrapAsync = require("./utils/wrapAsync.js");
const User = require("./models/user.js");
const User1 = require("./models/user1.js");
const DiseaseDescriptionUserAgriculture = require("./models/diseaseDEscriptionAgriculture.js");
const DiseaseDescriptionUserAgriculture1 = require("./models/diseaseDEscriptionAgriculture1.js");
const Farmer = require("./models/farmer.js");
const Authority = require("./models/authority.js");
const Farmer1 = require("./models/farmer1.js");
const Authority1 = require("./models/authority1.js");
const methodOverride = require("method-override");
let  flag = 0;
const {isAuthorityLoggedIn,isAuthorityLoggedIn1,isUserLoggedIn,
      isAgroChemistLoggedIn,isAgroOrAuthority,
      isAgroChemistLoggedIn1,isAgroOrAuthority1,isUserLoggedIn1} = require("./middleware.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { error } = require("console");
const { setFlagsFromString } = require("v8");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const store = MongoStore.create({
  mongoUrl:"mongodb://127.0.0.1:27017/IntegratedCare",
  crypto:{
    secret:"mysupersecretstring"
  },
  touchAfter:86400
});

store.on("error",()=>{
  console.log("Error in MONGO SESSION STORE",err);
})

app.use(session({
  store,
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie:{
    domain: ".localhost",
    expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
  }
  }));
app.use(flash());
// app.use(express.json());
app.use(express.urlencoded({ extended :true }));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.engine("ejs",ejsMate);
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

passport.use('userLocal', new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use('farmerLocal', new LocalStrategy(Farmer.authenticate()));
passport.serializeUser(Farmer.serializeUser());
passport.deserializeUser(Farmer.deserializeUser());

passport.use('authorityLocal', new LocalStrategy(Authority.authenticate()));
passport.serializeUser(Authority.serializeUser());
passport.deserializeUser(Authority.deserializeUser());

passport.use('userLocal1', new LocalStrategy(User1.authenticate()));
passport.serializeUser(User1.serializeUser());
passport.deserializeUser(User1.deserializeUser());

passport.use('farmerLocal1', new LocalStrategy(Farmer1.authenticate()));
passport.serializeUser(Farmer1.serializeUser());
passport.deserializeUser(Farmer1.deserializeUser());

passport.use('authorityLocal1', new LocalStrategy(Authority1.authenticate()));
passport.serializeUser(Authority1.serializeUser());
passport.deserializeUser(Authority1.deserializeUser());

main().then(()=>{
    console.log("Connection Successful");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/IntegratedCare');
};

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.currUser=req.user;
  next();
});

//registering the government authority on passport
app.get("/passport",async (req,res)=>{
  if(flag != 0){
    let governmentAuthority = new Authority({
      email:"authority@gmail.com",
      username:"Faizan Shaik"
    });
  
    let registeredAuthority = await Authority.register(governmentAuthority,"authority");
    flag=1;
    res.send(registeredAuthority);
  }else{
    req.flash("failure","Sorry! You Are Not Authorized Person");
    res.redirect("/home/agriculture");
  }
});

//logout farmer
app.get("/logoutFarmer",async (req,res,next)=>{
  if(session.agroChemistIsLoggedIn && session.agroChemist){
    console.log("req is....",req);
  console.log("req.session is....",req.session);
  console.log("session is....",session);
  session.agroChemistIsLoggedIn= false;
  session.agroChemist=undefined;
  console.log("session is....",session);
  // let data =await Farmer.find({email:"smuhammadfaizan0@gmail.com"});
  req.flash("success","Successfully Logged Out!");
  return res.redirect("/home/agriculture");
  };
  next(); 
});

//logout authority
app.get("/logoutAuthority",async (req,res,next)=>{
  if(session.isAuthenticatedAuthority && session.authorizedPerson){
    console.log("req is....",req);
  console.log("req.session is....",req.session);
  console.log("session is....",session);
  session.isAuthenticatedAuthority= false;
  session.authorizedPerson=undefined;
  console.log("session is....",session);
  // let data =await Farmer.find({email:"smuhammadfaizan0@gmail.com"});
  req.flash("success","Successfully Logged Out!");
  return res.redirect("/home/agriculture");
  };
  next(); 
});

//logout user
app.get("/logoutUser", async (req, res, next) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        console.log(err.message);
        return next(err);
      }
      req.flash("success", "Successfully Logged Out!");
      return res.redirect("/home/agriculture");
    });
  } else {
    req.flash("failure", "You are not logged in!");
    res.redirect("/home/agriculture");
  }
});



//function for createAgro
createAgro = 
  async (req,res,next) =>{
    console.log("in CreateAgro");
     console.log(req.files.length);
    if(req.files.length<1){
      throw new Error("Upload Atleast a Single Image Or Video");
    }
    let response = await geocodingClient.forwardGeocode({
      query: req.body.state,
      limit: 15
    }).send();

    // console.log("File Path is.........",req.file.path);
    let userData =await AskAgro.find({farmerName:req.body.farmerName});
    console.log("User Data found",userData[0]);
    let diseaseData =new DiseaseDescriptionUserAgriculture({
      cropType: req.body.cropType,
      diseaseDescription: req.body.diseaseDescription,
      solution: "Not Yet Answered",
      isProblemSolved:"No",
      location:req.body.address,
      geometry:response.body.features[0].geometry
    });
    for(let file of req.files){
      diseaseData.filePath.push(file.path);
      // console.log(file.path);
    };
    const res1 = await diseaseData.save();
    if(!userData || userData.length<1){
     userData = new AskAgro({
        farmerName:req.body.farmerName,
        phoneNumber:req.body.phoneNumber,
        email:req.body.email
      });
      userData.diseaseInfo.push(diseaseData);
      let res2 =await userData.save();
      console.log("res1 is...",res1);
      console.log("res2 is...",res2);
      return next();
    }else{
      userData[0].diseaseInfo.push(diseaseData);
      await userData[0].save();
      console.log("res1 is...",res1);
     return next();
    }
  }



// Create agro
// app.post('/askAgro',isUserLoggedIn, upload.array("filePath[]",10),wrapAsync(createAgro),wrapAsync(
//   async (req, res)=>{
//       req.flash("success","Details Sent Successfully");
//       res.redirect("/after/userLoginOrSignUp");
//   }
// ));
app.post(
  '/askAgro',
  isUserLoggedIn,
  upload.array("filePath[]", 10),
  wrapAsync(createAgro), // Ensure createAgro is wrapped
  wrapAsync(async (req, res) => {
      req.flash("success", "Details Sent Successfully");
      res.redirect("/after/userLoginOrSignUp");
  })
);


// app.post('/askAgro',upload.array("filePath[]",10),wrapAsync(
//   async (req, res)=>{
//     console.log(req.files.length);
//     for(let file of req.files){
//       console.log(file.path);
//     }
//       res.send(req.files);
//   }
// ));


//New Agro 
app.get('/askAgro/new',isUserLoggedIn,function(req, res) {
    console.log("Hello");
    let {username} = req.user;
    res.render("./agriculture/askAgro.ejs",{username});
});

//create replyFarmer
app.post('/replyFarmer', upload.single("filePath"),wrapAsync(
  async (req, res)=>{
    let data = req.body;
    if(req.file){
      data.filePath=req.file.path;
      data = new ReplyFarmer(data);
      await data.save();
      res.send(data);
    }
    data =new ReplyFarmer(req.body);
    await data.save();
    res.send(data);
  }
));

// After user sign up or user log in 
app.get("/after/userLoginOrSignUp",isUserLoggedIn,(req,res)=>{
  if(req.user){
    res.render("./agriculture/afterSignUpOrLogin.ejs",{req});
  }else{
    req.flash("failure","Login Or Signup To Access IntegratedCare");
    res.redirect("/home/agriculture");
  }
});

//New Signup User
app.get("/signUpUser",(req,res)=>{
  res.render("./agriculture/signUpUser.ejs");
});

//signUp user
app.post("/signUpUser",async (req,res)=>{
  try{
    let {username,email,password} = req.body;
  const newUser = new User({username,email});
  let registeredUser = await User.register(newUser,password);
  req.flash("success","Successfully Signed Up, Login To Continue");
  res.redirect("/loginUser");
  }catch(e){
    req.flash("failure",e.message);
    res.redirect("/signUpUser");
  }
});

//render login form for user
app.get("/loginUser",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginUser");
  }
  console.log("hello i am /loginUser");
  res.render("./agriculture/loginUser.ejs");
});

//login user
app.post("/loginUser",
  passport.authenticate("userLocal", {failureRedirect: "/loginUser",failureFlash:true}),
  async (req,res)=>{
    req.flash("success","LoggedIn Successfully");
    res.redirect("/after/userLoginOrSignUp");
});

//update password form for user
app.get("/new/updatePassword/user/:username",isUserLoggedIn,wrapAsync(async(req,res)=>{
  let {username} = req.params;
  let data = await User.find({username:username});
  console.log(data);
  res.render("./agriculture/updatePasswordUser.ejs",{data});
}));

//update password of user
app.post("/updatePasswordUser",isUserLoggedIn,wrapAsync(async(req,res)=>{
  let {username,oldPassword,newPassword} = req.body;
  let user = await User.find({username:username});

    User.findOne({ username:username })
    .then((u) => {
    u.changePassword(oldPassword,newPassword,(err, u) => {
       try{
        if (err) throw new Error("Entered Old Password Not Matched!!");
        u.save();
        req.flash("success", "Password Changed Successfully");
        res.redirect("/after/userLoginOrSignUp");
       } catch(e){
        let {username} = req.body;
        req.flash("failure",e.message);
        res.redirect(`/new/updatePassword/user/${username}`);
      }
      });
    });
  
}));

//New replyFarmer
app.get('/replyFarmer/new',function (req, res) {
  res.render("./agriculture/replyFarmer.ejs");
});

//new signup Farmer
app.get("/signUpFarmer",(req,res)=>{
  res.render("./agriculture/signUpFarmer.ejs");
});

//signUp Farmer
app.post("/signUpFarmer",isAuthorityLoggedIn(session),wrapAsync(async (req,res)=>{
  try{
    let {username,email,password} = req.body;
    let data = await Farmer.find({email:email});
    if(data.length>0){
      throw new Error("e-Mail Already Registered");
    }
    const newFarmer = new Farmer({username,email});
    let registeredFarmer = await Farmer.register(newFarmer,password);
    req.flash("success","You Registered An AgroChemist Successfully!");
    res.redirect("/afterAuthorityLogin");
  }catch(e){
    req.flash("failure",e.message);
    res.redirect("/signUpFarmer");
  }
}));

//Display All diseaseDescriptions
app.get("/all/diseaseDescription",isAgroChemistLoggedIn(session),async(req,res)=>{
  let data =await  AskAgro.find({}).populate("diseaseInfo");
  let data1 = await DiseaseDescriptionUserAgriculture.find({isProblemSolved:"No"});
  let key=0;
  let name = session.agroChemist.username;
  console.log("data...",data);
  console.log("data1...",data1);
  session.redirectUrl = req.originalUrl;
  if(data1.length>0){
    res.render("./agriculture/allDiseaseDescriptions.ejs",{data,key,name});
  }else{
    key=1;
    req.flash("success","No Problems To Be Solved For Now");
    res.render("./agriculture/allDiseaseDescriptions.ejs",{data,key,name});
    // res.redirect("/home/agriculture");
  }
});

//login Farmer
app.get("/loginFarmer",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginFarmer");
  }
  res.render("./agriculture/loginFarmer.ejs");
});

app.post("/loginFarmer",
  passport.authenticate("farmerLocal", {failureRedirect: "/loginFarmer",failureFlash:true}),
  async (req,res)=>{
    console.log("In /loginFarmer...",req.user);
    session.agroChemist = req.user;
    session.agroChemistIsLoggedIn = true;
    req.flash("success","LoggedIn Successfully");
    // res.send("Successs");
    res.redirect("/all/diseaseDescription");
});

//new authoruty login
app.get("/loginAuthority",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginAuthority");
  }
  res.render("./agriculture/authorityLogin.ejs");
});

//authority login 
app.post("/loginAuthority",
  passport.authenticate("authorityLocal", {failureRedirect: "/loginAuthority",failureFlash:true}),
  async (req,res)=>{
    console.log("session info...",req.session.passport);
    console.log ("req.user is",req.user);
    session.authorizedPerson = req.user;
    session.isAuthenticatedAuthority = true;
    req.flash("success","LoggedIn Successfully");
    const data =await Farmer.find({});
    res.redirect("/afterAuthorityLogin");
});

// after authority login
app.get("/afterAuthorityLogin",
  isAuthorityLoggedIn(session),async (req,res,next)=>{
  // console.log("the logged in user is:");
  // console.log(req.user);
  session.redirectUrl = req.originalUrl;
  const data =await Farmer.find({});
  // console.log(data);
  let farmerCount = await Farmer.countDocuments();
  // console.log(farmerCount);
  res.render("./agriculture/afterAuthorityLogin.ejs",{farmerCount,data});
});

//delete agroChemist from db
app.delete("/deleteAgroChemist/:username",isAuthorityLoggedIn(session),async (req,res)=>{
  let {username}=req.params;
  let data = await Farmer.findOne({username:username});
  console.log(data);
  data = await Farmer.deleteOne({username:username});
  console.log(data);
  req.flash("success","Successfully Removed AgroChemist From DataBase");
  res.redirect("/afterAuthorityLogin");
});

//change password form for agroChemist
app.get("/new/change/AgroChemist/:username",isAuthorityLoggedIn(session),
 wrapAsync(async (req, res) => {
  console.log("session info is...",req.session);
  console.log("req method is...",req.method);
  req.user=session.authorizedPerson;
  console.log("req.user is...",req.user); // Print the entire req object
  console.log("req.user is...",req.isAuthenticated());
  console.log("req.authorized person is...",session.authorizedPerson);
  let { username } = req.params;
  let data = await Farmer.find({ username: username });
  res.render("./agriculture/setPasswordAgroChemist.ejs", { data });
}));


//change password of agroChemist
app.post("/setPasswordAgroChemist",
  isAuthorityLoggedIn(session),
  wrapAsync(async(req,res)=>{
  let {username,Password} = req.body;
  let agroChemist = await Farmer.find({username:username});
  req.user=session.authorizedPerson;
    Farmer.findOne({ username:username })
    .then((u) => {
    u.setPassword(Password,(err, u) => {
       try{
        if (err) throw new Error("Password Change Unsuccessful!!");
        u.save();
        req.flash("success", "Password Changed Successfully");
        res.redirect("/afterAuthorityLogin");
       } catch(e){
        let {username} = req.body;
        req.flash("failure",e.message);
        res.redirect(`/new/change/AgroChemist/${username}`);
      }
      });
    });
  
}));

//update password form for agroChemist
app.get("/new/update/AgroChemist/:username",isAgroOrAuthority(session),wrapAsync(async(req,res)=>{
  let {username} = req.params;
  let data = await Farmer.find({username:username});
  // req.session.redirectUrl = req.originalUrl;
  console.log("in updat password",session.redirectUrl);
  // console.log(req);
  // console.log(data);
  res.render("./agriculture/updatePasswordAgroChemist.ejs",{data});
}));

//update password of agroChemist
app.post("/updatePasswordAgroChemist",isAgroOrAuthority(session),wrapAsync(async(req,res)=>{
    let {username,oldPassword,newPassword} = req.body;
    let agroChemist = await Farmer.find({username:username});

      Farmer.findOne({ username:username })
      .then((u) => {
      u.changePassword(oldPassword,newPassword,(err, u) => {
         try{
          if (err) throw new Error("Entered Old Password Not Matched!!");
          u.save();
          req.flash("success", "Password Updated Successfully, Go Back To Enjoy Our Srvice");
          res.redirect(`${session.redirectUrl}`);
         } catch(e){
          let {username} = req.body;
          req.flash("failure",e.message);
          res.redirect(`/new/update/AgroChemist/${username}`);
        }
        });
      });
    
}));

//display all solutions to farmer from agro
app.get("/displaySolutions",isUserLoggedIn,wrapAsync(async (req,res)=>{

    let data = await AskAgro.findOne({farmerName:req.user.username}).populate("diseaseInfo");
    console.log("The Data is",data);
    console.log(!Boolean(data));
    if(!Boolean(data)){
      req.flash("failure","Sorry, No Data To Show");
      res.redirect("/after/userLoginOrSignUp");
    }else if(data.diseaseInfo.length<1){
      req.flash("failure","Sorry, No Data To Show");
      res.redirect("/after/userLoginOrSignUp");
    }
    else{
      console.log("The Data is",data.diseaseInfo);
      res.render("./agriculture/displaySolutions.ejs",{data});
    }

    // if(Boolean(data)){
      
    // }
    // req.flash("failure","Sorry, No Data To Show");
    //   return res.redirect("/displaySolutions");
}));

//Edit problem description sent by user
app.get("/edit/problemDescriptionAgro/:id",isUserLoggedIn,async(req,res)=>{
  let {id} =req.params;
  let data =await DiseaseDescriptionUserAgriculture.findById(id);
  console.log("The Data To be Edited Is",data);
  res.render("./agriculture/editProblemDescriptionAgro.ejs",{data});
});

app.post("/edit/problemDescriptionAgro/:id",isUserLoggedIn,async(req,res)=>{
  let {id} =req.params;
  let {editedText} = req.body;
  console.log(req.body);
  let data =await DiseaseDescriptionUserAgriculture.findByIdAndUpdate(id,{
    diseaseDescription:editedText
  });
  await data.save();
  console.log(data);
  res.redirect("/displaySolutions");
});

//deleting diseaseDescription
app.delete("/delete/:userId/problemDescriptionAgro/:diseaseId",isUserLoggedIn,async(req,res)=>{
  let {userId,diseaseId} =req.params;
  // res.send(userId);
  await AskAgro.findByIdAndUpdate(userId,{$pull:{diseaseInfo:diseaseId}});
  await DiseaseDescriptionUserAgriculture.findByIdAndDelete(diseaseId);
  req.flash("success","Successfully Deleted!");
  res.redirect("/displaySolutions");
});

//render solution form (from agrochemist to farmer)
app.get("/new/:id/solutionForm",isAgroChemistLoggedIn(session),async(req,res)=>{
  console.log("in sol form",session.agroChemist);
  console.log(session.agroChemistIsLoggedIn);
  let {id} = req.params;
  let data =await DiseaseDescriptionUserAgriculture.findById(id);
  console.log(data);
  res.render("./agriculture/diseaseSolution.ejs",{data});
});

//save solution in Farmer model provided by agrochemist
app.post("/:id/solutionForm",isAgroChemistLoggedIn(session),async(req,res)=>{
  let {id} = req.params;
  let {solution} = req.body;
  let data = await DiseaseDescriptionUserAgriculture.findByIdAndUpdate(id,{
    solution:solution,
    isProblemSolved:"Yes"
  });
  await data.save();
  req.flash("success","Solution Sent Successfully");
  res.redirect("/all/diseaseDescription");
});


//render detailed solution form(from agrochemist to farmer)
app.get("/:userId/detailedView/:diseaseId",isAgroChemistLoggedIn(session),async(req,res)=>{
  let {userId,diseaseId} = req.params;
  let userData =await AskAgro.findById(userId);
  let diseaseData = await DiseaseDescriptionUserAgriculture.findById(diseaseId);
  console.log("user dat...",userData);
  console.log("diseaseData===",diseaseData);
  res.render("./agriculture/detailedView.ejs",{userData,diseaseData});
});

//Agro Home Page
app.get("/home/agriculture",(req,res)=>{
  res.render("./agriculture/HomePage.ejs");
});


// The 2nd phase begins from here
// setFlagsFromString

// diseaseData


// diseaseData
// ddd
// ddd

//registering the government authority on passport
app.get("/passport1",async (req,res)=>{
  if(flag != 0){
    let governmentAuthority = new Authority1({
      email:"authority@gmail.com",
      username:"Faizan Shaik"
    });
  
    let registeredAuthority = await Authority1.register(governmentAuthority,"xyz");
    flag=1;
    res.send(registeredAuthority);
  }else{
    req.flash("failure","Sorry! You Are Not Authorized Person");
    res.redirect("/home/ranchers");
  }
});

//logout user
app.get("/logoutUser1",async (req,res,next)=>{
  if(req.user){
    req.logout(function(err) {
      if (err) { 
        console.log(err.message);
        return next(err);
       }
       req.flash("success","Successfully Logged Out!");
       res.redirect("/home/ranchers");
    });
  } else{
    req.flash("failure", "You are not logged in!");
    res.redirect("/home/ranchers");
  }
 
});

// //logout farmer
app.get("/logoutFarmer1",wrapAsync(async (req,res,next)=>{
  if(session.agroChemistIsLoggedIn1 && session.agroChemist1 ){
  //   console.log("req is....",req);
  // console.log("req.session is....",req.session);
  // console.log("session is....",session);
  session.agroChemistIsLoggedIn1= false;
  session.agroChemist1=undefined;
  console.log("session is....",session);
  // let data =await Farmer.find({email:"smuhammadfaizan0@gmail.com"});
  req.flash("success","Successfully Logged Out!");
  return res.redirect("/home/ranchers");
  };
  next(); 
}));

//logout authority
app.get("/logoutAuthority1",wrapAsync(async (req,res,next)=>{
  if(session.isAuthenticatedAuthority1 && session.authorizedPerson1 ){
    console.log("req is....",req);
  console.log("req.session is....",req.session);
  console.log("session is....",session);
  session.isAuthenticatedAuthority1= false;
  session.authorizedPerson1=undefined;
  console.log("session is....",session);
  // let data =await Farmer.find({email:"smuhammadfaizan0@gmail.com"});
  req.flash("success","Successfully Logged Out!");
  return res.redirect("/home/ranchers");
  };
  next(); 
}));


//function for createAgro1
createAgro1 = 
  async (req,res,next) =>{
    console.log("in CreateAgro1");
     console.log(req.files.length);
    if(req.files.length<1){
      throw new Error("Upload Atleast a Single Image Or Video");
    }
    let response = await geocodingClient.forwardGeocode({
      query: req.body.state,
      limit: 15
    }).send();

    // console.log("File Path is.........",req.file.path);
    let userData =await AskAgro1.find({farmerName:req.body.farmerName});
    console.log("User Data found",userData[0]);
    let diseaseData =new DiseaseDescriptionUserAgriculture1({
      cropType: req.body.cropType,
      diseaseDescription: req.body.diseaseDescription,
      solution: "Not Yet Answered",
      isProblemSolved:"No",
      location:req.body.address,
      geometry:response.body.features[0].geometry
    });
    for(let file of req.files){
      diseaseData.filePath.push(file.path);
      // console.log(file.path);
    };
    const res1 = await diseaseData.save();
    if(!userData || userData.length<1){
     userData = new AskAgro1({
        farmerName:req.body.farmerName,
        phoneNumber:req.body.phoneNumber,
        email:req.body.email
      });
      userData.diseaseInfo.push(diseaseData);
      let res2 =await userData.save();
      console.log("res1 is...",res1);
      console.log("res2 is...",res2);
      return next();
    }else{
      userData[0].diseaseInfo.push(diseaseData);
      await userData[0].save();
      console.log("res1 is...",res1);
     return next();
    }
  }



app.post(
  '/askAgro1',
  isUserLoggedIn1,
  upload.array("filePath[]", 10),
  wrapAsync(createAgro1), // Ensure createAgro is wrapped
  wrapAsync(async (req, res) => {
      req.flash("success", "Details Sent Successfully");
      res.redirect("/after/userLoginOrSignUp1");
  })
);




//New Agro 
app.get('/askAgro/new1',isUserLoggedIn1,function(req, res) {
    console.log("Hello");
    let {username} = req.user;
    res.render("./ranchers/askAgro.ejs",{username});
});

// After user sign up or user log in 
app.get("/after/userLoginOrSignUp1",isUserLoggedIn1,(req,res)=>{
  if(req.user){
    res.render("./ranchers/afterSignUpOrLogin.ejs",{req});
  }else{
    req.flash("failure","Login Or Signup To Access IntegratedCare");
    res.redirect("/home/ranchers");
  }
});

//New Signup User
app.get("/signUpUser1",(req,res)=>{
  res.render("./ranchers/signUpUser.ejs");
});

//signUp user
app.post("/signUpUser1",async (req,res)=>{
  try{
    let {username,email,password} = req.body;
  const newUser = new User({username,email});
  let registeredUser = await User.register(newUser,password);
  req.flash("success","Successfully Signed Up, Login To Continue");
  res.redirect("/loginUser1");
  }catch(e){
    req.flash("failure",e.message);
    res.redirect("/signUpUser1");
  }
});

//render login form for user
app.get("/loginUser1",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginUser1");
  }
  console.log("hello i am /loginUser1");
  res.render("./ranchers/loginUser.ejs");
});

//login user
app.post("/loginUser1",
  passport.authenticate("userLocal", {failureRedirect: "/loginUser1",failureFlash:true}),
  async (req,res)=>{
    req.flash("success","LoggedIn Successfully");
    res.redirect("/after/userLoginOrSignUp1");
});

//update password form for user
app.get("/new1/updatePassword/user/:username",isUserLoggedIn1,wrapAsync(async(req,res)=>{
  let {username} = req.params;
  let data = await User.find({username:username});
  console.log(data);
  res.render("./ranchers/updatePasswordUser.ejs",{data});
}));

//update password of user
app.post("/updatePasswordUser1",isUserLoggedIn1,wrapAsync(async(req,res)=>{
  let {username,oldPassword,newPassword} = req.body;
  let user = await User.find({username:username});

    User.findOne({ username:username })
    .then((u) => {
    u.changePassword(oldPassword,newPassword,(err, u) => {
       try{
        if (err) throw new Error("Entered Old Password Not Matched!!");
        u.save();
        req.flash("success", "Password Changed Successfully");
        res.redirect("/after/userLoginOrSignUp1");
       } catch(e){
        let {username} = req.body;
        req.flash("failure",e.message);
        res.redirect(`/new1/updatePassword/user/${username}`);
      }
      });
    });
  
}));

// //New replyFarmer
// app.get('/replyFarmer/new',function (req, res) {
//   res.render("./agriculture/replyFarmer.ejs");
// });

//new signup Farmer1
app.get("/signUpFarmer1",(req,res)=>{
  res.render("./ranchers/signUpFarmer.ejs");
});

//signUp Farmer1
app.post("/signUpFarmer1",isAuthorityLoggedIn1(session),wrapAsync(async (req,res)=>{
  try{
    let {username,email,password} = req.body;
    let data = await Farmer1.find({email:email});
    if(data.length>0){
      throw new Error("e-Mail Already Registered");
    }
    const newFarmer = new Farmer1({username,email});
    let registeredFarmer = await Farmer1.register(newFarmer,password);
    req.flash("success","You Registered An AgroChemist Successfully!");
    res.redirect("/afterAuthorityLogin1");
  }catch(e){
    req.flash("failure",e.message);
    res.redirect("/signUpFarmer1");
  }
}));

//Display All diseaseDescriptions
app.get("/all/diseaseDescription1",isAgroChemistLoggedIn1(session),async(req,res)=>{
  let data =await  AskAgro1.find({}).populate("diseaseInfo");
  let data1 = await DiseaseDescriptionUserAgriculture1.find({isProblemSolved:"No"});
  let key=0;
  let name = session.agroChemist1.username;
  console.log("data...",data);
  console.log("data1...",data1);
  session.redirectUrl = req.originalUrl;
  if(data1.length>0){
    res.render("./ranchers/allDiseaseDescriptions.ejs",{data,key,name});
  }else{
    key=1;
    req.flash("success","No Problems To Be Solved For Now");
    res.render("./ranchers/allDiseaseDescriptions.ejs",{data,key,name});
    // res.redirect("/home/agriculture");
  }
});

//login Farmer1
app.get("/loginFarmer1",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginFarmer1");
  }
  res.render("./ranchers/loginFarmer.ejs");
});

app.post("/loginFarmer1",
  passport.authenticate("farmerLocal1", {failureRedirect: "/loginFarmer1",failureFlash:true}),
  async (req,res)=>{
    console.log("In /loginFarmer1...",req.user);
    session.agroChemist1= req.user;
    session.agroChemistIsLoggedIn1 = true;
    req.flash("success","LoggedIn Successfully");
    // res.send("Successs");
    res.redirect("/all/diseaseDescription1");
});

//new authoruty login1
app.get("/loginAuthority1",(req,res)=>{
  const errors = req.flash().error ||[];
  if(errors.length>0){
    const msg = errors[0];
    for(let i=0;i<errors.length;i++){
      req.flash("failure",errors[i]);
      console.log(errors[i]);
    }
    res.redirect("/loginAuthority1");
  }
  res.render("./ranchers/authorityLogin.ejs");
});

//authority login 
app.post("/loginAuthority1",
  passport.authenticate("authorityLocal1", {failureRedirect: "/loginAuthority1",failureFlash:true}),
  async (req,res)=>{
    console.log("session info...",req.session.passport);
    console.log ("req.user is",req.user);
    session.authorizedPerson1 = req.user;
    session.isAuthenticatedAuthority1 = true;
    req.flash("success","LoggedIn Successfully");
    // const data =await Farmer1.find({});
    res.redirect("/afterAuthorityLogin1");
});

// after authority login
app.get("/afterAuthorityLogin1",
  isAuthorityLoggedIn1(session),async (req,res,next)=>{
  // console.log("the logged in user is:");
  // console.log(req.user);
  session.redirectUrl = req.originalUrl;
  const data =await Farmer1.find({});
  // console.log(data);
  let farmerCount = await Farmer1.countDocuments();
  // console.log(farmerCount);
  res.render("./ranchers/afterAuthorityLogin.ejs",{farmerCount,data});
});

//delete agroChemist from db
app.delete("/deleteAgroChemist1/:username",isAuthorityLoggedIn1(session),async (req,res)=>{
  let {username}=req.params;
  let data = await Farmer1.findOne({username:username});
  console.log(data);
  data = await Farmer1.deleteOne({username:username});
  console.log(data);
  req.flash("success","Successfully Removed Veternerian From DataBase");
  res.redirect("/afterAuthorityLogin1");
});

//change password form for agroChemist
app.get("/new/change/AgroChemist1/:username",isAuthorityLoggedIn1(session),
 wrapAsync(async (req, res) => {
  let { username } = req.params;
  let data = await Farmer1.find({ username: username });
  res.render("./ranchers/setPasswordAgroChemist.ejs", { data });
}));


// app.get("/new/change/AgroChemist/:username",wrapAsync(async(req,res)=>{
//   console.log("req in change password is:",req.user);
//   let {username} = req.params;
//   let data = await Farmer.find({username:username});
//   // console.log(data);
//   res.render("./agriculture/setPasswordAgroChemist.ejs",{data});
// }));

//change password of agroChemist
app.post("/setPasswordAgroChemist1",
  isAuthorityLoggedIn1(session),
  wrapAsync(async(req,res)=>{
  let {username,Password} = req.body;
  let agroChemist = await Farmer1.find({username:username});
  req.user=session.authorizedPerson;
    Farmer1.findOne({ username:username })
    .then((u) => {
    u.setPassword(Password,(err, u) => {
       try{
        if (err) throw new Error("Password Change Unsuccessful!!");
        u.save();
        req.flash("success", "Password Changed Successfully");
        res.redirect("/afterAuthorityLogin1");
       } catch(e){
        let {username} = req.body;
        req.flash("failure",e.message);
        res.redirect(`/new1/change/AgroChemist/${username}`);
      }
      });
    });
  
}));

//update password form for agroChemist
app.get("/new/update/AgroChemist1/:username",isAgroOrAuthority1(session),wrapAsync(async(req,res)=>{
  let {username} = req.params;
  let data = await Farmer1.find({username:username});
  // req.session.redirectUrl = req.originalUrl;
  console.log("in update password1",session.redirectUrl);
  // console.log(req);
  // console.log(data);
  res.render("./ranchers/updatePasswordAgroChemist.ejs",{data});
}));

//update password of agroChemist
app.post("/updatePasswordAgroChemist1",isAgroOrAuthority1(session),wrapAsync(async(req,res)=>{
    let {username,oldPassword,newPassword} = req.body;
    let agroChemist = await Farmer1.find({username:username});

      Farmer1.findOne({ username:username })
      .then((u) => {
      u.changePassword(oldPassword,newPassword,(err, u) => {
         try{
          if (err) throw new Error("Entered Old Password Not Matched!!");
          u.save();
          req.flash("success", "Password Updated Successfully");
          res.redirect(`${session.redirectUrl}`);
         } catch(e){
          let {username} = req.body;
          req.flash("failure",e.message);
          res.redirect(`/new/update/AgroChemist1/${username}`);
        }
        });
      });
    
}));

//display all solutions to farmer from agro
app.get("/displaySolutions1",isUserLoggedIn1,wrapAsync(async (req,res)=>{

    let data = await AskAgro1.findOne({farmerName:req.user.username}).populate("diseaseInfo");
    console.log("The Data is",data);
    console.log(Boolean(data));
    
    if(!Boolean(data)){
      req.flash("failure","Sorry, No Data To Show");
      res.redirect("/after/userLoginOrSignUp1");
    }else if(data.diseaseInfo.length<1){
      req.flash("failure","Sorry, No Data To Show");
      res.redirect("/after/userLoginOrSignUp1");
    }
    else{
      console.log("The Data is",data.diseaseInfo);
      res.render("./ranchers/displaySolutions.ejs",{data});
    }
}));

// //Edit problem description sent by user
app.get("/edit1/problemDescriptionAgro/:id",isUserLoggedIn1,async(req,res)=>{
  let {id} =req.params;
  let data =await DiseaseDescriptionUserAgriculture1.findById(id);
  console.log("The Data To be Edited Is",data);
  res.render("./ranchers/editProblemDescriptionAgro.ejs",{data});
});

app.post("/edit1/problemDescriptionAgro/:id",isUserLoggedIn1,async(req,res)=>{
  let {id} =req.params;
  let {editedText} = req.body;
  console.log(req.body);
  let data =await DiseaseDescriptionUserAgriculture1.findByIdAndUpdate(id,{
    diseaseDescription:editedText
  });
  await data.save();
  console.log(data);
  res.redirect("/displaySolutions1");
});

//deleting diseaseDescription
app.delete("/delete1/:userId/problemDescriptionAgro/:diseaseId",isUserLoggedIn1,async(req,res)=>{
  let {userId,diseaseId} =req.params;
  // res.send(userId);
  await AskAgro1.findByIdAndUpdate(userId,{$pull:{diseaseInfo:diseaseId}});
  await DiseaseDescriptionUserAgriculture1.findByIdAndDelete(diseaseId);
  req.flash("success","Successfully Deleted!");
  res.redirect("/displaySolutions1");
});

//render solution form (from agrochemist to farmer)
app.get("/new/:id/solutionForm1",isAgroChemistLoggedIn1(session),async(req,res)=>{
  console.log("in sol form",session.agroChemist1);
  console.log(session.agroChemistIsLoggedIn1);
  let {id} = req.params;
  let data =await DiseaseDescriptionUserAgriculture1.findById(id);
  console.log(data);
  res.render("./ranchers/diseaseSolution.ejs",{data});
});

//save solution in Farmer model provided by agrochemist
app.post("/:id/solutionForm1",isAgroChemistLoggedIn1(session),async(req,res)=>{
  let {id} = req.params;
  let {solution} = req.body;
  let data = await DiseaseDescriptionUserAgriculture1.findByIdAndUpdate(id,{
    solution:solution,
    isProblemSolved:"Yes"
  });
  await data.save();
  req.flash("success","Solution Sent Successfully");
  res.redirect("/all/diseaseDescription1");
});


//render detailed solution form(from agrochemist to farmer)
app.get("/:userId/detailedView1/:diseaseId",isAgroChemistLoggedIn1(session),async(req,res)=>{
  let {userId,diseaseId} = req.params;
  let userData =await AskAgro1.findById(userId);
  let diseaseData = await DiseaseDescriptionUserAgriculture1.findById(diseaseId);
  console.log("user data...",userData);
  console.log("diseaseData===",diseaseData);
  res.render("./ranchers/detailedView.ejs",{userData,diseaseData});
});

//Agro Home Page
app.get("/home/ranchers",(req,res)=>{
  res.render("./ranchers/HomePage.ejs");
});









//testing connection
app.get('/', function (req, res) {
  res.render("./landingPage.ejs");
  // res.send(`app is listening yo port no ${port}`);
});

app.all("*",(req,res)=>{
  let message = "Page Not Found";
  res.render("error.ejs",{message});
});

app.use((err,req,res,next)=>{
  let {statusCode=500, message="Something Went Wrong"} = err;
  console.log(err);
  res.render("error.ejs",{message});
});

app.listen(`${port}`,()=>{
    console.log(`app is listening to port no ${port}`);
});
