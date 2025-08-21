const db = require('../middleware/db');
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../config/constants');

class MembersService {
    
    static async getAllMembers() {
        const result = await db.pool.query("SELECT * FROM members ORDER BY name, firstname");
        return result;
    }

    static async getMemberById(id) {
        const result = await db.pool.query("SELECT * FROM members WHERE id = ?", [id]);
        if (result.length === 0) {
            throw new Error('Membre non trouvé');
        }
        return result[0];
    }

    static async getNewMembersBySeason(seasonId) {
        const result = await db.pool.query(
            "SELECT * FROM new_members WHERE id_season = ? ORDER BY name, firstname", 
            [seasonId]
        );
        return result;
    }

    static async getMembersBorrowsBySeason(seasonId) {
        const result = await db.pool.query(
            "SELECT * FROM members_borrows WHERE id_season = ?", 
            [seasonId]
        );
        return result;
    }

    static async getMemberBorrows(id) {
        const result = await db.pool.query(
            "SELECT * FROM members_borrows WHERE id = ?", 
            [id]
        );
        return result;
    }

    static async createMember(memberData) {
        const {
            name, firstname, adress, postal_code, city, email, 
            birth_date, phone_number, picture, admin_password, 
            discord_tag, admin
        } = memberData;

        const hashedPassword = admin === 1 && admin_password ? 
            await bcrypt.hash(admin_password, BCRYPT_ROUNDS) : 
            '';

        const result = await db.pool.query(
            `INSERT INTO members (name, firstname, adress, postal_code, city, email, 
             birth_date, phone_number, picture, admin_password, discord_tag, admin) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, firstname, adress, postal_code, city, email, 
             birth_date, phone_number, picture, hashedPassword, discord_tag, admin]
        );
        return result;
    }

    static async updateMember(id, memberData) {
        const {
            name, firstname, adress, postal_code, city, email, 
            birth_date, phone_number, picture, admin_password, 
            discord_tag, admin
        } = memberData;

        const hashedPassword = admin === 1 && admin_password ? 
            await bcrypt.hash(admin_password, BCRYPT_ROUNDS) : 
            '';

        const result = await db.pool.query(
            `UPDATE members SET name = ?, firstname = ?, adress = ?, postal_code = ?, 
             city = ?, email = ?, birth_date = ?, phone_number = ?, picture = ?, 
             admin_password = ?, discord_tag = ?, admin = ? WHERE id = ?`,
            [name, firstname, adress, postal_code, city, email, 
             birth_date, phone_number, picture, hashedPassword, discord_tag, admin, id]
        );
        return result;
    }

    static async updateMemberWithoutPicture(id, memberData) {
        const {
            name, firstname, adress, postal_code, city, email, 
            birth_date, phone_number, admin_password, discord_tag, admin
        } = memberData;

        const hashedPassword = admin === 1 && admin_password ? 
            await bcrypt.hash(admin_password, BCRYPT_ROUNDS) : 
            '';

        const result = await db.pool.query(
            `UPDATE members SET name = ?, firstname = ?, adress = ?, postal_code = ?, 
             city = ?, email = ?, birth_date = ?, phone_number = ?, 
             admin_password = ?, discord_tag = ?, admin = ? WHERE id = ?`,
            [name, firstname, adress, postal_code, city, email, 
             birth_date, phone_number, hashedPassword, discord_tag, admin, id]
        );
        return result;
    }

    static async deleteMember(id) {
        const result = await db.pool.query("DELETE FROM members WHERE id = ?", [id]);
        return result;
    }

    static async memberExists(id) {
        const result = await db.pool.query("SELECT COUNT(*) as count FROM members WHERE id = ?", [id]);
        return result[0].count > 0;
    }

    static async getMemberByEmail(email) {
        const result = await db.pool.query("SELECT * FROM members WHERE email = ?", [email]);
        return result.length > 0 ? result[0] : null;
    }
}

module.exports = MembersService;