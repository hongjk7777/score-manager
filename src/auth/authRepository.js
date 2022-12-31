import { Container } from "typedi";
import { asyncDB } from "../db/dbConfig";
import User from "../model/user";

export default class AuthRepository {

    async save(user) {
        const query = `INSERT INTO accounts(username, hashed_password, salt) 
                        VALUE ('${user.getUsername()}', '${user.getHashedPassword()}', '${user.getSalt()}');`

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

    async findOneByUsername(username) {
        const query = `SELECT * FROM accounts WHERE username = '${username}'`

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return null;
        }

        return new User(rows[0].username);
    }

    async deleteByUsername(username) {
        const query = `DELETE FROM accounts WHERE username = '${username}'`

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

}

Container.set("authRepository", AuthRepository)