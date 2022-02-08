const passport = require('passport');
const keys = require("../config/keys");
const requireAuth = passport.authenticate('jwt', { session: false });

const mongoose = require("mongoose");

const Avatar = require('avatar-builder');
const cloudinary = require('cloudinary').v2;
let streamifier = require('streamifier');

const avatar = Avatar.githubBuilder(128);
const { v4: uuidv4 } = require('uuid');

const NFTs = mongoose.model("NFT");

const _ = require("lodash");

cloudinary.config({
    cloud_name: keys.cloudName,
    api_key: keys.apiKey,
    api_secret: keys.apiSecret
});

module.exports = app => {
    app.get(
        "/user_details",
        requireAuth,
        (req, res) => {
            res.send(req.user)
        }
    );

    app.post("/market/stats", async (req, res) => {
        // console.log(req.body.user)
        // const { criteria, sortProperty, offset, limit, order, user } = req.body;
        // let adjustSortProperty 
        // if (sortProperty == "createdAt") {
        // 	adjustSortProperty = "metadata." + sortProperty
        // } else {
        // 	adjustSortProperty = "metadata." + sortProperty
        // }
        // const query = NFTs.find(buildQuery(criteria, user))
        // 	.sort({ [adjustSortProperty]: order })
        // 	.skip(offset)
        // 	.limit(limit);
        let approvedNfts = NFTs.find(
            {
                "metadata.approved": {
                    $eq: true
                }
            }).countDocuments()

        let rejectedNfts = NFTs.find(
            {
                "metadata.rejected": {
                    $eq: true
                }
            }).countDocuments()

        let draftNfts = NFTs.find(
            {
                "metadata.minted": {
                    $eq: false
                }
            }).countDocuments()

        let featuredNfts = NFTs.find(
            {
                "metadata.featured": {
                    $eq: true
                }
            }).countDocuments()

        let soldNfts = NFTs.find(
            {
                "metadata.owner": {
                    $ne: ""
                }
            }).countDocuments()

        let mintedNfts = NFTs.find(
            {
                "metadata.minted": {
                    $eq: true
                }
            }).countDocuments()

        return Promise.all(
            [approvedNfts, rejectedNfts, draftNfts, featuredNfts, soldNfts, mintedNfts]
        ).then(
            results => {
                return res.json({
                    approved: results[0],
                    rejected: results[1],
                    draft: results[2],
                    featured: results[3],
                    sold: results[4],
                    minted: results[5],
                });
            }
        );
    });
};

const buildQuery = criteria => {
    const query = {};

    return query
};


