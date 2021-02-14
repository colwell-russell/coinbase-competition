CREATE TABLE IF NOT EXISTS wallet (
    amount VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS wallet_transaction (
    transaction_id INT NOT NULL AUTO_INCREMENT,
    transaction_type VARCHAR (25),
    transaction_amount VARCHAR (50),
    PRIMARY KEY (transaction_id)
);
