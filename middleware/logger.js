// middleware is a function that has access to the req response cycle and runs during that
// cycle. set a value on the req object. We can access them in any routes that come after
// the middleware
// @desc Logs request to console
const logger = (req, res, next) => {
	console.log(
		`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
	);
	// call it to move on to the next middleware in the cycle
	next();
};

module.exports = logger;
