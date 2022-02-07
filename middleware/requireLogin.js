const passport = require('passport');
// module.exports = (req, res, next) => {
// 	passport.authenticate('jwt', { session: false })
// 	next();
// };

module.exports = (req, res, next) => {
	if (!req.user) {
        //  passport.authenticate('jwt', { session: false })

		return res.status(401).send({ error: "You must log in!" });

	}

	next();
};
