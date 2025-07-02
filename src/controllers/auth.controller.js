const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "secret";

// ------------------ Register Controller ------------------
exports.register = async (req, res) => {
  try {
    console.log("📥 Incoming register request:", req.body); // Add this

    const { username, email, password, role, number } = req.body;

    if (!username || !email || !password || !role || !number) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.SECRET_KEY || "secret", {
      expiresIn: "1h",
    });

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      number,
      role,
      token,
    });

    await newUser.save();
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("❌ Registration Error:", error); // log real error
    res.status(500).json({ error: error.message || "Registration failed" });
  }
};



// ------------------ Login Controller ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    user.token = token; // Update token in DB
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ------------------ Logout Controller ------------------

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

// ------------------ Get User Controller ------------------
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ Get All Users Controller ------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
     res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ Get User by ID Controller ------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ Update User Controller ------------------
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ Delete User Controller ------------------
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

