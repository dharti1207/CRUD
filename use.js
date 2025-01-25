const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Define User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// JWT Secret Key
const JWT_SECRET = "your_jwt_secret_key"; // Change this to a secret key

// Register Route (POST /register)
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ username });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  // Hash the password before saving it
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});

// Login Route (POST /login)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ message: "Login successful", token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Protected Route (GET /protected)
app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({
    message: "You have access to this protected route",
    userId: req.user.userId,
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
