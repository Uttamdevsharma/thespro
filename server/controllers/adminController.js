import User from '../models/User.js';
import Department from '../models/Department.js';
import CommitteeMember from '../models/CommitteeMember.js';
import asyncHandler from 'express-async-handler';

// --- Department Management ---

// @desc    Create a department
// @route   POST /api/admin/departments
// @access  Private (Admin)
export const createDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const departmentExists = await Department.findOne({ name });
    if (departmentExists) {
        res.status(400);
        throw new Error('Department already exists');
    }
    const department = await Department.create({ name });
    res.status(201).json(department);
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin, Student Registration)
export const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json(departments);
});

// @desc    Update a department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin)
export const updateDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (department) {
        department.name = req.body.name || department.name;
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } else {
        res.status(404);
        throw new Error('Department not found');
    }
});

// @desc    Delete a department
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin)
export const deleteDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (department) {
        // Check if users are assigned to this department
        const usersInDept = await User.countDocuments({ department: department._id });
        if (usersInDept > 0) {
            res.status(400);
            throw new Error('Cannot delete department with assigned users');
        }
        await department.deleteOne();
        res.json({ message: 'Department removed' });
    } else {
        res.status(404);
        throw new Error('Department not found');
    }
});

// --- Teacher Management ---

// @desc    Create a teacher (Supervisor)
// @route   POST /api/admin/teachers
// @access  Private (Admin)
export const createTeacher = asyncHandler(async (req, res) => {
    const { name, email, password, departmentId } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const teacher = await User.create({
        name,
        email,
        password,
        role: 'supervisor',
        department: departmentId,
    });
    res.status(201).json(teacher);
});

// @desc    Get teachers by department (Supervisors + Committee Members)
// @route   GET /api/admin/teachers
// @access  Private (Admin)
export const getTeachers = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    // Committee members are also teachers/supervisors
    let query = { role: { $in: ['supervisor', 'committee'] } };
    if (departmentId) {
        query.department = departmentId;
    }
    const teachers = await User.find(query).populate('department', 'name').select('-password');
    res.json(teachers);
});

// @desc    Update a teacher
// @route   PUT /api/admin/teachers/:id
// @access  Private (Admin)
export const updateTeacher = asyncHandler(async (req, res) => {
    const teacher = await User.findById(req.params.id);
    if (teacher && teacher.role === 'supervisor') {
        teacher.name = req.body.name || teacher.name;
        teacher.email = req.body.email || teacher.email;
        if (req.body.departmentId) {
            teacher.department = req.body.departmentId;
        }
        if (req.body.password) {
            teacher.password = req.body.password;
        }
        const updatedTeacher = await teacher.save();
        res.json(updatedTeacher);
    } else {
        res.status(404);
        throw new Error('Teacher not found');
    }
});

// @desc    Delete a teacher
// @route   DELETE /api/admin/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = asyncHandler(async (req, res) => {
    const teacher = await User.findById(req.params.id);
    if (teacher && teacher.role === 'supervisor') {
        await teacher.deleteOne();
        res.json({ message: 'Teacher removed' });
    } else {
        res.status(404);
        throw new Error('Teacher not found');
    }
});

// --- Student Management ---

// @desc    Get all students (with department filter)
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getStudents = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    let query = { role: 'student' };
    if (departmentId) {
        query.department = departmentId;
    }
    const students = await User.find(query).populate('department', 'name').select('-password');
    res.json(students);
});

// --- Committee Assignment ---

// @desc    Assign a teacher as a committee member for a department
// @route   POST /api/admin/assign-committee
// @access  Private (Admin)
export const assignCommitteeMember = asyncHandler(async (req, res) => {
    const { userId, departmentId } = req.body;
    
    // Check if user is a supervisor or already a committee member
    const user = await User.findById(userId);
    if (!user || (user.role !== 'supervisor' && user.role !== 'committee')) {
        res.status(400);
        throw new Error('User must be a teacher (supervisor or committee) to be assigned to a committee');
    }

    // Check if assignment already exists
    const existing = await CommitteeMember.findOne({ userId, departmentId });
    if (existing) {
        res.status(400);
        throw new Error('User is already in the committee for this department');
    }

    const assignment = await CommitteeMember.create({ userId, departmentId });
    
    // Auto-update user role to committee to enable dashboard access
    if (user.role === 'supervisor') {
        user.role = 'committee';
        await user.save();
    }
    
    res.status(201).json(assignment);
});

// @desc    Get committee members by department
// @route   GET /api/admin/committee-members
// @access  Private (Admin)
export const getCommitteeAssignments = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    let query = {};
    if (departmentId) {
        query.departmentId = departmentId;
    }
    const assignments = await CommitteeMember.find(query)
        .populate('userId', 'name email')
        .populate('departmentId', 'name');
    res.json(assignments);
});

// @desc    Remove committee assignment
// @route   DELETE /api/admin/committee-members/:id
// @access  Private (Admin)
export const removeCommitteeAssignment = asyncHandler(async (req, res) => {
    const assignment = await CommitteeMember.findById(req.params.id);
    if (assignment) {
        const userId = assignment.userId;
        await assignment.deleteOne();

        // After removal, check if user still has other committee assignments
        const remaining = await CommitteeMember.countDocuments({ userId });
        if (remaining === 0) {
            const user = await User.findById(userId);
            if (user && user.role === 'committee') {
                user.role = 'supervisor';
                await user.save();
            }
        }

        res.json({ message: 'Committee assignment removed' });
    } else {
        res.status(404);
        throw new Error('Assignment not found');
    }
});

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = asyncHandler(async (req, res) => {
    const deptCount = await Department.countDocuments({});
    const teacherCount = await User.countDocuments({ role: 'supervisor' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const committeeCount = await CommitteeMember.countDocuments({});
    
    res.json({
        deptCount,
        teacherCount,
        studentCount,
        committeeCount
    });
});
