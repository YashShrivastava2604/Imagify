const User = require('../models/User');
const Image = require('../models/Image');
const cloudinary = require('../config/cloudinary');
const connectToDatabase = require('../config/database');
const { handleError } = require('../utils/helpers');

const populateUser = (query) => {
  return query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName clerkId'
  });
};

// ADD IMAGE
const addImage = async (image, userId, path) => {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);
    if (!author) {
      throw new Error('User not found');
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
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
  }
};

// DELETE IMAGE
const deleteImage = async (imageId) => {
  try {
    await connectToDatabase();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  }
};

// GET IMAGE
const getImageById = async (imageId) => {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error('Image not found');

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
};

// GET IMAGES
const getAllImages = async (limit = 9, page = 1, searchQuery = '') => {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = 'folder:imaginify';

    if (searchQuery) {
      expression = `${expression} AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
};

// GET IMAGES BY USER
const getUserImages = async (limit = 9, page = 1, userId) => {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
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