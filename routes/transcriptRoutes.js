const _ = require("lodash");
const mongoose = require("mongoose");
const Transcripts = mongoose.model("transcript");
const request = require('request-promise');

module.exports = app => {

	// ===========================================================================

	app.post("/transcripts/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
		let adjustSortProperty = "metadata." + sortProperty
        
		const query = Transcripts.find(buildQuery(criteria))
			.sort({ [adjustSortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Transcripts.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/transcripts/create", async (req, res) => {
		const Transcript = await new Transcripts({
            metadata: req.body.metadata,
            request: req.body.request,
            response: req.body.response
		}).save();
		res.json(Transcript);
	});

	// ===========================================================================

	app.post("/transcript/update", async (req, res) => {
        console.log(req.body.metadata)
		Transcripts.updateOne(
			{
				_id: req.body.transcriptId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Transcripts.findOne({ _id: req.body.transcriptId }, async (err, Transcript) => {
						if (Transcript) {
							res.json({ success: "true", info: info, Transcript: Transcript });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/transcripts/delete", async (req, res) => {
		Transcripts.remove({ _id: req.body.transcriptId }, async (err) => {
			if (err) return res.send(err);
            res.json({ success: "true", info: info });
		});
	});

	// ===========================================================================

	app.post("/transcripts/item", async (req, res) => {
		Transcripts.findOne({ _id: req.body.transcriptId }, async (err, Transcript) => {
			if (Transcript) {
				res.json(Transcript);
			}
		});
    });

};

const buildQuery = criteria => {
	const query = {};

 

	return query
};
