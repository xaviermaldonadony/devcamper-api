const express = require('express');
const router = express.Router();
const {
	getUser,
	getUsers,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/users');
const User = require('../models/User');

const results = require('../middleware/results');
const { protect, authorize } = require('../middleware/auth');

// anything below will use the middleware
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(results(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
