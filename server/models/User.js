const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  chapterNumber: { type: Number, default: 1 },
  lastPage: { type: Number, default: 1 },
  percentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastReadAt: { type: Date, default: Date.now }
}, { _id: false });

const BookmarkSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  chapterNumber: { type: Number, required: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  readingProgress: [ReadingProgressSchema],
  bookmarks: [BookmarkSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
