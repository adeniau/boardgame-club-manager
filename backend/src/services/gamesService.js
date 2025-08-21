const db = require('../middleware/db');

class GamesService {
    
    static async getAllGames() {
        const result = await db.pool.query("SELECT * FROM games ORDER BY name");
        return result;
    }

    static async getGameById(id) {
        const result = await db.pool.query("SELECT * FROM games WHERE id = ?", [id]);
        if (result.length === 0) {
            throw new Error('Jeu non trouvé');
        }
        return result[0];
    }

    static async getRandomGame() {
        const result = await db.pool.query(
            "SELECT g.id, g.name, g.picture FROM games g, random_game r WHERE g.id = r.random"
        );
        return result;
    }

    static async getGamesBorrowsBySeason(seasonId) {
        const result = await db.pool.query(
            "SELECT * FROM games_borrows WHERE id_season = ?", 
            [seasonId]
        );
        return result;
    }

    static async getGameBorrows(id) {
        const result = await db.pool.query(
            "SELECT * FROM games_borrows WHERE id = ?", 
            [id]
        );
        return result;
    }

    static async createGame(gameData) {
        const { name, picture, available = 1 } = gameData;
        const result = await db.pool.query(
            "INSERT INTO games (name, picture, available) VALUES (?, ?, ?)",
            [name, picture, available]
        );
        return result;
    }

    static async updateGame(id, gameData) {
        const { name, picture, available } = gameData;
        const result = await db.pool.query(
            "UPDATE games SET name = ?, picture = ?, available = ? WHERE id = ?",
            [name, picture, available, id]
        );
        return result;
    }

    static async updateGameWithoutPicture(id, gameData) {
        const { name, available } = gameData;
        const result = await db.pool.query(
            "UPDATE games SET name = ?, available = ? WHERE id = ?",
            [name, available, id]
        );
        return result;
    }

    static async deleteGame(id) {
        const result = await db.pool.query("DELETE FROM games WHERE id = ?", [id]);
        return result;
    }

    static async gameExists(id) {
        const result = await db.pool.query("SELECT COUNT(*) as count FROM games WHERE id = ?", [id]);
        return result[0].count > 0;
    }
}

module.exports = GamesService;