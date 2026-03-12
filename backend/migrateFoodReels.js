// Migration script for Food Reel feature
const mongoose = require('mongoose');
const Reel = require('./models/reel.model');
const ReelLike = require('./models/reelLike.model');
const ReelComment = require('./models/reelComment.model');
const ReelSave = require('./models/reelSave.model');

async function migrate() {
  try {
    // Ensure collections are created
    await Reel.init();
    await ReelLike.init();
    await ReelComment.init();
    await ReelSave.init();
    console.log('Food Reel collections created.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();