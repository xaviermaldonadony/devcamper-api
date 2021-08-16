// desc filters, populates and pagination for any modle during req
const results = (model, populate) => async (req, res, next) => {
	let query;
	let { select, sort, page = 1, limit = 25 } = req.query;
	const pagination = {};
	// convert to int
	page = parseInt(page);
	limit = parseInt(limit);
	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ['select', 'sort', 'field', 'page', 'limit'];

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $gte, etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = model.find(JSON.parse(queryStr));

	// filtering
	// Select fields
	if (select) {
		const fields = req.query.select?.split(',').join(' ');
		query = query.select(fields);
	}

	// Sort,
	sort ? (sort = req.query.sort.split(',').join(' ')) : (sort = 'name');
	query = query.sort(sort);

	// pagination
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	// Execute query
	const results = await query;

	// Pagination result
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.results = {
		succes: true,
		count: results.length,
		pagination,
		data: results,
	};
	next();
};

module.exports = results;
