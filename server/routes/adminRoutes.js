import express from 'express';
import { 
    createDepartment, 
    getDepartments, 
    updateDepartment, 
    deleteDepartment,
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher,
    getStudents,
    assignCommitteeMember,
    getCommitteeAssignments,
    removeCommitteeAssignment,
    getAdminStats
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registration needs to fetch departments publicly
router.get('/departments/public', getDepartments);

// All other routes here are protected and require ADMIN role
router.use(protect);

// Restricted to Admin
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);

router.route('/departments')
    .post(createDepartment)
    .get(getDepartments);

router.route('/departments/:id')
    .put(updateDepartment)
    .delete(deleteDepartment);

router.route('/teachers')
    .post(createTeacher)
    .get(getTeachers);

router.route('/teachers/:id')
    .put(updateTeacher)
    .delete(deleteTeacher);

router.get('/students', getStudents);

router.route('/committee')
    .post(assignCommitteeMember)
    .get(getCommitteeAssignments);

router.delete('/committee/:id', removeCommitteeAssignment);

export default router;
