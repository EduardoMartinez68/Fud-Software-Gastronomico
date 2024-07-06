const express = require('express');
const router = express.Router();


router.get('/tables', (req, res) => {
    res.render("links/branch/tables/tables");
});

module.exports = router;