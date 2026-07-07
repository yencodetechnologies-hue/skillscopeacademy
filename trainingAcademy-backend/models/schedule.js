const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({

 sessionType:{
  type:String,
  enum:["General","Theory","Practical","Exam"],
  default:"General"
 },

 startTime:String,
 endTime:String,

 location:String,

  maxCapacity:Number,

  availableSlots:{
    type:Number,
    required:true
  },

enrolledStudents: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Student"
}],

 status:{
  type:String,
  enum:["Active","Inactive"],
  default:"Active"
 }

})


const scheduleSchema = new mongoose.Schema({

 course:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Course"
 },

 date:{
  type:Date,
  required:true
 },

 sessions:[sessionSchema]

},{timestamps:true})


module.exports = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);