// Route file handling log in and register functionality 

import {Router} from 'express'
const router = Router()

import {createUser} from '../data/users.js'
import {checkUser} from '../data/users.js'

import helpers from '../helpers.js'
import multer from 'multer';
import xss from 'xss';
const upload = multer({ dest: './public/data/uploads/' });


router 
    .route('/login')
    .get(async (req, res) => {
        return res.render('login')
    })
    .post(async (req,res) => {
        try {
            let userInput = req.body
            if (!userInput.emailAddressInput) throw 'Error: Email Address not provided'
            if (!userInput.passwordInput) throw 'Error: Password not provided'
            let emailAddressInput = userInput.emailAddressInput
            let passwordInput = userInput.passwordInput

            emailAddressInput = helpers.checkEmail(emailAddressInput, 'Email Address')
    
            let userLoggingIn = await checkUser(emailAddressInput, passwordInput)
            req.session.user = userLoggingIn
            return res.redirect('homepage')            

          } catch (e) {
            return res.status(400).render('login', {error:e})
          }
    })


router
    .route('/register')
    .get(async (req, res) => {
        return res.render('register')
    })
    .post(upload.single('uploadFile'), async (req, res) => {
        try {
            applyXSS(req.body)
            let userInput = req.body

            if (!userInput.firstNameInput) throw `Error: First Name not provided`
            if (!userInput.lastNameInput) throw 'Error: Last Name not provided'
            if (!userInput.emailAddressInput) throw 'Error: Email Address not provided'
            if (!userInput.passwordInput) throw 'Error: Password not provided'
            if (!userInput.confirmPasswordInput) throw 'Error: Confirm your password'
            if (!userInput.phoneNumberInput) throw 'Error: Phone number not provided'

            let firstNameInput = helpers.checkString(userInput.firstNameInput, 'First Name')
            let lastNameInput = helpers.checkString(userInput.lastNameInput, 'Last Name')
            let emailAddressInput = helpers.checkEmail(userInput.emailAddressInput, 'Email Address')
            let passwordInput = helpers.checkPassword(userInput.passwordInput, 'Password')
            if (userInput.confirmPasswordInput != passwordInput) throw 'Error: Passwords do not match'
            let phoneNumberInput = helpers.checkPhoneNumber(userInput.phoneNumberInput, 'Phone Number')
            let imageInput = "default_image";
            if(req.file){
            imageInput = req.file.filename; }

            let insertingUserInfo = await createUser(firstNameInput, lastNameInput, emailAddressInput, passwordInput, phoneNumberInput,imageInput)
            if (insertingUserInfo.insertedUser == true) {
                return res.redirect('/login')
            } else {
                return res.status(500).json({error: 'Internal Server Error'})
            }
        } catch (e) {
            return res.status(400).render('register', {error:e})
        }
    }) 

    
router
    .route("/logout")
    .get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.render("logout");
    });

    const applyXSS = (req_body) => {
        Object.keys(req_body).forEach(function (key, index) {
          req_body[key] = xss(req_body[key]);
        });
      };    
export default router;