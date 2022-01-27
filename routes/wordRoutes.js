const _ = require("lodash");
const mongoose = require("mongoose");
const Words = mongoose.model("word");
const request = require('request-promise');

module.exports = app => {

	// ===========================================================================

	app.post("/words/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
		let adjustSortProperty 
		if (sortProperty == "createdAt") {
			adjustSortProperty = "metadata." + sortProperty
		} else {
			adjustSortProperty =  sortProperty
		}
		const query = Words.find(buildQuery(criteria))
			.sort({ [adjustSortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Words.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/words/create", async (req, res) => {
		const Word = await new Words({
			createdAt: new Date(),
            metadata: req.body.metadata,
            defaultViz: req.body.defaultViz
		}).save();
		res.json(Word);
	});

	// ===========================================================================

	app.post("/word/update", async (req, res) => {
        console.log(req.body.blocks)
		Words.updateOne(
			{
				_id: req.body.wordId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Words.findOne({ _id: req.body.wordId }, async (err, Word) => {
						if (Word) {
							res.json({ success: "true", info: info, Word: Word });
						}
					});
				}
			}
		);
	});

    app.post("/word/updateBlocks", async (req, res) => {
        console.log(req.body.blocks)
		Words.updateOne(
			{
				_id: req.body.wordId
			},
			{
				$set: { 
                    blocks: req.body.blocks
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Words.findOne({ _id: req.body.wordId }, async (err, Word) => {
						if (Word) {
							res.json({ success: "true", info: info, Word: Word });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/words/delete", async (req, res) => {
		Words.remove({ _id: req.body.wordId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Word"
			});
		});
	});

	// ===========================================================================

	app.post("/words/item", async (req, res) => {
		Words.findOne({ _id: req.body.wordId }, async (err, Word) => {
			if (Word) {
				res.json(Word);
			}
		});
    });

    // ===========================================================================

	app.post("/words/main", async (req, res) => {
        
        const query = Words.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
        return Promise.all(
            [query]
        ).then(
            results => {
                return res.json(results[0]);
            }
        );
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
