const express = require('express');
const sqlite = require('sqlite3').verbose();
const usersSchema = require('./models/user_schema');
const productsSchema = require('./models/product_schema');
const cartsSchema = require('./models/cart_schema');
const cartItemSchema = require('./models/cartItem_schema');
const router = require('./routers/routers');


const app = express();
const PORT = process.env.PORT || 5000;
const db = new sqlite.Database("database.db");

usersSchema.createUsersTable(db);
productsSchema.createProductTable(db);
cartsSchema.createCartsTable(db);
cartItemSchema.createCartItemsTable(db);

app.use(express.json());

app.use('/', router);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})