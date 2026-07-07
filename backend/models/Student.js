const mongoose = require( "mongoose");

const studentSchema = new mongoose.Schema({

  name:String,

  email:{
    type:String,
    unique:true
  },

  phone:String,

  role:{
    type:String,
    enum:["Student"]
  }

},{timestamps:true})

module.exports = mongoose.model("Student",studentSchema)  