console.log("Checking Colwell Wallet");
if(!db.colwell_wallet) {
    console.log("Creating Colwell Wallet");
    db.createCollection("colwell_Wallet");
}
console.log("Checking Colwell Positions");
if(!db.colwell_positions) {
    console.log("Creating Colwell Positions");
    db.createCollection("colwell_positions");
}
