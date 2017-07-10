'use strict';

import mongoose from 'mongoose';

var ThingSchema = new mongoose.Schema({
  active: Boolean,
  playerid: String, 
  posSelect: Object, 
  posEnd: Object, 
  range: Number, 
  fillamount: Number, 
  deltaX: Number, 
  deltaY: Number, 
  resX: Number, 
  resY: Number,
  size: Number,
  color: String
});

export default mongoose.model('Thing', ThingSchema);
