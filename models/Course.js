const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'please add a course title'],
	},

	description: {
		type: String,
		required: [true, 'please add a description'],
	},

	weeks: {
		type: String,
		required: [true, 'please add number of weeks'],
	},

	tuition: {
		type: Number,
		required: [true, 'please add a tuition cost'],
	},

	minimumSkill: {
		type: String,
		required: [true, 'please add a minimum skill'],
		enum: ['beginner', 'intermediate', 'advanced'],
	},

	scholarshipAvailable: {
		type: Boolean,
		default: false,
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

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
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
				averageCost: { $avg: '$tuition' },
			},
		},
	]);
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
		});
	} catch (err) {
		console.log(err);
	}
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
	// when on save we save the id of the bootcamp
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
