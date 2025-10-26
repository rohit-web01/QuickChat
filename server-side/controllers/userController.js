import User from "../models/User.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


// Sign Up a new user
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1️⃣ Check required fields
    if (!fullName || !email || !password ) {
      return res.json({
        success: false,
        message: "Missing details",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Account already exists",
      });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio : "Hey there I am using QuickChat !!",
    });

    // 5️⃣ Generate token
    const token = generateToken(newUser._id);

    // 6️⃣ Return response
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};



// Controller for login a user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            res.json({
                success : false,
                message : "wrong password or email."
            })
        }

        const token = generateToken(userData._id);

        res.json({
            success : true,
            userData,
            token,
            message : "Login  successfully."
        })
    } catch (error) {
        console.log(error.message);
            res.json({
            success : false,
            message : error.message
        })
    }
}


// controller to check if user is authenticate
export const checkAuth = (req, res) => {
    res.json({
        success : true,
        user : req.user
    });
}


// controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new : true});
            return res.json({ success: true, user: updatedUser });
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic : upload.secure_url, bio, fullName}, {new : true});

            res.json({
                success : true,
                user : updatedUser
            })
        }

    } catch (error) {
        console.log(error.message);
        res.json({
            success : false,
            message : error.message
        });
    }
}