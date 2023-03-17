const userModel = require("../models/userModel")
const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")

const {isValidName, isValidObjectId, validatorISBN} = require("../validator/validator")
const moment = require("moment")

//=========================================<==CREATEBOOK API==>==============================================================//

const createBooks = async function (req, res) {
  try {
   if (Object.keys(req.body) == 0) { return res.status(400).send({ status: false, message: 'plz provide Data' }) }// When body have No data

    //===========================validate by using validetor folder(by using Regex and somthing)===============================//

    if (!isValidName(req.body.title)) { return res.status(400).send({ status: false, message: 'Title is required' }) }
    if (!isValidName(req.body.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt is required' }) }
    if (!isValidName(req.body.userId)) { return res.status(400).send({ status: false, message: 'User Id is required' }) }
    if (!isValidObjectId(req.body.userId)) { return res.status(400).send({ status: false, message: 'Please provide a valid userId' }) }
    if (!isValidName(req.body.ISBN)) { return res.status(400).send({ status: false, message: 'ISBN is required' }) }
    if (!validatorISBN(req.body.ISBN)) { return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' }) }
    if (!isValidName(req.body.category)) { return res.status(400).send({ status: false, message: 'Category is required' }) }
    if (!isValidName(req.body.subcategory)) { return res.status(400).send({ status: false, message: 'Subcategory is required' }) }

    if (req.body.releasedAt) {
      function dateIsValid(dateStr) {
      

        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/) === null) { return false }
  
        if (  new Date(dateStr)=="Invalid Date") { return false }}
      if (dateIsValid(req.body.releasedAt) == false) { return res.status(400).send({ status: false, message: 'releasedAt format should be `YYYY-MM-DD` & valid date' }) }}

    if (await bookModel.findOne({ title: req.body.title })) { return res.status(409).send({ status: false, message: 'Title already exists' }) }
    
    if (!await userModel.findOne({_id:req.body.userId})) { return res.status(400).send({ status: false, message: 'User Id does not exists' }) }
    if (await bookModel.findOne({ISBN:req.body.ISBN})) { return res.status(400).send({ status: false, message: 'ISBN already exists' }) }
    if (!req.body.releasedAt) { req.body.releasedAt = moment().format("YYYY-MM-DD") }
    
    if(req.body.reviews){
    return res.status(400).send({status:false, msg:"at the time of book creation reviews should not be there"})}
    return res.status(201).send({ status: true, message: 'Success', data:await bookModel.create(req.body)})}
    catch (error) {
    return res.sendStatus(500)}}



//=========================================<==GETBOOK BY FILTRER API==>==============================================================//

const getBook = async function (req, res) {
  try {

    if (req.query.userid) {
      if (!isValidObjectId(req.query.userId)) { return res.status(400).send({ status: false, msg: "Invalid userId " }); }
    }
    const book = await bookModel.find({ isDeleted: false, ...req.query, }).select({
      _id: 1, title: 1, excerpt: 1, userId: 1, category: 1,
      releasedAt: 1, reviews: 1
    }).sort({ title: 1 });

   if (book.length == 0) {
      return res.status(404).send({ status: false, msg: "Document doesn't exist" });
    }
  if (book) {
      return res.status(200).send({ status: true, message: 'Books list', count: book.length, data: book });}} 
    catch (err) {return res.status(500).send({ status: false, message: err.message });}};



//=========================================<==GETBOOK BY PSRAMS API==>==============================================================//

const booksById = async function (req, res) {
  try {
    if (!req.params.bookId) {
      return res.status(400).send({ status: false, message: "bookId is mandatory in Path" })}

    if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: 'provide a valid book Id' }) }
    const getdata = await bookModel.find({ _id: req.params.bookId, isDeleted: false })//.select({ ISBN: 0 })
    if (getdata.length == 0) {
      return res.status(404).send({ status: false, message: "No book exists in Database with this Id" })
    }
    const review = await reviewModel.find({ bookId:req.params.bookId, isDeleted: false })
      .select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

    const Data = {
      _id: getdata[0]._id,
      title: getdata[0].title,
      excerpt: getdata[0].excerpt,
      userId: getdata[0].userId,
      category: getdata[0].category,
      subcategory: getdata[0].subcategory,
      reviews: getdata[0].reviews,
      isDeleted: getdata[0].isDeleted,
      deletedAt: getdata[0].deletedAt,
      releasedAt: getdata[0].releasedAt,
      reviewsData: review}

    return res.status(200).send({ status: true, data: Data })}
    catch (error) {
    return res.status(500).send({ status: false, message: error.message })}}


//=========================================<==DELETEBOOK BY PSRAMS API==>==============================================================//


const deletById = async function (req, res) {
  try {
    if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: 'Provide a valid Id' }) }
    if(await bookModel.find({ _id: req.params.bookId, isDeleted: false }).count===0) {
      return res.status(404).send({ status: false, message: "No book exists in Database with this Id" })
    }     

    if(await bookModel.findByIdAndUpdate({ _id:req.params.bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: moment().format("YYYY-MM-DD") } })||
    await reviewModel.updateMany({ bookId:req.params.bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt:moment().format("YYYY-MM-DD") } }))
    return res.status(200).send({ status: true, message: "Successfully deleted the Book", })}
  catch (error) {
    return res.status(500).send({ status: false, message: error.message }) }}



//=========================================<==UPDATEBOOK BY PSRAMS API==>==============================================================//
const updateById = async function (req, res) {
  try {
    if (Object.keys(req.body) == 0) {
      return res.status(400).send({ status: false, message: "Provide data to update" })
    }
if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: 'Please provide a valid bookId' }) }
if (req.body.excerpt) {
      if (!isValidName(req.body.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt should not be empty' }) }
    }
if (req.body.category) {
      if (!isValidName(req.body.category)) { return res.status(400).send({ status: false, message: 'Category should not be empty' }) }
    }
if (req.body.releasedAt) {
      function dateIsValid(dateStr) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;

if (dateStr.match(regex) === null) { return false }
if (new Date(dateStr) == "Invalid Date") { return false }
      }
if (dateIsValid(req.body.releasedAt) == false) { return res.status(400).send({ status: false, message: 'releasedAt format should be `YYYY-MM-DD` & valid date' }) }
    }
if (req.body.ISBN) {
if (!isValidName(req.body.ISBN)) { return res.status(400).send({ status: false, message: 'ISBN should not be empty' }) }
if (!validatorISBN(req.body.ISBN)) { return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' }) }
if (await bookModel.findOne({ ISBN:req.body.ISBN })!==null) {
        return res.status(409).send({ status: false, message: "ISBN is alredy exists in Database" })
      }}  // checking ISBN is already exist.
if (req.body.title) {if (!isValidName(req.body.title)) { return res.status(400).send({ status: false, message: 'Title should not be empty' }) }
if (await bookModel.findOne({ title:req.body.title })!==null) {return res.status(409).send({ status: false, message: "Title is already exists in Database" })} // checking Title is Unique or not
    }
if (await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })===null) { return res.status(404).send({ status: false, message: "No book exists in Database with this Id" }) }
return res.status(200).send({ status: true, message: "Success", data: await bookModel.findOneAndUpdate({ _id: req.params.bookId }, { $set: {...req.body} }, { new: true }) })
  }
catch (error) {return res.status(500).send({ status: false, message: error.message })}}


//=======================================================================================================//



module.exports.createBooks = createBooks
module.exports.booksById = booksById
module.exports.getBook = getBook
module.exports.deletById = deletById
module.exports.updateById = updateById


