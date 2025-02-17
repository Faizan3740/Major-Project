const Authority = require("./models/authority.js");
const User = require("./models/user.js");
const Farmer = require("./models/farmer.js");
const Authority1 = require("./models/authority1.js");
const User1 = require("./models/user1.js");
const Farmer1 = require("./models/farmer1.js");
const wrapAsync = require("./utils/wrapAsync.js");

module.exports.isAgroChemistLoggedIn =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in AgroChemist Middleware");
        console.log("req.isAuthenticated()...",session.agroChemistIsLoggedIn);
        console.log("req.user is...",session.agroChemist);
try{
       if(session.agroChemistIsLoggedIn && session.agroChemist){
           // console.log("Authority Logged In");
           const data = await Farmer.find({username:session.agroChemist.username});
           const agroChemistId = session.agroChemist._id;
           if(data[0]._id.equals(agroChemistId)){
              return next();
           }
       }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Login To Access IntegratedCare");
   res.redirect("/home/agriculture");
}    
});

module.exports.isAgroChemistLoggedIn1 =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in AgroChemist Middleware");
        console.log("req.isAuthenticated()...",session.agroChemistIsLoggedIn1);
        console.log("req.user is...",session.agroChemist1);
try{
       if(session.agroChemistIsLoggedIn1 && session.agroChemist1){
           // console.log("Authority Logged In");
           const data = await Farmer1.find({username:session.agroChemist1.username});
           const agroChemistId = session.agroChemist1._id;
           if(data[0]._id.equals(agroChemistId)){
              return next();
           }
       }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Login To Access IntegratedCare");
   res.redirect("/home/ranchers");
}    
});

module.exports.isAuthorityLoggedIn =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in Authority Middleware");
        console.log("req.isAuthenticated()...",session.isAuthenticatedAuthority);
        console.log("req.user is...",session.authorizedPerson);
try{
       if(session.authorizedPerson && session.isAuthenticatedAuthority){
           // console.log("Authority Logged In");
           const data = await Authority.find({username:session.authorizedPerson.username});
           const authorityId = session.authorizedPerson._id;
           if(data[0]._id.equals(authorityId)){
              return next();
           }
       }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Login To Access IntegratedCare");
   res.redirect("/home/agriculture");
}    
});

module.exports.isAuthorityLoggedIn1 =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in Authority1 Middleware");
        console.log("req.isAuthenticated()...",session.isAuthenticatedAuthority1);
        console.log("req.user is...",session.authorizedPerson1);
try{
       if(session.authorizedPerson1 && session.isAuthenticatedAuthority1){
           // console.log("Authority Logged In");
           const data = await Authority1.find({username:session.authorizedPerson1.username});
           const authorityId = session.authorizedPerson1._id;
           if(data[0]._id.equals(authorityId)){
              return next();
           }
       }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Login To Access IntegratedCare");
   res.redirect("/home/ranchers");
}    
});

module.exports.isUserLoggedIn = async (req,res,next)=>{
    // console.log("req is",req.user);
    try{
        // console.log("session info...",req.session);
                if(req.user && req.isAuthenticated()){
                    // console.log("Logged In User");
                    const data = await User.find({username:req.user.username});
                    const userId = req.user._id;
                    if(data[0]._id.equals(userId)){
                     return   next();
                    }
                }
                throw new Error("Error Occured");
        } catch(e){
            console.log("Hello",req.user);
            req.flash("failure","Login Or SignUp To Access IntegratedCare");
            res.redirect("/home/agriculture");
        }    
};

module.exports.isUserLoggedIn1 = async (req,res,next)=>{
    // console.log("req is",req.user);
    try{
        // console.log("session info...",req.session);
                if(req.user && req.isAuthenticated()){
                    // console.log("Logged In User");
                    const data = await User.find({username:req.user.username});
                    const userId = req.user._id;
                    if(data[0]._id.equals(userId)){
                     return   next();
                    }
                }
                throw new Error("Error Occured");
        } catch(e){
            console.log("Hello",req.user);
            req.flash("failure","Login Or SignUp To Access IntegratedCare");
            res.redirect("/home/ranchers");
        }    
};

//To update password of Farmer
module.exports.isAgroOrAuthority =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in isAgroOrAuthority Middleware");
        console.log(req);
        // req.session.redirectUrl = req.originalUrl;
        // console.log(req.session.redirectUrl);
        console.log("req.isAuthenticated()...",session.agroChemistIsLoggedIn);
        console.log("req.user is...",session.agroChemist);
try{

       if(session.agroChemistIsLoggedIn && session.agroChemist){
           const data = await Farmer.find({username:session.agroChemist.username});
           const agroChemistId = session.agroChemist._id;
           if(data[0]._id.equals(agroChemistId)){
              return next();
           }
       } else if(session.authorizedPerson && session.isAuthenticatedAuthority){
        const data = await Authority.find({username:session.authorizedPerson.username});
        const authorityId = session.authorizedPerson._id;
        if(data[0]._id.equals(authorityId)){
           return next();
        }
    }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Access Denied!");
   res.redirect("/home/agriculture");
}    
});

//To update password of Farmer1
module.exports.isAgroOrAuthority1 =(session)=>
    wrapAsync(async (req,res,next)=>{
        console.log("in isAgroOrAuthority1 Middleware");
        // console.log(req);
        // req.session.redirectUrl = req.originalUrl;
        // console.log(req.session.redirectUrl);
        console.log("req.isAuthenticated()...",session.agroChemistIsLoggedIn1);
        console.log("req.user is...",session.agroChemist1);
try{

       if(session.agroChemistIsLoggedIn1 && session.agroChemist1){
            console.log("In 1");
           const data = await Farmer1.find({username:session.agroChemist1.username});
           const agroChemistId = session.agroChemist1._id;
           if(data[0]._id.equals(agroChemistId)){
              return next();
           }
           next();
       } else if(session.authorizedPerson1 && session.isAuthenticatedAuthority1){
        console.log("In 2");
        console.log("req.isAuthenticated()...",session.isAuthenticatedAuthority1);
        console.log("req.user is...",session.authorizedPerson1);
        const data = await Authority1.find({username:session.authorizedPerson1.username});
        const authorityId = session.authorizedPerson1._id;
        if(data[0]._id.equals(authorityId)){
           return next();
        }
    }
       throw new Error('My custom thrown Error');
} catch(e){
   console.log(e.message);
   console.log("Hello",req.user);
   req.flash("failure","Access Denied!");
   res.redirect("/home/ranchers");
}    
});