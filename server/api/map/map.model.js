'use strict';

import mongoose from 'mongoose';

var MapSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  players: [{playerid: String, amount: Number, color: String}],
  //parameters for map requests
  resX: Number,
  resY: Number,
  deltaX: Number,
  deltaY: Number,
  playerid: String
});

export default mongoose.model('Map', MapSchema);
