const _ = require("lodash");
const mongoose = require("mongoose");
const Shape = mongoose.model("shape");
const request = require('request-promise');

module.exports = app => {

	// ===========================================================================

	app.post("/shapes/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
		let adjustSortProperty 
		if (sortProperty == "createdAt") {
			adjustSortProperty = sortProperty
		} else {
			adjustSortProperty = "metadata." + sortProperty
		}
		const query = Shape.find(buildQuery(criteria))
			.sort({ [adjustSortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Shape.find(buildQuery(criteria)).countDocuments()]
		).then(
			results => {
				return res.json({
					all: results[0],
					count: results[1],
					offset: offset,
					limit: limit
				});
			}
		);
	});

	// ===========================================================================

	app.post("/shape/create", async (req, res) => {
		const Shape = await new Shape({
			createdAt: new Date(),
			metadata: req.body.metadata,
		}).save();
		res.json(Shape);
	});

	// ===========================================================================

	app.post("/shape/update", async (req, res) => {
		Shape.update(
			{
				_id: req.body.shapeId
			},
			{
				$set: { metadata: req.body.newShape }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Shape.findOne({ _id: req.body.shapeId }, async (err, Shape) => {
						if (Shape) {
							res.json({ success: "true", info: info, Shape: Shape });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/shape/delete", async (req, res) => {
		Shape.remove({ _id: req.body.shapeId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Shape"
			});
		});
	});

	// ===========================================================================

	app.post("/shape/details", async (req, res) => {
		Shape.findOne({ _id: req.body.shapeId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
	});

};

const buildQuery = criteria => {
	const query = {};

	if (criteria.createdBy) {
		_.assign(query, {
			"metadata.createdBy": {
				$regex: new RegExp(criteria.createdBy),
				$options: "i"
			}
		});
	}

	return query
};
