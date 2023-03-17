const jwt = require("jsonwebtoken")

const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const { isValidObjectId } = require("../validator/validator")

//================================================Authentication======================================================//

const authenticate = function (req, res, next) {
    try {
        if (!req.headers["x-api-key"]) {
            return res.status(400).send({ status: false, message: "token must be present in headers" })
        }
        else {
            jwt.verify(req.headers["x-api-key"], "project/booksManagementGroup22", function (err, decodedToken) {
            if(err){return res.status(401).send({ status: false, name:err.name, message: err.message })}
            else{
           req.loginUserId = decodedToken.id   
            next()}})}
}
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })}}



//===============================================authorisation====================================================//

const authorisation = async function (req, res, next) {
    try { 
        if (req.params.bookId) {
            if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: 'Please provide a valid bookId' }) }
            const fetchBook= await bookModel.findById(req.params.bookId)
            
            if(!fetchBook){return res.status(404).send({ status: false, message: 'bookId does not exists' }) }
            if (req.loginUserId != fetchBook.userId) { return res.status(403).send({ status: false, message: "You are not authorised to perform this activity" }) }}
        else {
            if (!isValidObjectId(req.body.userId)) { return res.status(400).send({ status: false, message: 'Please provide a valid UserId' }) }
            if(await userModel.findById(req.body.userId)===null){return res.status(404).send({ status: false, message: 'user does not exist' }) }
            if ( req.body.userId!= req.loginUserId) { return res.status(403).send({ status: false, message: 'You are not authorised to perform this activity' }) }

        }
        next();
    }
    catch (error) {
        return res.status(500).send({ message: error.message })
    }
}



module.exports.authenticate = authenticate
module.exports.authorisation = authorisation