// const express = require('express');
// const multer = require('multer');
// const { requireAuth } = require('../middleware/auth');
// const { addImage, updateImage, deleteImage, getImageById, getAllImages, getUserImages } = require('../services/imageService');

// const router = express.Router();

// // Get all images
// router.get('/', async (req, res) => {
//   try {
//     const { page = 1, searchQuery = '' } = req.query;
//     const limit = 9;
//     const images = await getAllImages(limit, parseInt(page), searchQuery);
//     res.json(images);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get image by ID
// router.get('/:imageId', async (req, res) => {
//   try {
//     const { imageId } = req.params;
//     const image = await getImageById(imageId);
//     res.json(image);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get user images
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1 } = req.query;
//     const limit = 9;
//     const images = await getUserImages(limit, parseInt(page), userId);
//     res.json(images);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add image
// router.post('/', requireAuth, async (req, res) => {
//   try {
//     const { image, userId, path } = req.body;
//     const newImage = await addImage(image, userId, path);
//     res.json(newImage);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update image
// router.put('/:imageId', requireAuth, async (req, res) => {
//   try {
//     const { imageId } = req.params;
//     const { image, userId, path } = req.body;
//     const updatedImage = await updateImage({ ...image, id: imageId }, userId, path);
//     res.json(updatedImage);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete image
// router.delete('/:imageId', requireAuth, async (req, res) => {
//   try {
//     const { imageId } = req.params;
//     await deleteImage(imageId);
//     res.json({ message: 'Image deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { requireAuth } = require('../middleware/auth');
const { addImage, updateImage, deleteImage, getImageById, getAllImages, getUserImages } = require('../services/imageService');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload image to Cloudinary
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Uploading image to Cloudinary...');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'imaginify',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.public_id);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.json({
      publicId: result.public_id,
      secureURL: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const { page = 1, searchQuery = '' } = req.query;
    const limit = 9;
    const images = await getAllImages(limit, parseInt(page), searchQuery);
    res.json(images);
  } catch (error) {
    console.error('Get all images error:', error);
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
    console.error('Get image by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user images
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 9;
    console.log(`Fetching images for user: ${userId}`);
    const images = await getUserImages(limit, parseInt(page), userId);
    res.json(images);
  } catch (error) {
    console.error('Get user images error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add image
router.post('/', requireAuth, async (req, res) => {
  try {
    const { image, userId, path } = req.body;
    console.log('Adding image:', { userId, path });
    const newImage = await addImage(image, userId, path);
    res.json(newImage);
  } catch (error) {
    console.error('Add image error:', error);
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
    console.error('Update image error:', error);
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
    console.error('Delete image error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;