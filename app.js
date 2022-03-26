require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session")
const passport = require("passport");
const localPassport = require("passport-local");
const passpostLocalMongoose = require("passport-local-mongoose");


const app = express();


app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.use(session({
    secret: "This is a secret",
    resave: false,
    saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
    }
);

userSchema.plugin(passpostLocalMongoose)

const User = mongoose.model("User", userSchema);



passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function (req,res){
    res.render("home")
});


app.get("/secrets", function (req,res) {

    if(req.isAuthenticated){
        res.render("secrets");
    }
    else{
        res.redirect("/login")
    }
})


app.get("/login",function (req,res){
    res.render("login")
});

app.post("/login", function (req,res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username},function (err,foundUser){

        if(err){
            console.log(err);
        }
        else {
            if(foundUser){
                if (password == foundUser.password){
                    res.render("secrets")
                    console.log("Welcome to SECRETS!");
                }                
            }
            else{
                consol.log("Uh oh! Not found!")
            }
        }
    })
})


app.get("/register",function (req,res){
    res.render("register")
});

app.post("/register", function (req,res){

    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if(err){
            console.log(err);
            res.redirect("/register")
        }
        else{
            passport.authenticate("local")(req,res, function (){
                res.redirect("/secrets")
            })
        }
    })
})


app.listen(3000,function (){
    console.log("This server is active on port 3000!")
})