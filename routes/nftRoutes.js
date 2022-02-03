const _ = require("lodash");
const mongoose = require("mongoose");
const NFTs = mongoose.model("NFT");
const request = require('request-promise');

module.exports = app => {

	// ===========================================================================

	app.post("/NFTs/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit, order } = req.body;
		let adjustSortProperty 
		if (sortProperty == "createdAt") {
			adjustSortProperty = "metadata." + sortProperty
		} else {
			adjustSortProperty =  sortProperty
		}
		const query = NFTs.find(buildQuery(criteria))
			.sort({ [adjustSortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, NFTs.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/NFTs/create", async (req, res) => {
		const NFT = await new NFTs({
			createdAt: new Date(),
            metadata: req.body.metadata,
            nft: req.body.nft
		}).save();
		res.json(NFT);
	});

	// ===========================================================================

	app.post("/NFT/update", async (req, res) => {
        console.log(req.body.metadata)
		NFTs.updateOne(
			{
				_id: req.body.NFTId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.NFTId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, NFT: NFT });
						}
					});
				}
			}
		);
	});

    app.post("/NFT/updateBlocks", async (req, res) => {
		NFTs.updateOne(
			{
				_id: req.body.NFTId
			},
			{
				$set: { 
                    blocks: req.body.blocks
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.NFTId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, NFT: NFT });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/NFTs/delete", async (req, res) => {
		NFTs.remove({ _id: req.body.NFTId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted NFT"
			});
		});
	});

	// ===========================================================================

	app.post("/NFTs/item", async (req, res) => {
		NFTs.findOne({ _id: req.body.NFTId }, async (err, NFT) => {
			if (NFT) {
				res.json(NFT);
			}
		});
    });

    // ===========================================================================

	app.post("/NFTs/main", async (req, res) => {
        
        const query = NFTs.find({ "metadata.main": true })
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
