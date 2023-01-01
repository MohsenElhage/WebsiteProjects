const mongoose = require("mongoose");
const {ObjectId}=mongoose.Schema.Types
const user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  followers:[{
    type:ObjectId,ref:"User"
}],
following:[{
    type:ObjectId,ref:"User"
}]
});
mongoose.model("User", user);
