const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const Error = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	const { authorization } = req.headers;

	if (authorization && authorization.startsWith('Bearer')) {
		token = authorization.split(' ')[1];
	}
	// else if(req.cookies.token)	{
	// 	token = req.cookies.token;
	// }

	// make sure token exists
	if (!token) {
		return next(new Error('Not authorize to acces  this route', 401));
	}

	try {
		// verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);
		req.user = await User.findById(decoded.id);

		next();
	} catch (err) {
		return next(new Error('Not authorize to acces  this route', 401));
	}
});

// Grant access to specific roles
exports.authorize =
	(...roles) =>
	(req, res, next) => {
		// if no role throw error
		if (!roles.includes(req.user.role)) {
			return next(
				new Error(
					`User role ${req.user.role} is not authorized access this route`,
					403
				)
			);
		}
		next();
	};
