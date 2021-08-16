const Course = require('../models/Course');
const results = require('../middleware/results');
const express = require('express');
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require('../controllers/courses');
const populate = {
	path: 'bootcamp',
	select: 'name description',
};

const router = express.Router({ mergeParams: true });

router.route('/').get(results(Course, populate), getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
