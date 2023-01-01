const mongoose = require("mongoose");
const {ObjectId}=mongoose.Schema.Types;
const artwork = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  category:{
    type:String,
    required:true
  },
  year: {
    type: String,
    required: true,
  },
  medium: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  likes:[{type:ObjectId,ref:"User"}],
  Reviews:[{
    text:String,
    postedBy:[{type:ObjectId,ref:"User"}],
    name:String
  }],
  postBy:{
    type:ObjectId,
    ref:"User"
  }
});
mongoose.model("ArtWork", artwork);