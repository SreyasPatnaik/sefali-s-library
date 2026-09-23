const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI ID' },
  status: { type: String, enum: ['Paid', 'Refunded', 'Pending'], default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
