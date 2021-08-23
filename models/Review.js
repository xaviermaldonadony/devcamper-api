const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a title for the reviw'],
		maxlegnth: 100,
	},

	text: {
		type: String,
		required: [true, 'Please add some text'],
	},

	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, 'Please add a rating between 1 and 10'],
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},

	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
});

// Only one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	// obj, returns the id of the bootcamp and average of the tuition
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			// The object we want to create
			$group: {
				_id: '$bootcamp',
				// The field we want to average is tuition
				averageRating: { $avg: '$rating' },
			},
		},
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: obj[0].averageRating,
		});
	} catch (err) {
		console.log(err);
	}
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
	// when on save we save the id of the bootcamp
	this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
