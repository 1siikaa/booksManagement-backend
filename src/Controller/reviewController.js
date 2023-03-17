const reviewModel = require("../models/reviewModel")
const bookModel = require("../models/bookModel")
const { isValidObjectId, isValidName, forName } = require("../validator/validator")
const moment = require("moment")

//=========================================<== CREATER RREVIEW API==>==============================================================//
const Reviewcreate = async function (req, res) {
    try {
        if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: 'Plz provide a valid bookId' }) }
        if (Object.keys(req.body) == 0) { return res.status(400).send({ status: false, message: 'Plz provied data' }) }

        if (!req.body.rating) { return res.status(400).send({ status: false, message: "rating is mandatory" }) }
        if (req.body.reviewedBy) {
            if (!isValidName(req.body.reviewedBy) || !forName(req.body.reviewedBy)) return res.status(400).send({ status: false, message: "Plz provied a valid name which starts with capital in reviewedBy" })
        }
        if (typeof req.body.rating != "number" || req.body.rating > 5 || req.body.rating < 1) { return res.status(400).send({ status: false, message: "Rating takes only numberic value in between 1-5" }) }
      
        if (req.body.review==='') { return res.status(400).send({ status: false, message: "Review should not be empty or invalid" }) }
        if (req.body.review) {
            if (!isValidName(req.body.review)) { return res.status(400).send({ status: false, message: "Review should not be empty or invalid" }) }
        }
        if (await bookModel.findOne({ _id:req.params.bookId, isDeleted: false })===null) {
            return res.status(404).send({ status: false, message: "No book exists in Database with this Id" })
        }              //handling date and time  by using Moment
        req.body.reviewedAt = moment().format("YYYY-MM-DD")
        req.body.bookId = req.params.bookId
        await bookModel.findOneAndUpdate({ _id:req.params.bookId }, { $inc: { reviews: +1 } }, { new: true })  // update reviews 
        
        return res.status(201).send({ status: true, data: await reviewModel.create(req.body)})}
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })}}


//======================================<== updateReview RREVIEW API==>============================================================//

const updateReview = async function (req, res) {
    try {
        if (!isValidObjectId(req.params.bookId)) {
            res.status(400).send({ status: false, message: 'plz prrovied valid bookId' });
            return;
        }
        if (!isValidObjectId(req.params.reviewId)) {
            res.status(400).send({ status: false, message: 'plz prrovied valid reviewId' });
            return;
        }
        let findReview = await reviewModel.findOne({ _id:req.params.reviewId, isDeleted: false })
        if (!findReview) {
            return res.status(404).send({ status: false, message: "No Review Available in this Id" })
        }
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ message: " plz provied data" })
        }
        if (req.body.reviewedBy) {
            if (!isValidName(req.body.reviewedBy) || !forName(req.body.reviewedBy)) { return res.status(400).send({ status: false, message: "Plz provied a valid name which starts with capital in reviewedBy" }) }
        }
        if (req.body.review) {
            if (!isValidName(req.body.review)) { return res.status(400).send({ status: false, message: "Review should not be empty or invalid" }) }
        }
        if (req.body.rating) {

            if (typeof req.body.rating != "number" || req.body.rating > 5 || req.body.rating < 1) { return res.status(400).send({ status: false, message: "Rating takes only numberic value in between 1-5" }) }
        }
        if (findReview.bookId != req.params.bookId) { return res.status(404).send({ status: false, message: "ReviewId and bookId does not match" }) }
        return res.status(200).send({ status: true, message: 'Review updated', data: await reviewModel.findOneAndUpdate({ _id: req.params.reviewId }, { ...req.body }, { new: true }).select({ __v: 0 }) });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })}}



///=========================================<== DELETE RREVIEW API==>==============================================================//
const deleteReview = async function (req, res) {
    try {
        if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: ' provide a valid Book id' }) }
        if (!isValidObjectId(req.params.reviewId)) { return res.status(400).send({ status: false, message: ' provide a valid Review id' }) }

        const findReview = await reviewModel.findOne({ _id: req.params.reviewId, isDeleted: false })
        if (!findReview) { return res.status(404).send({ status: false, message: "No review exists in Database with this Id" }) }

        if (findReview.bookId !=req.params.bookId) { return res.status(404).send({ status: false, message: "ReviewId and bookId does not match" }) }
        await reviewModel.findOneAndUpdate({ _id:req.params.reviewId }, { isDeleted: true, deletedAt:moment().format("YYYY-MM-DD") }, { new: true })
        await bookModel.findOneAndUpdate({ _id: req.params.bookId }, { $inc: { reviews: -1 } })
    
    return res.status(200).send({ status: true, message: "Review deleted successfully." })}
    catch (error) {return res.status(500).send({ status: false, message: error.message })}}

//========================================================================================================//


module.exports.Reviewcreate = Reviewcreate;
module.exports.deleteReview = deleteReview;
module.exports.updateReview = updateReview;