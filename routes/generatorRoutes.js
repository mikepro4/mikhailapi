const _ = require("lodash");
const mongoose = require("mongoose");
const Generators = mongoose.model("generator");
const Collections = mongoose.model("collection");
const NFTs = mongoose.model("NFT");
const request = require('request-promise');

module.exports = app => {


	app.post("/generators/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Generators.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Generators.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/generators/create", async (req, res) => {
		const generator = await new Generators(req.body).save();
		res.json(generator);
	});

	// ===========================================================================

	app.post("/generator/update", async (req, res) => {
		Generators.updateOne(
			{
				_id: req.body._id
			},
			{
				$set: req.body
			},
			async (err, info) => {

				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Generators.findOne({ _id: req.body._id }, async (err, generator) => {
						if (generator) {
							res.json({ success: "true", info: info, generator: generator });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/generators/delete", async (req, res) => {
		Generators.remove({ _id: req.body.generatorId }, async (err, info) => {
            if (err) res.status(400).send({ error: "true", error: err });
            if (info) {
                res.json({ success: "true", info: info });
            }
		});
	});

	// ===========================================================================

	app.post("/generators/item", async (req, res) => {
		Generators.findOne({ _id: req.body.generatorId }, async (err, generator) => {
			if (generator) {
				res.json(generator);
			}
		});
    });

    // ===========================================================================

	app.post("/generator/assign", async (req, res) => {
        Collections.updateOne(
			{
				_id: req.body.collectionId
			},
			{
				$set: {
                    "metadata.generatorId": req.body.generatorId
                }
			},
			async (err, info) => {

				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Collections.findOne({ _id: req.body.collectionId }, async (err, collection) => {
						if (collection) {
							res.json({ success: "true", info: info, collection: collection });
						}
					});
				}
			}
		);
    });

};

const buildQuery = criteria => {
	const query = {};

    if (criteria && criteria.generatorTitle) {
		_.assign(query, {
			title: {
				$regex: criteria.generatorTitle,
				$options: "i"
			}
		});
	}

    if (criteria && criteria.generatorId) {
		_.assign(query, {
			_id: {
				$eq: criteria.generatorId
			}
		});
	}

	return query
};
