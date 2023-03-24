const sql = 'CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY, product_name TEXT, price INTEGER,total INTEGER)';

function createProductTable(db) {
    db.run(sql);
}

module.exports = { createProductTable }