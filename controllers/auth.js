const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc  Register user
// @route POST /api/v1/auth/register
// @access public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		role,
	});
	// send a cookie with a token
	sendTokenResponse(user, 200, res);
});

// @desc  Login user
// @route POST /api/v1/auth/login
// @access public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email and password
	if (!email && !password) {
		return next(new ErrorResponse('Please provide an email and password', 400));
	}

	// check for user
	// include password in result
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	// check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	// send a cookie with a token
	sendTokenResponse(user, 200, res);
});

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		succes: true,
		data: user,
	});
});

// @desc Log user out / clear cookie
// @route GET /api/v1/auth/
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
	console.log('logout');
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 1 * 1000),
		httpOnly: true,
	});
	res.status(200).json({
		succes: true,
		data: {},
	});
});

// @desc Update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};
	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		succes: true,
		data: user,
	});
});

// @desc Update password
// @route POST /api/v1/auth/me
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// check current password
	// matchpassword is async
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});
// @desc Forgot Password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email.', 404));
	}

	// get reset token
	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requeste the reset of a password.To reset your password plese click this link: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});
		res.status(200).json({
			succes: true,
			data: 'Email sent',
		});
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });
		return next(new ErrorResponse('Email could not be sent', 500));
	}
});

// @desc Reset password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	console.log('reset password');
	// get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('Invalid token.'));
	}

	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
});

// helper function
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// create token
	const token = user.getSignedJwtToken();
	const expDate =
		Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000;

	const options = {
		expires: new Date(expDate),
		// cookie can only be acceses by the client side script
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		succes: true,
		token,
	});
};
