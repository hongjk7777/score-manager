import { Container } from "typedi";
import db from "../db/dbConfig";

export default class AuthRepository {
    async findOneByUsername(username) {
        const promiseDB = db.promise();

        const [rows, fields] = await promiseDB.execute('SELECT * FROM accounts WHERE username = ?', [ username ]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    }
}

Container.set("authRepository", AuthRepository)