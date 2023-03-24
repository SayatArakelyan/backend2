const express = require('express');
const router = express.Router()
const Controllers = require('../controllers/controllers');
const { authenticateToken } = require('../functions/authenticateToken');

router.get('/', Controllers.getRoot);
router.get('/:id', Controllers.getById);
router.post('/register', Controllers.register);
router.post('/login', Controllers.login);
router.post('/addToCart', authenticateToken, Controllers.addToCart);
router.post('/createProduct', authenticateToken, Controllers.createProduct);
router.put('/updateProduct', authenticateToken, Controllers.updateProduct);
router.delete('/deleteProduct', authenticateToken, Controllers.deleteProduct);


module.exports = router;