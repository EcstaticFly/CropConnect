import express from "express";
import bodyParser from "body-parser";
import flash from "connect-flash";
import session from "express-session";
import {initializeApp} from "firebase/app";
//  import {onAuthStateChanged} from "firebase/auth";
import {getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword,signOut,deleteUser,signInWithPopup, onAuthStateChanged} from "firebase/auth";
// import { getAuth,  } from "firebase/auth";
import {GoogleAuthProvider } from "firebase/auth";
import {getStorage,ref,uploadBytesResumable,getDownloadURL} from 'firebase/storage';

import {ans} from "./config.js"


const provider = new GoogleAuthProvider();

  const firebaseApp = initializeApp({
    apiKey: ans.MY_KEY,
    authDomain: "sih24-b12f2.firebaseapp.com",
    projectId: "sih24-b12f2",
    storageBucket: "sih24-b12f2.appspot.com",
    messagingSenderId: "883436171678",
    appId: "1:883436171678:web:2af471bfc1b1baef90a68f"
  });
  const auth = getAuth();


const db=getFirestore(firebaseApp);
// const users=collection(db,'users');
// const sellers=collection(db,'sellers');

// const storage=getStorage(firebaseApp);
// const snapshot=await getDocs(todosCol);

// onAuthStateChanged(auth,user=>{
//     if(user!=null){
//         console.log('logged in!');
//     }else{
//         console.log('No user');
//     }
// });
// useEffect(()=>{
//     onAuthStateChanged(auth,(data)=>{
//         console.log(data);
//     })
// });

var uploadState=0;

var p=0;


const app=express();
const port=3000;
app.use(flash());


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const sign= new Map();
const signName=new Map();
var signType=0;

var currStatus="null";
var homeStatus=1;

app.use(session({
    secret:'mysecretkey',
    saveUninitialized: true,
    resave: true,
  }));




app.get("/",(req,res)=>{
    const message=req.flash('message');
    res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
});
app.get("/account-page",(req,res)=>{
    const message=req.flash('message');
    res.render("SignIN.ejs",{message:message});
});
app.post("/signIn",(req,res)=>{

    // console.log(sign.get(req.body["GivenEmail"]));
    // console.log(req.body["GivenPassword"]);
    // console.log("--------");
    // && (sign.get(req.body["GivenEmail"])===req.body["GivenPassword"])
    if((req.body["GivenEmail"]!=null) && (req.body["GivenPassword"]!=null)){
        console.log(req.body["GivenEmail"]);
        console.log(req.body["GivenPassword"]);
        currStatus="okay";
        
    }
    else{
        if((req.body["GivenEmail"]=="")){
            currStatus="Please Enter Email";
            req.flash('message',['Please Enter Email','danger']);
        }
        else if((req.body["GivenPassword"]=="")){
            currStatus="Please Enter Password";
            req.flash('message',["Please Enter Password",'danger']);
        }
        else{
            currStatus="Incorrect Email or Password";
            req.flash('message',["Incorrect Email or Password",'danger']);
        }
        // console.log("error");
        // console.log(req.body["GivenEmail"]);
        // console.log(req.body["GivenPassword"]);
    }
    if(currStatus=="okay"){
        signInWithEmailAndPassword(auth,req.body["GivenEmail"], req.body["GivenPassword"])
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    req.flash('message',[`Welcome Back!`,'success']);
    homeStatus=2;
        const message=req.flash('message');
        signType=0;
        res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode,errorMessage);


    req.flash('message',[`${errorMessage}`,'danger']);
    homeStatus=1;
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
  });
        
        // currStatus="null";
        // homeStatus=1;
    }
    else if(currStatus=="Please Enter Email"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else if(currStatus=="Please Enter Password"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else if(currStatus=="Incorrect Email or Password"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else{
        console.log("error");
        const message=req.flash('message');
        currStatus="An Unknown Error Occured";
        homeStatus=1;
        res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
    }
    
});



app.post("/createAccount",(req,res)=>{
if((req.body["NewEmail"]=="")){
    currStatus="Please Enter Email";
    req.flash('message',['Please Enter Email','danger']);
    const message=req.flash('message');
res.render("SignIN.ejs",{message:message})
}
else if((req.body["NewPassword"]=="")){
    currStatus="Please Enter Password";
    req.flash('message',["Please Enter Password",'danger']);
    const message=req.flash('message');
res.render("SignIN.ejs",{message:message})
}
else{
    signName.set(req.body["NewEmail"],req.body["NewName"]);
    createUserWithEmailAndPassword(auth, req.body["NewEmail"], req.body["NewPassword"])
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    currStatus="okay";
    req.flash('message',['Welcome! Account created successfully!','success']);
    const message=req.flash('message');
    homeStatus=2;
    signType=0;
    
    // addDoc(users,{
    //     name: req.body["NewName"],
    //     email:req.body["NewEmail"],
    //     password:req.body["NewPassword"]
    // })
    // .then( ()=>{
    //     console.log("Data Saved");
    // })
    // .catch((err)=>{
    //     console.log("db error");
    // })
    res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
    
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    currStatus="okay";
    req.flash('message',[`${errorMessage}`,'danger']);
    const message=req.flash('message');
    res.render("SignIN.ejs",{message:message});

    // ..
  });
  
  

// homeStatus=1;
}
    console.log(req.body["NewEmail"]);
    console.log(req.body["NewPassword"]);
//     signName.set(req.body["NewEmail"],req.body["NewName"]);
//     sign.set(req.body["NewEmail"],req.body["NewPassword"]);
//     homeStatus=2;
//     ;

    
    
//     // homeStatus=1;
//     // currStatus="null";
});

app.post("/view-details",(req,res)=>{
    console.log(req.body["butt"]);
    if(req.body["butt"]==1){
        console.log("home");
        homeStatus=2;
        res.render("home.ejs",{p:p,homeStatus:homeStatus,message:""});
    }
    else if(req.body["butt"]==2){
        console.log("orders");
        homeStatus=2;
        res.render("orders.ejs");
    }
    else if(req.body["butt"]==3){
        console.log("profile");
        
        const user = auth.currentUser;
            if (user !== null) {
                const displayName = user.displayName;
                const email = user.email;
                const photoURL = user.photoURL;
                const emailVerified = user.emailVerified;
                const uid = user.uid;


                // getDocs(users)
                // .then((res)=>{
                //     console.log(
                //         res.docs.map((item)=>{
                //             return {...item.data(),id:item.id};
                //         })
                //     );
                // });
                uploadState=1;
                res.render("userInfo.ejs",{p:p,message:"",displayName:displayName,email:email,photoURL:photoURL});
            }
            
        
    }
    else{
        console.log("signOut");
        signOut(auth).then(() => {
            // Sign-out successful.
            req.flash('message',['Signed Out Successfully!','success']);
    const message=req.flash('message');
            homeStatus=1;
            res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
          }).catch((error) => {
            // An error happened.

            req.flash('message',['An Error Occured','danger']);
    const message=req.flash('message');
            homeStatus=2;
            res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
          });
    }
});
// app.get("/user-info",(req,res)=>{

//     res.render("userInfo.ejs",);
// });

app.post("/take-action",(req,res)=>{
    if(req.body["link-button"]==1){
        console.log("signOut");
        signOut(auth).then(() => {
            // Sign-out successful.
            req.flash('message',['Signed Out Successfully!','success']);
    const message=req.flash('message');
            homeStatus=1;
            res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});
          }).catch((error) => {
            // An error happened.

            req.flash('message',['An Error Occured','danger']);
    const message=req.flash('message');
            // homeStatus=2;
            // uploadState=0;
            res.render("userInfo.ejs",{message:message,displayName:"",email:""});
          });
    }
    else{
        const user = auth.currentUser;
deleteUser(user).then(() => {
  // User deleted.


//   const docToDelete=doc(db,"users","H3Xa11TtjZWvY9Fy5zl5");
//   deleteDoc(docToDelete)
//   .then(()=>{
//     console.log("Data Deleted");
//   })
//   .catch((err)=>{
//     console.log(err.message);
//   });

  console.log('user deleted');
  req.flash('message',['User Deleted Successfully!','success']);
    const message=req.flash('message');
            homeStatus=1;
            res.render("home.ejs",{p:p,homeStatus:homeStatus,message:message});

}).catch((error) => {
  // An error ocurred
  // ...
  req.flash('message',['An Error Occured','danger']);
    const message=req.flash('message');
            // homeStatus=2;
            // uploadState=0;
            res.render("userInfo.ejs",{message:message,displayName:"",email:""});

});
    }
});


// app.post("/upload-photo",(req,res)=>{
//     const storageRef = ref(storage, data.name);
//     const uploadTask = uploadBytesResumable(storageRef,data);
//     uploadTask.on('state_changed', 
//         (snapshot) => {
//           const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//           console.log('Upload is ' + progress + '% done');
//         //   switch (snapshot.state) {
//         //     case 'paused':
//         //       console.log('Upload is paused');
//         //       break;
//         //     case 'running':
//         //       console.log('Upload is running');
//         //       break;
//         //   }
//         }, 
//         (error) => {
//           // Handle unsuccessful uploads
//           console.log(error.message);
//         }, 
//         () => {
          
//           getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//             console.log('File available at', downloadURL);
            
//           });
          
//         }
//       );
//       res.render("userInfo.ejs",{message:"",displayName:"",email:""});
      
    
// });

app.get("/farmer-sign-up-page",(req,res)=>{
    res.render("seller/seller_signup.ejs",{message:""});
});



app.post("/create-seller-account",(req,res)=>{
    // if((req.body["sellerEmail"]=="")){
    //     currStatus="Please Enter Email";
    //     req.flash('message',['Please Enter Email','danger']);
    //     const message=req.flash('message');
    // res.render("seller/seller_signup.ejs",{message:message})
    // }
    // else if((req.body["sellerPassword"]=="")){
    //     currStatus="Please Enter Password";
    //     req.flash('message',["Please Enter Password",'danger']);
    //     const message=req.flash('message');
    // res.render("seller/seller_signup.ejs",{message:message})
    // }
    // else if((req.body["sellerName"]!="")){
    //     currStatus="Please Enter Name";
    //     req.flash('message',["Please Enter Name",'danger']);
    //     const message=req.flash('message');
    // res.render("seller/seller_signup.ejs",{message:message})
    // }
    // else{
        // signName.set(req.body["NewEmail"],req.body["NewName"]);
        createUserWithEmailAndPassword(auth, req.body["sellerEmail"], req.body["sellerPassword"])
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        currStatus="okay";
        req.flash('message',['Welcome! Account created successfully!','success']);
        const message=req.flash('message');
        homeStatus=2;
        // signType=0;
        
        // addDoc(users,{
        //     name: req.body["sellerName"],
        //     email:req.body["sellerEmail"],
        //     password:req.body["sellerPassword"]
        // })
        // .then( ()=>{
        //     console.log("Data Saved");
        // })
        // .catch((err)=>{
        //     console.log("db error");
        // })
        res.render("seller/seller_details.ejs");
        
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        currStatus="okay";
        req.flash('message',[`${errorMessage}`,'danger']);
        const message=req.flash('message');
        res.render("seller/seller_signup.ejs",{message:message});
    
        // ..
      });
      
      
    
    // homeStatus=1;
    // }
    //     console.log(req.body["NewEmail"]);
    //     console.log(req.body["NewPassword"]);
});


app.get("/seller-sign-in-page",(req,res)=>{
    res.render("seller/seller_signin.ejs");
});


app.get("/seller-sign-in",(req,res)=>{
    if((req.body["sellerGivenEmail"]!=null) && (req.body["sellerGivenPassword"]!=null)){
        console.log(req.body["GivenEmail"]);
        console.log(req.body["GivenPassword"]);
        currStatus="okay";
        
    }
    else{
        if((req.body["sellerGivenEmail"]=="")){
            currStatus="Please Enter Email";
            req.flash('message',['Please Enter Email','danger']);
        }
        else if((req.body["sellerGivenPassword"]=="")){
            currStatus="Please Enter Password";
            req.flash('message',["Please Enter Password",'danger']);
        }
        else{
            currStatus="Incorrect Email or Password";
            req.flash('message',["Incorrect Email or Password",'danger']);
        }
        // console.log("error");
        // console.log(req.body["GivenEmail"]);
        // console.log(req.body["GivenPassword"]);
    }
    if(currStatus=="okay"){
        signInWithEmailAndPassword(auth,req.body["GivenEmail"], req.body["GivenPassword"])
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    req.flash('message',[`Welcome Back!`,'success']);
    homeStatus=2;
        const message=req.flash('message');
        signType=0;
        res.render("dashboard.ejs",{p:p});
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode,errorMessage);


    req.flash('message',[`${errorMessage}`,'danger']);
    homeStatus=1;
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
  });
        
        // currStatus="null";
        // homeStatus=1;
    }
    else if(currStatus=="Please Enter Email"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else if(currStatus=="Please Enter Password"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else if(currStatus=="Incorrect Email or Password"){
        const message=req.flash('message');
        res.render("SignIN.ejs",{message:message});
        // currStatus="null";
    }
    else{
        console.log("error");
        const message=req.flash('message');
        currStatus="An Unknown Error Occured";
        homeStatus=1;
        res.render("home.ejs",{homeStatus:homeStatus,message:message});
    }
});

app.get("/seller-dashboard",(req,res)=>{
    req.flash('message',['Welcome!','success']);
        const message=req.flash('message');
    res.render("dashboard.ejs",{p:p});
});

app.get("/explore-map",(req,res)=>{
    res.render("map.ejs",{p:p});
    
});

app.get("/seller_profile",(req,res)=>{
   res.render("seller_profile.ejs",{p:p});
});


app.post("/add1",(req,res)=>{
    p++;
    res.render("seller_profile.ejs",{p:p});
});


app.get("/show-cart",(req,res)=>{
    res.render("cart.ejs",{p:p});
});





app.listen(port,(err)=>{
    if(err) throw err;
    console.log(`Server running on port ${port}`);
});



// const docToUpdate=doc(db,"users","RFcKrMbz4J7zqxauXtZ");
//   updateDoc(docToUpdate,{
//       email: "New email",
//       etc... 
//    })
//   .then(()=>{
//     console.log("Data updated");
//   })
//   .catch((err)=>{
//     console.log(err.message);
//   });