const db = require('../middleware/db');

class BorrowingsService {
    
    /**
     * Recuperer tous les emprunts en cours avec details des membres et jeux
     */
    static async getCurrentBorrowings() {
        const result = await db.pool.query(`
            SELECT 
                b.id,
                b.id_season,
                b.id_member,
                b.id_game,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.firstname as member_firstname,
                m.name as member_lastname,
                m.email as member_email,
                m.phone as member_phone,
                m.picture as member_picture,
                g.name as game_name,
                g.picture as game_picture,
                g.available as game_available
            FROM borrowings b
            JOIN members m ON b.id_member = m.id
            JOIN games g ON b.id_game = g.id
            WHERE b.return_date IS NULL
            ORDER BY b.borrow_date DESC
        `);
        return result;
    }

    /**
     * Recuperer les emprunts par membre
     */
    static async getBorrowingsByMember(memberId) {
        const result = await db.pool.query(
            "SELECT * FROM borrowings WHERE id_member = ? ORDER BY borrow_date DESC", 
            [memberId]
        );
        return result;
    }

    /**
     * Recuperer les emprunts par jeu
     */
    static async getBorrowingsByGame(gameId) {
        const result = await db.pool.query(
            "SELECT * FROM borrowings WHERE id_game = ? ORDER BY borrow_date DESC", 
            [gameId]
        );
        return result;
    }

    /**
     * Recuperer les statistiques totales d'emprunts par saison
     */
    static async getTotalBorrowingsBySeason(seasonId) {
        const result = await db.pool.query(
            "SELECT * FROM total_borrows WHERE id_season = ?", 
            [seasonId]
        );
        return result;
    }

    /**
     * Recuperer les statistiques de jeux empruntés par saison
     */
    static async getTotalGamesBorrowingsBySeason(seasonId) {
        const result = await db.pool.query(
            "SELECT * FROM total_games_borrows WHERE id_season = ?", 
            [seasonId]
        );
        return result;
    }

    /**
     * Recuperer l'historique complet des emprunts avec details
     */
    static async getBorrowingsHistory(filters = {}) {
        let query = `
            SELECT 
                b.id,
                b.id_season,
                b.id_member,
                b.id_game,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.firstname as member_firstname,
                m.name as member_lastname,
                m.email as member_email,
                m.phone as member_phone,
                m.picture as member_picture,
                g.name as game_name,
                g.picture as game_picture,
                s.name as season_name
            FROM borrowings b
            JOIN members m ON b.id_member = m.id
            JOIN games g ON b.id_game = g.id
            JOIN seasons s ON b.id_season = s.id
            WHERE 1=1
        `;
        
        const params = [];

        if (filters.seasonId) {
            query += " AND b.id_season = ?";
            params.push(filters.seasonId);
        }

        if (filters.memberId) {
            query += " AND b.id_member = ?";
            params.push(filters.memberId);
        }

        if (filters.gameId) {
            query += " AND b.id_game = ?";
            params.push(filters.gameId);
        }

        if (filters.status) {
            if (filters.status === 'current') {
                query += " AND b.return_date IS NULL";
            } else if (filters.status === 'returned') {
                query += " AND b.return_date IS NOT NULL";
            }
        }

        if (filters.dateFrom) {
            query += " AND b.borrow_date >= ?";
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            query += " AND b.borrow_date <= ?";
            params.push(filters.dateTo);
        }

        query += " ORDER BY b.borrow_date DESC";

        if (filters.limit) {
            query += " LIMIT ?";
            params.push(parseInt(filters.limit));
        }

        const result = await db.pool.query(query, params);
        return result;
    }

    /**
     * Creer un nouvel emprunt avec transaction
     */
    static async createBorrowing(borrowingData) {
        const { id_season, id_member, id_game, borrow_date } = borrowingData;
        
        // Commencer une transaction pour assurer la coherence
        await db.pool.query("START TRANSACTION");
        
        try {
            console.log(`[DEBUG] Creating borrowing for game ${id_game}...`);
            
            // Verifier que le jeu est disponible
            const gameCheck = await db.pool.query(
                "SELECT available FROM games WHERE id = ?", 
                [id_game]
            );
            
            if (gameCheck.length === 0) {
                throw new Error('Jeu non trouve');
            }
            
            if (gameCheck[0].available === 0) {
                throw new Error('Jeu non disponible');
            }
            
            // Verifier que le membre existe
            const memberCheck = await db.pool.query(
                "SELECT id FROM members WHERE id = ?", 
                [id_member]
            );
            
            if (memberCheck.length === 0) {
                throw new Error('Membre non trouve');
            }
            
            // Verifier que la saison existe
            const seasonCheck = await db.pool.query(
                "SELECT id FROM seasons WHERE id = ?", 
                [id_season]
            );
            
            if (seasonCheck.length === 0) {
                throw new Error('Saison non trouvee');
            }
            
            // Inserer l'emprunt
            const result = await db.pool.query(
                "INSERT INTO borrowings (id_season, id_member, id_game, borrow_date) VALUES (?, ?, ?, ?)",
                [id_season, id_member, id_game, borrow_date]
            );
            
            console.log(`[DEBUG] Borrowing created with ID: ${result.insertId}`);
            
            // Mettre à jour la disponibilite du jeu
            const gameResult = await db.pool.query(
                "UPDATE games SET available = 0 WHERE id = ?", 
                [id_game]
            );
            
            console.log(`[DEBUG] Game ${id_game} marked unavailable, affected rows: ${gameResult.affectedRows}`);
            
            // Valider la transaction
            await db.pool.query("COMMIT");
            console.log(`[DEBUG] Transaction committed for new borrowing`);
            
            return result;
        } catch (error) {
            // Annuler la transaction en cas d'erreur
            await db.pool.query("ROLLBACK");
            console.error('[ERROR] Failed to create borrowing:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un emprunt (principalement pour les retours)
     */
    static async updateBorrowing(id, borrowingData) {
        const { return_date, comment } = borrowingData;
        
        // Commencer une transaction pour assurer la coherence
        await db.pool.query("START TRANSACTION");
        
        try {
            console.log(`[DEBUG] Returning borrowing ${id}...`);
            
            // Recuperer l'ID du jeu depuis l'emprunt
            const borrowingResult = await db.pool.query(
                "SELECT id_game, return_date FROM borrowings WHERE id = ?", 
                [id]
            );
            
            if (borrowingResult.length === 0) {
                throw new Error('Emprunt non trouve');
            }
            
            const gameId = borrowingResult[0].id_game;
            const currentReturnDate = borrowingResult[0].return_date;
            
            console.log(`[DEBUG] Returning game ${gameId} for borrowing ${id}`);
            
            // Mettre à jour l'emprunt avec la date de retour
            const result = await db.pool.query(
                "UPDATE borrowings SET return_date = ?, comment = ? WHERE id = ?",
                [return_date, comment, id]
            );
            
            console.log(`[DEBUG] Borrowing updated, affected rows: ${result.affectedRows}`);
            
            // Si on est en train de retourner un jeu (pas encore retourne)
            if (!currentReturnDate && return_date) {
                // Mettre à jour la disponibilite du jeu (le marquer comme disponible)
                const gameResult = await db.pool.query(
                    "UPDATE games SET available = 1 WHERE id = ?", 
                    [gameId]
                );
                
                console.log(`[DEBUG] Game ${gameId} availability updated, affected rows: ${gameResult.affectedRows}`);
            }
            
            // Valider la transaction
            await db.pool.query("COMMIT");
            console.log(`[DEBUG] Transaction committed for borrowing ${id}`);
            
            return result;
        } catch (error) {
            // Annuler la transaction en cas d'erreur
            await db.pool.query("ROLLBACK");
            console.error(`[ERROR] Failed to return borrowing ${id}:`, error);
            throw error;
        }
    }

    /**
     * Supprimer un emprunt
     */
    static async deleteBorrowing(id) {
        // Commencer une transaction pour assurer la coherence
        await db.pool.query("START TRANSACTION");
        
        try {
            // Recuperer l'ID du jeu et verifier si l'emprunt etait en cours
            const borrowingResult = await db.pool.query(
                "SELECT id_game, return_date FROM borrowings WHERE id = ?", 
                [id]
            );
            
            if (borrowingResult.length === 0) {
                throw new Error('Emprunt non trouve');
            }
            
            const gameId = borrowingResult[0].id_game;
            const returnDate = borrowingResult[0].return_date;
            
            // Supprimer l'emprunt
            const result = await db.pool.query(
                "DELETE FROM borrowings WHERE id = ?", 
                [id]
            );
            
            // Si l'emprunt n'etait pas encore retourne, remettre le jeu disponible
            if (!returnDate) {
                await db.pool.query(
                    "UPDATE games SET available = 1 WHERE id = ?", 
                    [gameId]
                );
            }
            
            // Valider la transaction
            await db.pool.query("COMMIT");
            
            return result;
        } catch (error) {
            // Annuler la transaction en cas d'erreur
            await db.pool.query("ROLLBACK");
            console.error(error);
            throw error;
        }
    }

    /**
     * Verifier si un emprunt existe
     */
    static async borrowingExists(id) {
        const result = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE id = ?", 
            [id]
        );
        return result[0].count > 0;
    }

    /**
     * Recuperer les emprunts en retard
     */
    static async getOverdueBorrowings(daysThreshold = 14) {
        const result = await db.pool.query(`
            SELECT 
                b.id,
                b.id_season,
                b.id_member,
                b.id_game,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.firstname as member_firstname,
                m.name as member_lastname,
                m.email as member_email,
                m.phone as member_phone,
                g.name as game_name,
                DATEDIFF(CURDATE(), b.borrow_date) as days_borrowed
            FROM borrowings b
            JOIN members m ON b.id_member = m.id
            JOIN games g ON b.id_game = g.id
            WHERE b.return_date IS NULL 
            AND DATEDIFF(CURDATE(), b.borrow_date) > ?
            ORDER BY b.borrow_date ASC
        `, [daysThreshold]);
        return result;
    }

    /**
     * Statistiques rapides des emprunts
     */
    static async getBorrowingStats() {
        const stats = {};
        
        // Total des emprunts en cours
        const currentResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE return_date IS NULL"
        );
        stats.currentBorrowings = currentResult[0].count;
        
        // Total des emprunts ce mois
        const monthlyResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE MONTH(borrow_date) = MONTH(CURDATE()) AND YEAR(borrow_date) = YEAR(CURDATE())"
        );
        stats.monthlyBorrowings = monthlyResult[0].count;
        
        // Jeux les plus empruntés
        const popularGamesResult = await db.pool.query(`
            SELECT 
                g.name as game_name,
                COUNT(b.id) as borrow_count
            FROM borrowings b
            JOIN games g ON b.id_game = g.id
            GROUP BY b.id_game, g.name
            ORDER BY borrow_count DESC
            LIMIT 5
        `);
        stats.popularGames = popularGamesResult;
        
        // Emprunts en retard
        const overdueResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE return_date IS NULL AND DATEDIFF(CURDATE(), borrow_date) > 14"
        );
        stats.overdueBorrowings = overdueResult[0].count;
        
        return stats;
    }
}

module.exports = BorrowingsService;