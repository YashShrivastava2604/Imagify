const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { addImage, updateImage, deleteImage, getImageById, getAllImages, getUserImages } = require('../services/imageService');

const router = express.Router();

// Get all images
router.get('/', async (req, res) => {
  try {
    const { page = 1, searchQuery = '' } = req.query;
    const limit = 9;
    const images = await getAllImages(limit, parseInt(page), searchQuery);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get image by ID
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await getImageById(imageId);
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user images
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 9;
    const images = await getUserImages(limit, parseInt(page), userId);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add image
router.post('/', requireAuth, async (req, res) => {
  try {
    const { image, userId, path } = req.body;
    const newImage = await addImage(image, userId, path);
    res.json(newImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update image
router.put('/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { image, userId, path } = req.body;
    const updatedImage = await updateImage({ ...image, id: imageId }, userId, path);
    res.json(updatedImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete image
router.delete('/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    await deleteImage(imageId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;