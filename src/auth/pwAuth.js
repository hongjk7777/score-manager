import crypto from "crypto";
import { resolve } from "path";
import db from "../db/dbConfig";

function initPassword(studentPhoneNum) {
    return new Promise(resolve => {
        const query = `SELECT id FROM accounts WHERE username = '${studentPhoneNum}'`;
        console.log(query);
        var salt = crypto.randomBytes(16);
        const initPassword = studentPhoneNum += '5';
        db.query("USE classdb");
        db.query(query, function(err, row) {
            console.log(row);
            if (err) { console.log(err); resolve(); }
            if (row.length === 0) { resolve(); }
            else{
                const id = row[0].id;
                crypto.pbkdf2(initPassword, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                    if (err) { resolve(); }
                
                
                    db.query(`UPDATE accounts SET hashed_password = ?, salt = ? WHERE id = ?`, [hashedPassword, salt, id], function(err) {
                    if (err) { resolve(); }
                    else {
                        resolve();
                    }
                    });
                });
            }
        });
    })
    
}

export {initPassword}