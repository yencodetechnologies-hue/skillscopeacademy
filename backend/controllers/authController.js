const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

exports.registerUser = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body)

    const { name, email, password, role } = req.body

    console.log("ROLE RECEIVED:", role)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    console.log("USER AFTER SAVE:", user)

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user,
    })
  } catch (error) {
    console.log(error)
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}  


exports.finduser=async(req,res)=>{
  try {

    const finduser=await User.find({role:"user"});

    console.log("userss",finduser);
    

    if(!finduser){
      return res.json({status:false,message:"Data not Found"})
    }else{
      return res.json({status:true,message:"Data Found SuccessFully",data:finduser})
    }
    
  } catch (error) {
    console.log("getusererrorr",error);
    
return res.json({status:false,message:error})
  }
}