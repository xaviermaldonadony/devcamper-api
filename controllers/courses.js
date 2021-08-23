const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access public
exports.getCourses = asyncHandler(async (req, res, next) => {
	const { bootcampId } = req.params;

	if (bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });
		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.results);
	}
});

// @desc Get single course
// @route GET /api/v1/courses/:id
// @access public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	const course = await Course.findById(id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!course) {
		return next(new ErrorResponse(`No course with the id of ${id}`), 404);
	}

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc Add a courses
// @route POST /api/v1/bootcamps/:bootcampId/
// @access private
exports.addCourse = asyncHandler(async (req, res, next) => {
	const { bootcampId } = req.params;
	req.body.bootcamp = bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp with the id of ${bootcampId}`),
			404
		);
	}

	// Verify user is bootcamp owner, or admin
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to add a courses to ${bootcamp.id}.`,
				401
			)
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc Update course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	let course = await Course.findById(id);

	if (!course) {
		return next(new ErrorResponse(`No course with the id of ${id}`), 404);
	}
	// Verify user is course owner, or admin
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update course  ${course.id}.`,
				401
			)
		);
	}

	course = await Course.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc delete course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const course = await Course.findById(id);

	if (!course) {
		return next(new ErrorResponse(`No course with the id of ${id}`), 404);
	}
	// Verify user is course owner, or admin
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to delete course  ${course.id}.`,
				401
			)
		);
	}

	await course.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
