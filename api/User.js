const express = require('express');
const { find } = require('./../models/User');
const router = express.Router();
const  User = require('./../models/User'); 
const bcrypt = require('bcrypt');


router.post('/signup', (req, res) => {
    let{name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if(name == "" || email == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status : 'FAILED',
            message : "Invalid name"
        })
    }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status : 'FAILED',
            message : "Invalid email address"
        })
    }else if (!new Date(dateOfBirth).getTime()){
        res.json({
            status : 'FAILED',
            message : "Invalid Date of Birth entered"
        })
    }else if (password.length < 8){
        res.json({
            status : 'FAILED',
            message : "Password too short"
        })
    }else {
        User.find({email}).then(result =>{
            if (result.length){
                res.json({
                    status : 'Failed',
                    message : 'User with the provided email already exists'
                })
            } else {
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword =>{
                const newUser = new User({
                    name,
                    email,
                    password: hashedPassword,
                    dateOfBirth
                });
                newUser.save().then(result =>{
                    res.json({
                        staus : 'SUCCESS',
                        message : 'Sign Successful',
                        date: result,
                    })
                })
                .catch(err =>{
                    res.json({
                        status : 'FAILED',
                        message : 'An error occured while saving the user account password'
                    })
                })
                })
                .catch(err =>{
                    res.json({
                        staus : 'FAILED',
                        message : 'An error occured while hashing password'
                    })
                })
            }
        }).catch(err =>{
            console.log(err);
            res.json({
                staus : 'FAILED',
                message : 'An error occured while checking for existing user!'
            })
        })
    }
})
router.post('/signin/', (req, res) => {
    let {email,password} = req.body;
    email = email.trim();
    password = password.trim();

    if( email == "" || password == "" ) {
        res.json({
            status: "FAILED",
            message: "Enter a valid credentials"
        });
    } else {
        User.find({email}).then(data =>{
            if (data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password,hashedPassword).then(result =>{
                    if (result) {
                        res.json({
                            status : 'SUCCESS',
                            message : 'Signin Successful',
                            data : data
                        })
                    }else {
                        res.json({
                            staus :'FAILED',
                            message : 'Invalid Password entered!'
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        staus :'FAILED',
                        message : 'An error while comparing the passwords!'
                    })
                })
            }else {
                res.json({
                    staus :'FAILED',
                    message : 'Invalid credentials entered!'
                })
            }
        })
        .catch(err => {
            res.json({
                staus :'FAILED',
                message : 'An error occured while checking for existing user'
            })
        })
    }
})
module.exports = router;