import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  console.log('registerUser called with body:', req.body);
  const { name, email, password, role, studentId, profilePicture, department, currentCGPA } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    studentId,
    profilePicture,
    department,
    currentCGPA
  });

  console.log('user created:', user);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      profilePicture: user.profilePicture,
      department: user.department,
      currentCGPA: user.currentCGPA,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  const user = await User.findOne({ email });
  console.log('User found:', user);
  
  if (user && (await user.matchPassword(password))) {
    console.log('Password matched for user:', user.email);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      profilePicture: user.profilePicture,
      department: user.department || '',
      currentCGPA: user.currentCGPA,
      token: generateToken(user._id),
      currentGroupCount: user.currentGroupCount,
    });
  } else {
    console.log('Invalid email or password for email:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser };
