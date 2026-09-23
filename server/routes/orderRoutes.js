const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Book = require('../models/Book');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Helper to generate order numbers (#1043, #1044...)
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  if (!lastOrder || !lastOrder.orderNumber) {
    return '#1043';
  }
  const numericPart = parseInt(lastOrder.orderNumber.replace('#', ''), 10);
  return `#${isNaN(numericPart) ? 1043 : numericPart + 1}`;
};

// @route   POST /api/orders
// @desc    Process checkout & unlock e-books
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, bookIds, paymentMethod, deliveryEmail } = req.body;
    const targetBookIds = bookIds && Array.isArray(bookIds) && bookIds.length > 0 ? bookIds : (bookId ? [bookId] : []);
    
    if (targetBookIds.length === 0) {
      return res.status(400).json({ message: 'At least one Book ID is required for checkout.' });
    }

    const books = await Book.find({ _id: { $in: targetBookIds } });
    if (books.length === 0) {
      return res.status(404).json({ message: 'Selected e-books not found.' });
    }

    const user = await User.findById(req.user._id);

    // Unlock books for user
    for (const book of books) {
      const alreadyPurchased = user.purchasedBooks.some(id => id.toString() === book._id.toString());
      if (!alreadyPurchased) {
        user.purchasedBooks.push(book._id);
        user.readingProgress.push({
          bookId: book._id,
          chapterNumber: 1,
          lastPage: 1,
          percentage: 0,
          completed: false
        });
      }
    }
    await user.save();

    const orderNum = await generateOrderNumber();
    const totalAmount = books.reduce((sum, b) => sum + b.price, 0);
    const titleSummary = books.map(b => b.title).join(', ');

    const newOrder = await Order.create({
      orderNumber: orderNum,
      user: user._id,
      customerName: user.name,
      customerEmail: deliveryEmail || user.email,
      book: books[0]._id,
      bookTitle: titleSummary,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'UPI ID',
      status: 'Paid'
    });

    res.status(201).json({
      order: newOrder,
      unlockedBooks: books,
      unlockedBook: books[0],
      message: 'Payment verified! Instant access unlocked in My Library.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Checkout processing failed', error: err.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current customer order history
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user orders', error: err.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for Admin panel
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders log', error: err.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Paid / Refunded) (Admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});

// @route   POST /api/orders/update-progress
// @desc    Save reading progress for owned e-book
router.post('/update-progress', auth, async (req, res) => {
  try {
    const { bookId, chapterNumber, lastPage, percentage, completed } = req.body;
    const user = await User.findById(req.user._id);

    let progressItem = user.readingProgress.find(p => p.bookId.toString() === bookId);
    if (progressItem) {
      progressItem.chapterNumber = chapterNumber;
      progressItem.lastPage = lastPage;
      progressItem.percentage = percentage;
      progressItem.completed = completed || percentage >= 100;
      progressItem.lastReadAt = new Date();
    } else {
      user.readingProgress.push({
        bookId,
        chapterNumber,
        lastPage,
        percentage,
        completed: completed || percentage >= 100,
        lastReadAt: new Date()
      });
    }

    await user.save();
    res.json({ message: 'Reading progress updated', readingProgress: user.readingProgress });
  } catch (err) {
    res.status(500).json({ message: 'Error updating progress', error: err.message });
  }
});

module.exports = router;
