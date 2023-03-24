const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require('../functions/generateAccessToken');
const {checkAdmin} = require('../functions/checkAdmin');
const {json} = require("express");

function getRoot(req, res) {
    db.all('SELECT * FROM products', [], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
}

function getById(req, res) {
    const productId = req.params.id;
    db.get('SELECT * FROM products WHERE product_id = ?', [productId], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
}

function register(req, res) {
    const username = req.body.user_name;
    const password = req.body.password
    const hashed_password = CryptoJS.SHA256(password).toString();

    db.get('SELECT * FROM users WHERE user_name = ?', [username], (error, row) => {
        if (error) {
            res.send('Error from username check');
        }
        if (row) {
            res.send(JSON.stringify({status: 'Username Already Exists'}));
        } else {
            const sql = 'INSERT INTO users (user_name, password, role) VALUES (?, ?, ?)';


            db.run(sql, [username, hashed_password, 1], (error) => {
                if (error) {
                    res.send('Error 1');
                }
                db.get('SELECT * FROM users WHERE user_name = ?', [username], (error, row) => {
                    if (error) {
                        res.send('Error2');
                    } else {

                        db.run('INSERT INTO carts (user_id) VALUES (?)', [row.user_id], (error) => {
                            if (error) {
                                res.send('Error3');
                            } else {
                                res.send(JSON.stringify({status: 'User created'}));
                            }
                        })
                    }
                })
            })
        }
    })
}

function login(req, res) {
    const username = req.body.user_name;
    const password = req.body.password
    const hashed_password = CryptoJS.SHA256(password).toString();

    const sql = 'SELECT * FROM users WHERE user_name = ?';
    db.get(sql, [username], (error, row) => {
        if (error) {
            res.send('Error');
        }

        if (!row) {
            res.send(JSON.stringify({status: 'No Such User'}));
        } else if (username === row.user_name && hashed_password === row.password) {
            const token = generateAccessToken(row.user_name, row.role);
            res.send(JSON.stringify({status: 'Logged in', jwt: token}));
        } else {
            res.send(JSON.stringify({status: 'Wrong Password'}));
        }
    })
}

// function deleteUser(req, res) {
//     db.get(`SELECT * FROM users WHERE id = ${req.params.id}`, (err, row) => {
//         if (row) {
//             const userId = req.body.user_id;
//
//             db.run(`DELETE FROM users WHERE user_id = ${req.params.id}`, [userId], err => {
//                 if (err) {
//                     res.status(500).json({
//                         msg: 'Internal Server Error',
//                         err
//                     });
//                 } else {
//                     res.status(200).json({
//                         msg: 'User Deleted Successfully'
//                     });
//                 }
//             });
//         } else {
//             res.status(404).json({
//                 msg: 'User not found'
//             });
//         }
//     });
//
// }


function addToCart(req, res) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);
    const username = decoded;

    db.get('SELECT * FROM users WHERE user_name = ?', [username], (error, row) => {
        if (error) {
            res.send('Error');
        } else {
            db.get('SELECT * FROM carts WHERE user_id = ?', [row.user_id], (error, row) => {
                if (error) {
                    res.send('Error');
                } else {
                    db.run('INSERT INTO CartItems (cart_id, product_id) VALUES (?, ?)', [row.cart_id, req.body.id], (error) => {
                        if (error) {
                            res.send('Error');
                        } else {
                            res.send(JSON.stringify({status: 'Product added'}));
                        }
                    })
                }
            })
        }
    })
}

function createProduct(req, res) {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {

        const productName = req.body.product_name;
        const price = req.body.price;
        const total = req.body.total

        db.run('INSERT INTO products (product_name, price, total) VALUES (?, ?, ?)', [productName, price, total], (error) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({status: "Product added"}));
            }
        })
    } else {
        res.send(JSON.stringify({status: "Denied Access"}));
    }
}

function updateProduct(req, res) {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {

        const product_id = req.body.product_id
        const productName = req.body.product_name;
        const price = req.body.price;
        const total = req.body.total

        db.run('UPDATE products SET product_name = ?, price = ?, total = ? WHERE product_id = ?', [productName, price, total, product_id], (error) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({status: "Product updated"}));
            }
        })
    } else {
        res.send(JSON.stringify({status: "Denied Access"}));
    }
}

function deleteProduct(req, res) {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {
        const product_id = req.body.product_id;

        db.run('DELETE FROM products WHERE product_id = ?', [product_id], (error) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({status: "Product deleted"}));
            }
        })
    } else {
        res.send(JSON.stringify({status: "Denied Access"}));
    }
}

module.exports = {
    getRoot,
    getById,
    register,
    login,
    addToCart,
    createProduct,
    updateProduct,
    deleteProduct
}