const _ = require("lodash");
const mongoose = require("mongoose");
const NFTs = mongoose.model("NFT");
const Shapes = mongoose.model("shape");
const request = require('request-promise');
const passport = require('passport');
const requireLogin = require("../middleware/requireLogin");

const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = app => {

    // ===========================================================================

    app.post("/NFTs/getMultiple", async (req, res) => {

        NFTs.find(
            {
                _id: {
                    $in: req.body.nfts
                }
            },
            async (err, nfts) => {

                if (err) res.status(400).send({ error: "true", error: err });


                if (nfts) {

                    let shapeIds = _.map(nfts, (nft) => {
                        return (nft.metadata.shapeId)
                    })

                    Shapes.find(
                        {
                            _id: {
                                $in: shapeIds
                            }
                        },
                        async (err, shapes) => {

                            if (err) res.status(400).send({ error: "true", error: err });

                            if (shapes) {

                                res.json({ success: "true", nfts: nfts, shapes: shapes });
                            }
                        }
                    );
                    // res.json({ success: "true", resnftsults: results});
                }
            }
        );

    });

    // ===========================================================================

    app.post("/NFTs/search", async (req, res) => {
        console.log(req.body.user)
        const { criteria, sortProperty, offset, limit, order, user } = req.body;
        let adjustSortProperty = "metadata." + sortProperty
        // if (sortProperty == "createdAt") {
        // 	adjustSortProperty = "metadata." + sortProperty
        // } else {
        // 	adjustSortProperty = "metadata." + sortProperty
        // }
        const query = NFTs.find(buildQuery(criteria, user))
            .sort({ [adjustSortProperty]: order })
            .skip(offset)
            .limit(limit);

        return Promise.all(
            [query, NFTs.find(buildQuery(criteria, user)).countDocuments()]
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

    app.post("/NFTs/getBuckets", async (req, res) => {
        console.log(req.body.property, req.body.buckets)
        const query = NFTs.aggregate([
            {
                $match: {}
            },
            {
                $bucketAuto: {
                    groupBy: `$${req.body.property}`,
                    buckets: req.body.buckets
                }
            }
        ]);

        return Promise.all([
            query,
        ]).then(results => {
            return res.json(results[0]);
        });

    });

    app.post("/NFTs/updateAllNfts", async (req, res) => {
        // if(req.user.admin == true) {
        // NFTs.find(
        //     {
        //     },
        // ).forEach(async (myDoc) => { 
        //     if(myDoc) {
        //         print( "user: " + myDoc.nft.name ); 
        //     }
        // } );;

        let nftList = await NFTs.find()

        nftList.forEach(nft => {

            Shapes.findOne({ _id: nft.metadata.shapeId }, async (err, shape) => {
                if (shape) {
                    console.log(shape)

                    NFTs.updateOne(
                        {
                            _id: nft._id
                        },
                        {
                            $set: {
                                "metadata.defaultViz": shape.defaultViz
                            }
                        },
                        async (err, info) => {
                            if (err) res.status(400).send({ error: "true", error: err });
                            if (info) {
                                // NFTs.findOne({ _id: req.body.nftId }, async (err, NFT) => {
                                //     if (NFT) {
                                //         res.json({ success: "true", info: info, nft: NFT });
                                //     }
                                // });
                            }
                        }
                    );
                }

            });
        });
        // } else {
        //     return res.status(401).send({ error: "true", error: err })
        // }

    });

    // ===========================================================================

    app.post("/NFT/update", async (req, res) => {
        // if(req.user.admin == true) {
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
        // } else {
        //     return res.status(401).send({ error: "true", error: err })
        // }

    });

    app.post("/NFTs/reset", requireAuth, async (req, res) => {
        if (req.user.admin == true) {

            NFTs.updateMany(
                {
                },
                {
                    $set: {
                        "metadata.minted": false,
                        "metadata.owner": "",
                        "metadata.tokenId": null
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

        } else {
            return res.status(401).send({ error: "true", error: err })
        }
    });

    app.post("/NFT/updateShape", requireAuth, async (req, res) => {
        if (req.user.admin == true) {
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
        } else {
            return res.status(401).send({ error: "true", error: err })
        }
    });

    app.post("/NFT/updateImage", requireAuth, async (req, res) => {
        if (req.user.admin == true) {
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
        } else {
            return res.status(401).send({ error: "true", error: err })
        }
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

    app.post("/NFT/updateApproved", async (req, res) => {
        NFTs.updateOne(
            {
                _id: req.body.nftId
            },
            {
                $set: {
                    "metadata.approved": true,
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

    app.post("/NFT/updateRejected", async (req, res) => {
        NFTs.updateOne(
            {
                _id: req.body.nftId
            },
            {
                $set: {
                    "metadata.rejected": true,
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

    app.post("/NFT/updateOwner", async (req, res) => {
        NFTs.updateOne(
            {
                _id: req.body.nftId
            },
            {
                $set: {
                    "metadata.owner": req.body.owner,
                    "metadata.tokenId": req.body.tokenId,
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

    app.post("/NFT/updateCollection", async (req, res) => {
        NFTs.updateOne(
            {
                _id: req.body.nftId
            },
            {
                $set: {
                    "metadata.collectionId": req.body.collectionId,
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

    app.post("/NFTs/delete", requireAuth, async (req, res) => {
        if (req.user.admin == true) {
            NFTs.remove({ _id: req.body.NFTId }, async (err) => {
                if (err) return res.send(err);
                res.json({
                    success: "true",
                    message: "deleted NFT"
                });
            });
        } else {
            return res.status(401).send({ error: "true", error: err })
        }
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


    app.post("/NFT/load", async (req, res) => {
        NFTs.findOne({ _id: req.body.NFTid }, async (err, NFT) => {
            if (NFT) {

                Shapes.findOne({ _id: NFT.metadata.shapeId }, async (err, Shape) => {
                    if (Shape) {

                        res.json({
                            nft: NFT,
                            shape: Shape
                        });
                    }
                });
            }
        });
    });


    // ===========================================================================

    app.post("/NFTs/itemByTokenId", async (req, res) => {
        NFTs.findOne({ "metadata.tokenId": req.body.tokenId }, async (err, NFT) => {
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

const buildQuery = (criteria, user) => {
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
        if (!user) {
            _.assign(query, {
                "metadata.featured": {
                    $eq: true
                },
                "metadata.minted": {
                    $eq: true
                }
            });
        } else {
            _.assign(query, {
                "metadata.featured": {
                    $eq: true
                }
            });
        }
    }
    if (criteria.sale) {
        _.assign(query, {
            "metadata.minted": {
                $eq: true
            }
        });

        _.assign(query, {
            "metadata.owner": {
                $eq: "0x0000000000000000000000000000000000000000"
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

    if (criteria.notMinted) {
        _.assign(query, {
            "metadata.minted": {
                $eq: false
            }
        });
    }

    if (criteria.unreviewed) {
        _.assign(query, {
            "metadata.approved": {
                $exists: false
            },
            "metadata.rejected": {
                $exists: false
            },
            "metadata.minted": {
                $eq: false
            }
        });
    }

    if (criteria.approved !== undefined) {
        if (criteria.approved && criteria.approved !== "false") {
            _.assign(query, {
                "metadata.approved": {
                    $eq: true
                }
            });
        } else {
            _.assign(query, {
                "metadata.approved": {
                    $ne: true
                }
            });
        }

    }

    if (criteria.rejected) {
        _.assign(query, {
            "metadata.rejected": {
                $eq: true
            },
            "metadata.minted": {
                $eq: false
            }
        });
    }

    if (criteria.sold) {
        _.assign(query, {
            "metadata.owner": {
                $ne: ""
            }
        });
    }

    // if(!user) {
    //     _.assign(query, {
    // 		"metadata.minted": {
    // 			$eq: true
    // 		}
    // 	});
    // }

    if (criteria.collectionId) {
        _.assign(query, {
            "metadata.collection.value": {
                $eq: criteria.collectionId
            }
        });
    }

    return query
};
