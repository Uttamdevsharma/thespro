import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student', department: req.user.department }).select('-password');
  res.json(students);
});

// @desc    Get all supervisors (optionally filtered by researchCellId)
// @route   GET /api/users/supervisors
// @access  Private
const getSupervisors = asyncHandler(async (req, res) => {
  const { researchCellId } = req.query;
  let query = { role: 'supervisor', department: req.user.department };
  if (researchCellId) {
    query.researchCells = researchCellId;
  }
  const supervisors = await User.find(query).select('-password').populate('researchCells', 'title description');
  res.json(supervisors);
});

// @desc    Add a new supervisor (by committee member)
// @route   POST /api/users/add-supervisor
// @access  Private (Committee)
const addSupervisor = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const committeeMember = await User.findById(req.user._id);

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const supervisor = await User.create({
    name,
    email,
    password,
    role: 'supervisor',
    department: committeeMember.department,
    profilePicture: '',
    researchCells: [],
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
});

// @desc    Assign research cells to a supervisor
// @route   PUT /api/users/:id/assign-cell
// @access  Private (Committee)
const assignCellToSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cellIds } = req.body; // Expect an array of cell IDs

  const supervisor = await User.findById(id);

  if (!supervisor) {
    res.status(404);
    throw new Error('Supervisor not found');
  }

  if (supervisor.role !== 'supervisor') {
    res.status(400);
    throw new Error('User is not a supervisor');
  }

  if (!supervisor.researchCells) {
    supervisor.researchCells = [];
  }

  // Add new cells, ensuring no duplicates
  cellIds.forEach(cellId => {
    if (!supervisor.researchCells.includes(cellId)) {
      supervisor.researchCells.push(cellId);
    }
  });

  await supervisor.save();

  res.json({ message: 'Cells assigned successfully', supervisor });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('researchCells', 'title description');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      profilePicture: user.profilePicture,
      researchCells: user.researchCells,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;

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
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401);
      throw new Error('Current password incorrect');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (req.file) {
    const user = await User.findById(req.user._id);

    if (user) {
      user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      await user.save();
      res.json({ message: 'Profile picture uploaded successfully', profilePicture: user.profilePicture });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } else {
    res.status(400);
    throw new Error('No file uploaded');
  }
});

// @desc    Get all users
// @route   GET /api/users/all
// @access  Private (Supervisor, Committee)
const getAllUsers = asyncHandler(async (req, res) => {
  const { department } = req.query;
  let filter = {};
  if (department) {
    filter.department = department;
  }

  const users = await User.find(filter).select('-password');
  res.json(users);
});

// @desc    Get all committee members
// @route   GET /api/users/committee-members
// @access  Private (Committee)
const getCommitteeMembers = asyncHandler(async (req, res) => {
  const committeeMembers = await User.find({ role: 'committee', department: req.user.department }).select('-password');
  res.json(committeeMembers);
});

// @desc    Get all supervisors with their course supervisor status and main supervisor
// @route   GET /api/users/supervisors/all
// @access  Private (Committee)
const getAllSupervisors = asyncHandler(async (req, res) => {
  const supervisors = await User.find({ role: 'supervisor' })
    .select('-password')
    .populate('mainSupervisor', 'name');
  res.json(supervisors);
});

// @desc    Assign/Edit/Delete course supervisor mappings
// @route   PUT /api/users/supervisors/:id/assign-course-supervisor
// @access  Private (Committee)
const assignCourseSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isCourseSupervisor, mainSupervisor: newMainSupervisorId } = req.body;

  const courseSupervisor = await User.findById(id);

  if (!courseSupervisor) {
    res.status(404);
    throw new Error('Supervisor not found');
  }

  courseSupervisor.isCourseSupervisor = isCourseSupervisor;
  courseSupervisor.mainSupervisor = isCourseSupervisor ? newMainSupervisorId : null;

  await courseSupervisor.save();

  res.json(courseSupervisor);
});

// @desc    Get all supervisors with their remaining seat capacity
// @route   GET /api/users/supervisors/capacity
// @access  Private (Student)
const getSupervisorsWithCapacity = asyncHandler(async (req, res) => {
  const { researchCellId } = req.query;
  let query = { role: 'supervisor' };
  if (researchCellId) {
    query.researchCells = researchCellId;
  }

  const supervisors = await User.find(query)
    .select('-password')
    .populate('mainSupervisor', 'name');

  const supervisorsWithCapacity = await Promise.all(supervisors.map(async (s) => {
    const courseSupervisors = await User.find({ mainSupervisor: s._id, isCourseSupervisor: true });
    const maxGroupCapacity = 5 + (courseSupervisors.length * 10);

    return {
      _id: s._id,
      name: s.name,
      email: s.email,
      department: s.department,
      isCourseSupervisor: s.isCourseSupervisor,
      mainSupervisor: s.mainSupervisor,
      maxGroupCapacity: maxGroupCapacity,
      currentGroupCount: s.currentGroupCount,
      remainingCapacity: maxGroupCapacity - s.currentGroupCount,
    };
  }));

  res.json(supervisorsWithCapacity);
});

// @desc    Remove a research cell from a supervisor
// @route   PUT /api/users/:id/remove-cell
// @access  Private (Committee)
const removeCellFromSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cellId } = req.body;

  const supervisor = await User.findById(id);

  if (!supervisor) {
    res.status(404);
    throw new Error('Supervisor not found');
  }

  if (supervisor.role !== 'supervisor') {
    res.status(400);
    throw new Error('User is not a supervisor');
  }

  if (supervisor.researchCells) {
    supervisor.researchCells = supervisor.researchCells.filter(
      (cell) => cell.toString() !== cellId
    );
    await supervisor.save();
  }

  res.json({ message: 'Cell removed successfully', supervisor });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Committee)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('researchCells', 'title');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getStudents, getSupervisors, addSupervisor, assignCellToSupervisor, getUserProfile, updateUserProfile, updatePassword, uploadProfilePicture, getAllUsers, getCommitteeMembers, getAllSupervisors, assignCourseSupervisor, getSupervisorsWithCapacity, getUserById, removeCellFromSupervisor };