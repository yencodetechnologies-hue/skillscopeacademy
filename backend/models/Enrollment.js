const  mongoose =require("mongoose");

const enrollmentSchema = new mongoose.Schema({

  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student"
  },

  course:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course"
  },

  status:{
    type:String,
    enum:["Enrolled","Completed","Cancelled"],
    default:"Enrolled"
  }

},{timestamps:true})

module.exports = mongoose.model("Enrollment",enrollmentSchema)  