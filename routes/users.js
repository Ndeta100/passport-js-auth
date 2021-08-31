const express= require('express')
const User =require('../models/User')
const router=express.Router()
const bcrypt=require('bcryptjs')
const passport=require('passport')
//passport config
require('./../config/passport')
router.get('/login',(req,res)=>{
    res.render('login')
})
router.get('/register',(req,res)=>{
    res.render('register')
})


//Register handle
router.post('/register',(req,res)=>{
    const {name, email, password, password2}=req.body
    let errors=[]
    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:'please fill in all fields'})
    }

    //Check if passwords match
    if(password!=password2){
        errors.push({msg:'Passwords do not match'})
    }

    //check password length
    if(password.length<6){
        errors.push({msg:'Password should be atleast 6 characters'})
    }

    if(errors.length>0){
      res.render('register',{
          errors,
          name,
          email,
          password,
          password2
      })
    }else{
        //VALIDATIONS PASS
    User.findOne({email:email}).then(user=>{
        if(user){
            //User exist
            errors.push({msg:'Email is already registered'})
            res.render('register',{
                errors,
                name,
                email,
                password,
                password2
            })
        }else{
         const newUser=new User({
             name,
             email,
             password
         })
         //HAsH PASSword
         bcrypt.genSalt(10,(err, salt)=>{
           bcrypt.hash(newUser.password,salt,(err,hash)=>{
             if(err) throw err
             //set password to hashsed
             newUser.password=hash

             //save user
             newUser.save().then(user=>{
                 req.flash('success_msg', 'You are now registered')
                 res.redirect('/users/login')
             }).catch(err=>console.log(err))
           })
         })
        }
    })
    }
})

//Login handle
router.post('/login', (req, res , next)=>{
passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/users/login',
    failureFlash:true
})(req,res,next)
})

//logout handle

router.get('/logout',(req,res)=>{
    req.logOut()
    req.flash('success_msg', 'You are logout')
    res.redirect('/users/login')
})
module.exports=router