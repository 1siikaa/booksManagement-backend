const userModel = require("../models/userModel")
const { isValidName, isValidEmail, isValidNumber, isValidPassword, forName,pincodes } = require("../validator/validator")
const jwt = require('jsonwebtoken')


//--- Post Api for User Creation ---
//=========================================<== CREATER USRER API==>==============================================================//
const createdUser = async function (req, res) {
    try {

    //===========================validation for Key and Value present or Not=============================================// 

        if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "plz provide data" })
        if (!req.body.title) { return res.status(400).send({ status: false, message: "title is mandatory" }) }
        if (!req.body.name) { return res.status(400).send({ status: false, message: "name is mandatory" }) }
        if (!req.body.phone) { return res.status(400).send({ status: false, message: "phone no is mandatory" }) }
        if (!req.body.email) { return res.status(400).send({ status: false, message: "email is mandatory" }) }
        if (!req.body.password) { return res.status(400).send({ status: false, message: "password is mandatory" }) }

        
    //==============================validation by using Regex=============================================================// 

        if (!isValidName(req.body.title)) return res.status(400).send({ status: false, message: "plz provide title" })
        if (!["Miss", "Mrs", "Mr"].includes(req.body.title)) return res.status(400).send({ status: false, message: "title takes only Mr, Miss, Mrs" })
        if (!isValidName(req.body.name)) return res.status(400).send({ status: false, message: "Plz provied a valid name" })
        if (!forName(req.body.name)) return res.status(400).send({ status: false, message: "name should be valid and starts with Capital letter" })
        if (!isValidNumber(req.body.phone)) return res.status(400).send({ status: false, message: "phone no is not valid" })
        if (!isValidEmail(req.body.email)) return res.status(400).send({ status: false, message: "email is not valid" })
        if (!isValidPassword(req.body.password)) return res.status(400).send({ status: false, message: "Choose a Strong Password,Use a mix of letters (uppercase and lowercase), numbers, and symbols in between 8-15 characters" })
       
        if(req.body.address){        
        if (!isValidName(req.body.address.street)) return res.status(400).send({ status: false, message: "Plz provide street in address" })
        if (!isValidName(req.body.address.city)) return res.status(400).send({ status: false, message: "Plz provide city in address" })
        if (!isValidName(req.body.address.pincode)) return res.status(400).send({ status: false, message: "Plz provide pincode in address" })
        if (!pincodes(req.body.address.pincode)) return res.status(400).send({ status: false, message: "Plz provide a valid pincode" })
        }
    //==========================================================================================================================//

 // checking Phone Number is Unique or not //
        if (await userModel.findOne({ phone:req.body.phone })) return res.status(400).send({ status: false, message: "phone no is already registered" })

  // checking Email is Unique or not //
        if (await userModel.findOne({ email: req.body.email })) return res.status(400).send({ status: false, message: "email is already registered" })
        return res.status(201).send({ status: true, message: 'Success', data: await userModel.create(req.body) })     // Data is Create Successfully
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message }) }}



//=========================================<== SIGNIN API==>==============================================================//

const userLogin = async function (req, res) {
    try {

        if (Object.keys(req.body)== 0) {
            return res.status(400).send({ status: false, message: "email and password are required for Log in" })
        }
        if (!req.body.email) { return res.status(400).send({ status: false, message: "email is mandatory" }) }
        if (!req.body.password) { return res.status(400).send({ status: false, message: "password is mandatory" }) }

        if (req.body.email.length == 0 || req.body.password.length == 0) {
            return res.status(400).send({ status: false, message: "both fields are required." })
        }

        if (!isValidEmail(req.body.email)) {
            return res.status(400).send({ status: false, message: "email is not valid" })
        }
        if (!isValidPassword(req.body.password)) {
            return res.status(400).send({ status: false, message: "password is not valid" })
        }

        const userDetail = await userModel.findOne({ email:req.body.email, password: req.body.password })
        if (!userDetail) {
            return res.status(404).send({ status: false, message: "User not found with this EmailId and Password" })
        }
//=======create Token by Jwt.sign Function
        return res.status(200).send({ status: true, message: "Success", data:jwt.sign({                                   
            id: userDetail._id.toString(),}, "project/booksManagementGroup22", { expiresIn: '30m' }) })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//==================================================================================//

module.exports.userLogin = userLogin
module.exports.createdUser = createdUser