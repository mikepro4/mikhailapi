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
			adjustSortProperty = "metadata." + sortProperty
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
		NFTs.updateOne(
			{
				_id: req.body.nftId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                    nft: req.body.nft,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.nftId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, nft: NFT });
						}
					});
				}
			}
		);
	});

    app.post("/NFT/updateShape", async (req, res) => {
		NFTs.updateOne(
			{
				_id: req.body.nftId
			},
			{
				$set: { 
                    "metadata.shapeId": req.body.shapeId,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.nftId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, nft: NFT });
						}
					});
				}
			}
		);
	});

    app.post("/NFT/updateImage", async (req, res) => {
		NFTs.updateOne(
			{
				_id: req.body.nftId
			},
			{
				$set: { 
                    "nft.fileUrl": req.body.fileUrl,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.nftId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, nft: NFT });
						}
					});
				}
			}
		);
	});

    app.post("/NFT/updateDuration", async (req, res) => {
		NFTs.updateOne(
			{
				_id: req.body.nftId
			},
			{
				$set: { 
                    "metadata.duration": req.body.duration,
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					NFTs.findOne({ _id: req.body.nftId }, async (err, NFT) => {
						if (NFT) {
							res.json({ success: "true", info: info, nft: NFT });
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

    if (criteria.featured) {
		_.assign(query, {
			"metadata.featured": {
				$eq: true
			},
            "metadata.minted": {
				$eq: true
			}
		});
	}
    if (criteria.sale) {
		_.assign(query, {
			"metadata.minted": {
				$eq: true
			}
		});

        _.assign(query, {
            "metadata.owner": {
				$eq: ""
			}
		});
	}

    if (criteria.owner) {
		_.assign(query, {
			"metadata.owner": {
				$eq: criteria.owner
			}
		});
	}

	return query
};
