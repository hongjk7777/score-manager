import { Container, Service } from "typedi";
import { asyncDB } from "../domain/db/dbConfig";
import User from "../domain/entity/user";

export default class AuthRepository {

    async save(user) {
        const query = `INSERT INTO accounts(username, hashed_password, salt) 
                        VALUE ('${user.getUsername()}', '${user.getHashedPassword()}', '${user.getSalt()}');`

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

    //TODO: 지금 상태로 나가면 안 될 듯? DTO라도
    async findOneByUsername(username) {
        const query = `SELECT * FROM accounts WHERE username = '${username}'`

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return null;
        }

        return new User(rows[0].username, rows[0].hashed_password, rows[0].salt);
    }

    async findIdByUsername(username) {
        const query = `SELECT id FROM accounts WHERE username = '${username}'`

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return null;
        }

        return rows[0].id;
    }

    async updatePasswordById(id, hashedPassword, salt) {
        const query = `UPDATE accounts SET hashed_password = '${hashedPassword}', salt = '${salt}' WHERE id = '${id}'`;

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

    async deleteByUsername(username) {
        const query = `DELETE FROM accounts WHERE username = '${username}'`

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

}

//Container.set(AuthRepository, AuthRepository);
