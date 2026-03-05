const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  watchlist: {
    type: [String],
    default: [],
  },
  portfolio: {
    type: Map,
    of: {
      totalInvestment: { type: Number, default: 0 },
      units: { type: Number, default: 0 },
    },
    default: {},
  },
  transactions: [{
    coinId: String,
    type: { type: String, enum: ['buy', 'sell'] },
    amount: Number,
    price: Number,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);