


const sql = 'CREATE TABLE IF NOT EXISTS carts (cart_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(user_id))';

function createCartsTable(db) {
    db.run(sql);
}

module.exports = { createCartsTable }