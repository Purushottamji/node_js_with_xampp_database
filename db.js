const mysql=require("mysql2");

const db=mysql.createConnection({
    host:"localhost",
    database:"edugaon",
    user:"root",
    password:""
})

db.connect((error)=>{
    if(error) return console.log("Database created error" + error);
    console.log("👍 Database created successful");
})

module.exports=db;