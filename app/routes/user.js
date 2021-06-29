const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const router = express.Router();
router.use(express.static(path.join(__dirname, '../public')));

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

router.get('/:user', function(req, res, next) {
  res.send('ユーザー' + req.params.user + 'の情報を取得');
});


router.put('/create', (req, res) => {
  console.log('ユーザーを作成',req.body);
  // ステータスコード200:OKを送信
  res.sendStatus(200);
});

module.exports = router;