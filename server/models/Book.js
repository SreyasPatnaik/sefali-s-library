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
  author: { type: String, required: true, default: 'Shefali Jangid Studio' },
  edition: { type: String, default: 'Studio Edition 2026' },
  category: { type: String, default: 'Art & Design' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  formats: [{ type: String, enum: ['EPUB', 'PDF', 'PHYSICAL', 'STANDARD'] }],
  deliveryTag: { type: String, default: 'Studio Delivery' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  featured: { type: Boolean, default: false },
  tag: { type: String, required: true }, // e.g. CERAMICS, LEATHER, ART, DECOR
  readingMood: { type: String, default: 'Handcrafted & Mindful Living' },
  pageCount: { type: Number, default: 1 },
  stockQuantity: { type: Number, default: 24 },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 4.9 },
  synopsis: { type: String, required: true },
  description: { type: String, default: '' },
  materials: { type: String, default: 'Artisanal Hand-finished' },
  dimensions: { type: String, default: 'Custom Studio Sizing' },
  image: { type: String, default: '' },
  images: [{ type: String }],
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
