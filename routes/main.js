const passport = require('passport');
const keys = require("../config/keys");
const requireAuth = passport.authenticate('jwt', { session: false });

const mongoose = require("mongoose");

const Avatar = require('avatar-builder');
const cloudinary = require('cloudinary').v2;
let streamifier = require('streamifier');

const avatar = Avatar.githubBuilder(128);
const { v4: uuidv4 } = require('uuid');

const _ = require("lodash");

cloudinary.config({ 
	cloud_name: keys.cloudName, 
	api_key: keys.apiKey, 
	api_secret: keys.apiSecret
});

module.exports = app => {
	
};

const buildQuery = criteria => {
    const query = {};
    
	return query
};


