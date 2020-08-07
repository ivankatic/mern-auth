const router = require('express').Router();
const verifyToken = require('./verifyToken');

router.get('/', verifyToken, (req, res) => {
	res.json({ posts: { title: 'le post', desc: 'lorem isus' } });
});

module.exports = router;
