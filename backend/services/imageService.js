const Image = require('../models/Image');
const User = require('../models/User');
const connectToDatabase = require('../config/database');
const { handleError } = require('../utils/helpers');

const populateUser = (query) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
});

// ADD IMAGE
const addImage = async (image, userId, path) => {
  try {
    await connectToDatabase();

    const author = await User.findOne({ clerkId: userId });
    if (!author) {
      throw new Error('User not found');
    }

    console.log('Creating image with data:', { ...image, author: author._id });

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    await updateCredits(userId, image.creditFee || -1);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// UPDATE IMAGE  
const updateImage = async (image, userId, path) => {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image.id);
    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error('Unauthorized or image not found');
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// DELETE IMAGE
const deleteImage = async (imageId) => {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
    return { message: 'Image deleted successfully' };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// GET IMAGE BY ID
const getImageById = async (imageId) => {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error('Image not found');

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// GET ALL IMAGES
const getAllImages = async (limit = 9, page = 1, searchQuery = '') => {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const query = searchQuery
      ? {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { transformationType: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      : {};

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.countDocuments(query);

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// GET USER IMAGES
const getUserImages = async (limit = 9, page = 1, userId) => {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error('User not found');

    const images = await populateUser(Image.find({ author: user._id }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.countDocuments({ author: user._id });

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// UPDATE CREDITS
const updateCredits = async (userId, creditFee) => {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { clerkId: userId },
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
  addImage,
  updateImage,
  deleteImage,
  getImageById,
  getAllImages,
  getUserImages,
};