const express = require('express');
const { Webhook } = require('svix');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ============================================================================
// CLERK WEBHOOK - User Management
// ============================================================================
router.post('/clerk', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('🎯 ===========================================');
  console.log('🔔 Clerk webhook endpoint hit!');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('❌ WEBHOOK_SECRET not found in environment');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    console.log('✅ Webhook secret found:', WEBHOOK_SECRET ? 'YES' : 'NO');

    // Get Svix headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    console.log('📋 Svix Headers:');
    console.log('  svix-id:', svix_id);
    console.log('  svix-timestamp:', svix_timestamp);
    console.log('  svix-signature:', svix_signature ? 'Present' : 'Missing');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing Svix headers');
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Verify webhook
    const body = req.body.toString();
    console.log('📄 Raw body length:', body.length);
    console.log('📄 Raw body preview:', body.substring(0, 200) + '...');
    
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
      console.log('✅ Webhook verification successful');
    } catch (err) {
      console.error('❌ Webhook verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    const { id } = evt.data;
    const eventType = evt.type;
    
    console.log('🎉 Webhook Event Details:');
    console.log('  Event Type:', eventType);
    console.log('  User ID:', id);
    console.log('  Full Event Data:', JSON.stringify(evt.data, null, 2));

    // Handle different event types
    switch (eventType) {
      case 'user.created':
        console.log('👤 Handling user.created event');
        await handleUserCreated(evt.data);
        break;
      
      case 'user.updated':
        console.log('✏️ Handling user.updated event');
        await handleUserUpdated(evt.data);
        break;
      
      case 'user.deleted':
        console.log('🗑️ Handling user.deleted event');
        await handleUserDeleted(evt.data);
        break;
      
      default:
        console.log(`⚠️ Unhandled Clerk event: ${eventType}`);
    }

    console.log('✅ Webhook processed successfully');
    console.log('🎯 ===========================================');
    return res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    console.error('❌ Stack trace:', error.stack);
    console.log('🎯 ===========================================');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// STRIPE WEBHOOK - Payment Processing
// ============================================================================
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not found');
      return res.status(500).json({ error: 'Stripe webhook secret not configured' });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Stripe webhook verification failed:', err.message);
      return res.status(400).json({ error: 'Stripe webhook verification failed' });
    }

    const eventType = event.type;
    console.log(`💳 Stripe webhook received: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled Stripe event: ${eventType}`);
    }

    return res.status(200).json({ message: 'Stripe webhook processed' });

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// CLERK EVENT HANDLERS
// ============================================================================

async function handleUserCreated(userData) {
  console.log('👤 ========== USER CREATION START ==========');
  console.log('📋 Raw userData received:', JSON.stringify(userData, null, 2));
  
  try {
    const { id, email_addresses, image_url, first_name, last_name, username } = userData;

    console.log('🔍 Extracted fields:');
    console.log('  id:', id);
    console.log('  email_addresses:', email_addresses);
    console.log('  image_url:', image_url);
    console.log('  first_name:', first_name);
    console.log('  last_name:', last_name);
    console.log('  username:', username);

    // Check email availability
    if (!email_addresses || !email_addresses.length) {
      console.error('❌ No email_addresses array found');
      throw new Error('No email addresses provided');
    }

    if (!email_addresses[0] || !email_addresses[0].email_address) {
      console.error('❌ No email_address in first email object');
      console.error('❌ First email object:', email_addresses[0]);
      throw new Error('Email address missing from first email object');
    }

    const email = email_addresses[0].email_address;
    console.log('✅ Email extracted:', email);

    const newUserData = {
      clerkId: id,
      email: email,
      username: username || null,
      firstName: first_name || '',
      lastName: last_name || '',
      photo: image_url || '',
      creditBalance: 10,
      planId: 1,
    };

    console.log('🏗️ Creating user with data:', JSON.stringify(newUserData, null, 2));

    const newUser = new User(newUserData);
    console.log('📝 User model created, attempting save...');
    
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully:', savedUser._id);
    console.log('✅ User created in database:', id);
    console.log('👤 ========== USER CREATION END ==========');
    
  } catch (error) {
    console.error('❌ ========== USER CREATION ERROR ==========');
    console.error('❌ Error creating user:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ MongoDB validation errors:', error.errors);
    console.log('❌ ========== USER CREATION ERROR END ==========');
    throw error;
  }
}

async function handleUserUpdated(userData) {
  try {
    const { id, image_url, first_name, last_name, username, email_addresses } = userData;

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses[0]?.email_address,
        username: username || null,
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url || '',
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ User updated in database: ${id}`);
    } else {
      console.log(`⚠️ User not found for update: ${id}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  try {
    const { id } = userData;

    const deletedUser = await User.findOneAndDelete({ clerkId: id });
    
    if (deletedUser) {
      console.log(`✅ User deleted from database: ${id}`);
    } else {
      console.log(`⚠️ User not found for deletion: ${id}`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
}

// ============================================================================
// STRIPE EVENT HANDLERS
// ============================================================================

async function handleCheckoutCompleted(session) {
  try {
    const { id, amount_total, metadata, customer_email } = session;

    // Create transaction record
    const transaction = new Transaction({
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || '',
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || '',
      createdAt: new Date(),
    });

    await transaction.save();

    // Update user credits
    if (metadata?.buyerId && metadata?.credits) {
      await User.findOneAndUpdate(
        { clerkId: metadata.buyerId },
        { 
          $inc: { creditBalance: Number(metadata.credits) },
          planId: Number(metadata.planId) || 1
        }
      );
      
      console.log(`✅ Added ${metadata.credits} credits to user ${metadata.buyerId}`);
    }

    console.log(`✅ Payment completed: ${id}`);
    
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
    // Add any additional logic for successful payments
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    console.log(`✅ Subscription created: ${subscription.id}`);
    // Add logic for handling new subscriptions if needed
    
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
    throw error;
  }
}

module.exports = router;