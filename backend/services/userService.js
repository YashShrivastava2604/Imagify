const User = require('../models/User');
const connectToDatabase = require('../config/database');
const { handleError } = require('../utils/helpers');

// CREATE
const createUser = async (user) => {
  console.log('🔧 ========== USER SERVICE CREATE START ==========');
  console.log('📋 User data received:', JSON.stringify(user, null, 2));
  
  try {
    await connectToDatabase();
    console.log('✅ Database connection established');
    
    console.log('📝 Attempting User.create...');
    const newUser = await User.create(user);
    console.log('✅ User.create successful:', newUser._id);
    
    const result = JSON.parse(JSON.stringify(newUser));
    console.log('✅ User service create completed');
    console.log('🔧 ========== USER SERVICE CREATE END ==========');
    return result;
  } catch (error) {
    console.error('❌ ========== USER SERVICE ERROR ==========');
    console.error('❌ User service error:', error.message);
    console.error('❌ Error details:', error);
    console.log('❌ ========== USER SERVICE ERROR END ==========');
    handleError(error);
    throw error;
  }
};

// READ
const getUserById = async (userId) => {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error('User not found');
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// UPDATE
const updateUser = async (clerkId, user) => {
  try {
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// DELETE
const deleteUser = async (clerkId) => {
  try {
    await connectToDatabase();
    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// USE CREDITS - **FIXED TO USE clerkId INSTEAD OF _id**
const updateCredits = async (clerkId, creditFee) => {
  try {
    await connectToDatabase();
    const updatedUserCredits = await User.findOneAndUpdate(
      { clerkId: clerkId }, // CHANGED: Use clerkId instead of _id
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUserCredits) throw new Error('User credits update failed');
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateCredits,
};