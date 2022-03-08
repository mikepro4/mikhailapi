const _ = require("lodash");
const mongoose = require("mongoose");
const Collections = mongoose.model("collection");
const NFTs = mongoose.model("NFT");
const request = require('request-promise');

module.exports = app => {

    app.post("/collection/getStats", async (req, res) => {

		const approved = NFTs.find({ 
            "metadata.collectionId": req.body.collectionId,
            "metadata.approved": true
        }).countDocuments()

        const all = NFTs.find({ 
            "metadata.collectionId": req.body.collectionId,
        }).countDocuments()


		return Promise.all(
			[approved, all]
		).then(
			results => {
				return res.json({
					approved: results[0],
					all: results[1]
				});
			}
		);
	});

	// ===========================================================================

	app.post("/collections/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
		let adjustSortProperty = "metadata." + sortProperty
        
		const query = Collections.find(buildQuery(criteria))
			.sort({ [adjustSortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Collections.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/collections/create", async (req, res) => {
		const Collection = await new Collections({
            metadata: req.body.metadata,
		}).save();
		res.json(Collection);
	});

	// ===========================================================================

	app.post("/collection/update", async (req, res) => {
        console.log(req.body.metadata)
		Collections.updateOne(
			{
				_id: req.body.collectionId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Collections.findOne({ _id: req.body.collectionId }, async (err, Collection) => {
						if (Collection) {
							res.json({ success: "true", info: info, Collection: Collection });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/collections/delete", async (req, res) => {
		Collections.remove({ _id: req.body.collectionId }, async (err) => {
			if (err) return res.send(err);

            NFTs.updateMany(
                {
                    "metadata.collectionId": req.body.collectionId
                },
                {
                    $set: {
                        "metadata.collectionId": "",
                    }
                },
                async (err, info) => {
                    if (err) res.status(400).send({ error: "true", error: err });
                    if (info) {
                        res.json({ success: "true", info: info });
                    }
                }
            );
			
		});
	});

	// ===========================================================================

	app.post("/collections/item", async (req, res) => {
		Collections.findOne({ _id: req.body.collectionId }, async (err, Collection) => {
			if (Collection) {
				res.json(Collection);
			}
		});
    });

};

const buildQuery = criteria => {
	const query = {};

 

	return query
};
