const express = require('express');
const { Webhook } = require('svix');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { createUser, deleteUser, updateUser } = require('../services/userService');
const { createTransaction } = require('../services/transactionService');
const { updateCredits } = require('../services/userService');

const router = express.Router();

// Clerk webhook
router.post('/clerk', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    const headers = req.headers;
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Error occurred -- no svix headers' });
    }

    const payload = req.body;
    const body = payload.toString();

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Error occurred' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    // CREATE
    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      };

      const newUser = await createUser(user);
      return res.json({ message: 'OK', user: newUser });
    }

    // UPDATE
    if (eventType === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name,
        lastName: last_name,
        username: username,
        photo: image_url,
      };

      const updatedUser = await updateUser(id, user);
      return res.json({ message: 'OK', user: updatedUser });
    }

    // DELETE
    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      const deletedUser = await deleteUser(id);
      return res.json({ message: 'OK', user: deletedUser });
    }

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);

    return res.status(200).json({});
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const body = req.body;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).json({ message: 'Webhook error', error: err });
    }

    // Get the ID and type
    const eventType = event.type;

    // CREATE
    if (eventType === 'checkout.session.completed') {
      const { id, amount_total, metadata } = event.data.object;

      const transaction = {
        stripeId: id,
        amount: amount_total ? amount_total / 100 : 0,
        plan: metadata?.plan || '',
        credits: Number(metadata?.credits) || 0,
        buyerId: metadata?.buyerId || '',
        createdAt: new Date(),
      };

      const newTransaction = await createTransaction(transaction);
      return res.json({ message: 'OK', transaction: newTransaction });
    }

    return res.status(200).json({});
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;