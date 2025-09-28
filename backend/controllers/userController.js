const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const userModel = require("../models/userModel");

//create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // console.log("-------1--------");
  try {
    const user = await userModel.findOne({ email });

    // console.log("-------2--------");
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("-------3--------");
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    // console.log("-------4--------");
    let name = user.name;
    const token = createToken(user._id);
    // console.log("-------5--------");

    res.json({ success: true, token, name, role: user.role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const role = "user";

  // console.log("-------1--------");
  try {
    //check if user already exists
    // console.log("-------2--------");
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    // console.log("-------3--------");
    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    // console.log("-------4--------");
    if (password.length < 3) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // console.log("-------5--------");
    // Validate role
    const validRoles = ["user", "admin", "restaurateur"];
    if (!validRoles.includes(role)) {
      return res.json({
        success: false,
        message: "Invalid role. Must be user, admin, or restaurateur",
      });
    }

    // console.log("-------6--------");
    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // console.log("-------7--------");
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Exclude password from the response
    const users = await userModel.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving user" });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "admin", "restaurateur"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Role must be one of: user, admin, restaurateur",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      userId: id,
      role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user role" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Get the current user's profile
const getProfile = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving profile" });
  }
};

// Update user profile (name, email - not password)
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (name) updates.name = name;
    if (email) {
      // Check if email is valid
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Please enter a valid email" });
      }

      // Check if email is already in use by another user
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }

      updates.email = email;
    }

    const user = await userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await userModel.findById(userId);

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error changing password" });
  }
};

// @desc   Load initial user data
// @route  POST /api/users/seed
// @access Private (Admin)
const seedUsers = async (req, res) => {
  try {
    // Import user data from data file
    const { users } = require("../data/users.js");

    console.log(`Starting to seed ${users.length} users...`);

    // Delete existing users first
    await userModel.deleteMany({});
    console.log("Cleared existing users");

    // Clean user data - remove any restaurant references that don't exist yet
    const cleanUsers = users.map(user => {
      const { restaurantId, ...userWithoutRestaurantId } = user;
      return userWithoutRestaurantId;
    });

    // Insert users
    const seededUsers = await userModel.insertMany(cleanUsers);
    console.log(`Successfully seeded ${seededUsers.length} users`);

    // Remove password from response
    const usersResponse = seededUsers.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      message: "Users seeded successfully",
      count: seededUsers.length,
      data: usersResponse,
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while seeding users",
      error: error.message,
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  seedUsers,
};
