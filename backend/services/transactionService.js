const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const connectToDatabase = require('../config/database');
const { handleError } = require('../utils/helpers');
const { updateCredits } = require('./userService');

const checkoutCredits = async (transaction) => {
  try {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const amount = Number(transaction.amount) * 100;

    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: transaction.plan,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/profile`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
    });

    return session.url;
  } catch (error) {
    handleError(error);
  }
};

const createTransaction = async (transaction) => {
  try {
    await connectToDatabase();

    // Create a new transaction with a buyerId
    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
};

module.exports = {
  checkoutCredits,
  createTransaction,
};
