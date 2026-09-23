const express = require('express');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Helper to parse multipart or JSON book fields
const parseBookFields = (body, file) => {
  let formats = ['EPUB', 'PDF'];
  if (body.formats) {
    if (Array.isArray(body.formats)) {
      formats = body.formats;
    } else if (typeof body.formats === 'string') {
      try {
        formats = JSON.parse(body.formats);
      } catch {
        formats = body.formats.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }

  let chapters = [];
  if (body.chapters) {
    if (typeof body.chapters === 'string') {
      try { chapters = JSON.parse(body.chapters); } catch {}
    } else if (Array.isArray(body.chapters)) {
      chapters = body.chapters;
    }
  }

  let sampleChapter = null;
  if (body.sampleChapter) {
    if (typeof body.sampleChapter === 'string') {
      try { sampleChapter = JSON.parse(body.sampleChapter); } catch {}
    } else {
      sampleChapter = body.sampleChapter;
    }
  }

  const result = {
    title: body.title,
    author: body.author || 'Shefali Jangid',
    price: Number(body.price),
    formats,
    tag: (body.tag || 'SYSTEMS').toUpperCase(),
    synopsis: body.synopsis,
    edition: body.edition || 'Edition 2026',
    status: body.status || 'Published',
    readingMood: body.readingMood || 'High Scalability Architecture',
    pageCount: Number(body.pageCount) || 180,
    coverGradient: body.coverGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    coverColor: body.coverColor || '#1e293b',
    chapters,
    sampleChapter: sampleChapter || {
      chapterNumber: 1,
      title: 'Sample Chapter',
      subtitle: 'Preview Content',
      content: body.synopsis || '',
      keyTakeaway: 'Sample takeaway note.'
    }
  };

  if (file) {
    result.ebookFile = `/uploads/ebooks/${file.filename}`;
    result.fileOriginalName = file.originalname;
    result.fileSize = file.size;
    result.fileMimeType = file.mimetype;
  }

  return result;
};

// @route   GET /api/books
// @desc    Get all books with optional search, tag, or status filters
router.get('/', async (req, res) => {
  try {
    const { tag, search, status, featured } = req.query;
    let query = {};

    // Filter by status if provided, default to Published for customers unless requested otherwise
    if (status) {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (tag && tag.toLowerCase() !== 'all') {
      query.tag = new RegExp(tag, 'i');
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { synopsis: new RegExp(search, 'i') }
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving book catalog', error: err.message });
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving book', error: err.message });
  }
});

// @route   GET /api/books/:id/sample
// @desc    Get free sample chapter for preview
router.get('/:id/sample', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({
      title: book.title,
      author: book.author,
      sampleChapter: book.sampleChapter || (book.chapters && book.chapters[0])
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving sample chapter', error: err.message });
  }
});

// @route   POST /api/books
// @desc    Create new e-book with optional attached file (Admin)
router.post('/', auth, adminOnly, upload.single('ebookFile'), async (req, res) => {
  try {
    const parsedData = parseBookFields(req.body, req.file);

    if (!parsedData.title || !parsedData.price || !parsedData.tag || !parsedData.synopsis) {
      return res.status(400).json({ message: 'Title, price, tag, and synopsis are required.' });
    }

    const newBook = await Book.create(parsedData);
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Error creating e-book:', err);
    res.status(500).json({ message: 'Error creating e-book', error: err.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update e-book metadata and optional file replacement (Admin)
router.put('/:id', auth, adminOnly, upload.single('ebookFile'), async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updateData = parseBookFields(req.body, req.file);

    // If new file uploaded and an old file exists, remove the obsolete file
    if (req.file && existingBook.ebookFile) {
      const oldFilePath = path.join(__dirname, '..', existingBook.ebookFile);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (fErr) {
          console.warn('Could not remove old file:', fErr.message);
        }
      }
    } else if (!req.file && existingBook.ebookFile) {
      // Retain existing file if no new file uploaded
      updateData.ebookFile = existingBook.ebookFile;
      updateData.fileOriginalName = existingBook.fileOriginalName;
      updateData.fileSize = existingBook.fileSize;
      updateData.fileMimeType = existingBook.fileMimeType;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating e-book:', err);
    res.status(500).json({ message: 'Error updating e-book', error: err.message });
  }
});

// @route   POST /api/books/:id/reviews
// @desc    Add review for a book (Authenticated user)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingReviewIndex = book.reviews.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReviewIndex >= 0) {
      book.reviews[existingReviewIndex].rating = rating;
      book.reviews[existingReviewIndex].comment = comment;
      book.reviews[existingReviewIndex].createdAt = new Date();
    } else {
      book.reviews.push({
        userId: req.user._id,
        userName: req.user.name,
        rating,
        comment,
        createdAt: new Date()
      });
    }

    // Recalculate average rating
    const totalRating = book.reviews.reduce((acc, item) => item.rating + acc, 0);
    book.rating = Number((totalRating / book.reviews.length).toFixed(1));

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete e-book (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Remove physical file from disk if present
    if (book.ebookFile) {
      const filePath = path.join(__dirname, '..', book.ebookFile);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fErr) {
          console.warn('Failed to delete file from storage:', fErr.message);
        }
      }
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'E-Book deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting e-book', error: err.message });
  }
});

module.exports = router;
