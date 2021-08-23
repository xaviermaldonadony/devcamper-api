const express = require('express');
const router = express.Router({ mergeParams: true });
const {
	getReviews,
	getReview,
	addReview,
	updateReview,
	deleteReview,
} = require('../controllers/reviews');

const populate = {
	path: 'bootcamp',
	select: 'name description',
};
const Review = require('../models/Review');

const results = require('../middleware/results');
const { protect, authorize } = require('../middleware/auth');

router
	.route('/')
	.get(results(Review, populate), getReviews)
	.post(protect, authorize('user', 'admin'), addReview);
router
	.route('/:id')
	.get(getReview)
	.put(protect, authorize('user', 'admin'), updateReview)
	.delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
