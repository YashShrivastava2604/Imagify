const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Transformation routes - these would handle the AI transformation logic
router.get('/types', (req, res) => {
  const transformationTypes = {
    restore: {
      type: 'restore',
      title: 'Restore Image',
      subTitle: 'Refine images by removing noise and imperfections',
      config: { restore: true },
      icon: 'image.svg',
    },
    removeBackground: {
      type: 'removeBackground',
      title: 'Background Remove',
      subTitle: 'Removes the background of the image using AI',
      config: { removeBackground: true },
      icon: 'camera.svg',
    },
    fill: {
      type: 'fill',
      title: 'Generative Fill',
      subTitle: 'Enhance an image\'s dimensions using AI outpainting',
      config: { fillBackground: true },
      icon: 'stars.svg',
    },
    remove: {
      type: 'remove',
      title: 'Object Remove',
      subTitle: 'Identify and eliminate objects from images',
      config: { remove: { prompt: '' }, removeShadow: true, multiple: true },
      icon: 'scan.svg',
    },
    recolor: {
      type: 'recolor',
      title: 'Object Recolor',
      subTitle: 'Identify and recolor objects from the image',
      config: { recolor: { prompt: '', to: '' }, multiple: true },
      icon: 'filter.svg',
    },
  };

  res.json(transformationTypes);
});

module.exports = router;