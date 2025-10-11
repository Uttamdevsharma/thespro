const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', department: req.user.department }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all supervisors (optionally filtered by researchCellId)
// @route   GET /api/users/supervisors
// @access  Private
const getSupervisors = async (req, res) => {
  const { researchCellId } = req.query;
  try {
    let query = { role: 'supervisor', department: req.user.department };
    if (researchCellId) {
      query.researchCells = researchCellId;
    }
    const supervisors = await User.find(query).select('-password').populate('researchCells', 'title description');
    res.json(supervisors);
  } catch (error) {
    console.error('Error in getSupervisors:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new supervisor (by committee member)
// @route   POST /api/users/add-supervisor
// @access  Private (Committee)
const addSupervisor = async (req, res) => {
  const { name, email, password } = req.body;
  const committeeMember = await User.findById(req.user._id);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  try {
    const supervisor = await User.create({
      name,
      email,
      password,
      role: 'supervisor',
      department: committeeMember.department, // Assign committee member's department
      profilePicture: '',
      researchCells: [], // Initialize with empty array
    });

    res.status(201).json({
      _id: supervisor._id,
      name: supervisor.name,
      email: supervisor.email,
      role: supervisor.role,
      department: supervisor.department,
      profilePicture: supervisor.profilePicture,
      researchCells: supervisor.researchCells,
    });
  } catch (error) {
    console.error('Error in addSupervisor:', error);
    res.status(400).json({ message: 'Invalid supervisor data', error: error.message });
  }
};

// @desc    Assign a research cell to a supervisor
// @route   PUT /api/users/:id/assign-cell
// @access  Private (Committee)
const assignCellToSupervisor = async (req, res) => {
  const { id } = req.params;
  const { cellId } = req.body;

  console.log('Backend: Received assign cell request for supervisor ID:', id, 'with cell ID:', cellId);

  try {
    const supervisor = await User.findById(id);

    if (!supervisor) {
      console.log('Backend: Supervisor not found for ID:', id);
      res.status(404).json({ message: 'Supervisor not found' });
      return;
    }

    if (supervisor.role !== 'supervisor') {
      console.log('Backend: User is not a supervisor for ID:', id);
      res.status(400).json({ message: 'User is not a supervisor' });
      return;
    }

    // Ensure researchCells is an array
    if (!supervisor.researchCells) {
      supervisor.researchCells = [];
    }
    console.log('Backend: Supervisor researchCells before push:', supervisor.researchCells);

    if (!supervisor.researchCells.includes(cellId)) {
      supervisor.researchCells.push(cellId);
      await supervisor.save();
      console.log('Backend: Cell assigned successfully to supervisor:', id, '. New researchCells:', supervisor.researchCells);
    } else {
      console.log('Backend: Supervisor already assigned to cell:', cellId);
    }

    res.json({ message: 'Cell assigned successfully', supervisor });
  } catch (error) {
    console.error('Backend: Error assigning cell:', error);
    res.status(400).json({ message: 'Failed to assign cell', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id).select('-password').populate('researchCells', 'title description');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      profilePicture: user.profilePicture,
      researchCells: user.researchCells, // Include populated research cells
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // Email is not updated via this route
    // studentId is not updated via this route

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      studentId: updatedUser.studentId,
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword; // The pre-save hook in User model will hash this
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Current password incorrect' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  if (req.file) {
    const user = await User.findById(req.user._id);

    if (user) {
      user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      await user.save();
      res.json({ message: 'Profile picture uploaded successfully', profilePicture: user.profilePicture });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
};

// @desc    Get all users
// @route   GET /api/users/all
// @access  Private (Supervisor, Committee)
const getAllUsers = async (req, res) => {
  const { department } = req.query;
  let filter = {};
  if (department) {
    filter.department = department;
  }

  try {
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all committee members
// @route   GET /api/users/committee-members
// @access  Private (Committee)
const getCommitteeMembers = async (req, res) => {
  try {
    const committeeMembers = await User.find({ role: 'committee', department: req.user.department }).select('-password');
    res.json(committeeMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, getSupervisors, addSupervisor, assignCellToSupervisor, getUserProfile, updateUserProfile, updatePassword, uploadProfilePicture, getAllUsers, getCommitteeMembers };