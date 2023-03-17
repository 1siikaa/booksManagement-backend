const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const reviewSchema = new mongoose.Schema({

  bookId: { type: ObjectId, required: true, ref: "Book" },

  reviewedBy: { type: String, default: 'Guest' },

  reviewedAt: { type: Date, required: true },

  rating: { type: Number, required: true, min: 1, max: 5 },

  review: { type: String },

  isDeleted: { type: Boolean, default: false },
  
  deletedAt: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model("Review", reviewSchema)
