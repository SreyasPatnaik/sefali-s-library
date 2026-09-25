const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  content: { type: String, required: true },
  keyTakeaway: { type: String, default: '' },
  pageOffset: { type: Number, default: 1 }
});

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true, default: 'Shefali Jangid' },
  edition: { type: String, default: 'Edition 2026' },
  price: { type: Number, required: true },
  formats: [{ type: String, enum: ['EPUB', 'PDF'] }],
  deliveryTag: { type: String, default: 'Instant Delivery' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  featured: { type: Boolean, default: false },
  tag: { type: String, required: true }, // e.g. SYSTEMS, CSS TRICKS, PYTHON
  readingMood: { type: String, default: 'Architectural & Strategic' },
  pageCount: { type: Number, default: 180 },
  rating: { type: Number, default: 4.9 },
  synopsis: { type: String, required: true },
  coverGradient: { type: String, default: 'linear-gradient(135deg, #1f2421 0%, #2d5a47 100%)' },
  coverColor: { type: String, default: '#2d5a47' },
  ebookFile: { type: String, default: '' },
  fileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  fileOriginalName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  fileMimeType: { type: String, default: '' },
  chapters: [ChapterSchema],
  sampleChapter: ChapterSchema,
  reviews: [ReviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
