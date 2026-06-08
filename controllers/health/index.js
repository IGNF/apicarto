import { Router } from 'express';

var router = new Router();

router.get('/check', function (req, res) {
    res.json({
        status: 'OK'
    });
});

export {router};