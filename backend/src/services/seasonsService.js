const db = require('../middleware/db');

class SeasonsService {
    
    /**
     * Recuperer toutes les saisons avec comptage des adhesions
     */
    static async getAllSeasons() {
        const query = `
            SELECT 
                s.id,
                s.name,
                s.start_date,
                s.end_date,
                s.description,
                s.is_current,
                s.created_at,
                s.updated_at,
                COUNT(ms.id_member) as member_count
            FROM seasons s
            LEFT JOIN memberships ms ON s.id = ms.id_season
            GROUP BY s.id, s.name, s.start_date, s.end_date, s.description, s.is_current, s.created_at, s.updated_at
            ORDER BY s.is_current DESC, s.start_date DESC
        `;
        const result = await db.pool.query(query);
        return result;
    }

    /**
     * Recuperer une saison par ID avec details
     */
    static async getSeasonById(seasonId) {
        const query = `
            SELECT 
                s.id,
                s.name,
                s.start_date,
                s.end_date,
                s.description,
                s.is_current,
                s.created_at,
                s.updated_at,
                COUNT(DISTINCT ms.id_member) as member_count,
                COUNT(DISTINCT b.id) as borrowing_count
            FROM seasons s
            LEFT JOIN memberships ms ON s.id = ms.id_season
            LEFT JOIN borrowings b ON s.id = b.id_season
            WHERE s.id = ?
            GROUP BY s.id, s.name, s.start_date, s.end_date, s.description, s.is_current, s.created_at, s.updated_at
        `;
        const result = await db.pool.query(query, [seasonId]);
        return result.length > 0 ? result[0] : null;
    }

    /**
     * Recuperer la saison courante
     */
    static async getCurrentSeason() {
        const result = await db.pool.query(
            "SELECT * FROM seasons WHERE is_current = 1 LIMIT 1"
        );
        return result.length > 0 ? result[0] : null;
    }

    /**
     * Creer une nouvelle saison avec transaction
     */
    static async createSeason(seasonData) {
        const { name, description, start_date, end_date, set_as_current = false } = seasonData;
        
        // Validation
        const validation = this.validateSeasonData(seasonData);
        if (!validation.isValid) {
            throw new Error(`Erreur de validation: ${validation.errors.join(', ')}`);
        }
        
        const conn = await db.pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            console.log(`[DEBUG] Creating season: ${name}`);
            
            // Verifier l'unicite du nom
            const existingCheck = await conn.query(
                "SELECT id FROM seasons WHERE name = ?", 
                [name]
            );
            
            if (existingCheck.length > 0) {
                throw new Error('Une saison avec ce nom existe deja');
            }
            
            // Si on definit cette saison comme courante, desactiver les autres
            if (set_as_current) {
                await conn.query("UPDATE seasons SET is_current = 0");
                console.log(`[DEBUG] Deactivated other current seasons`);
            }
            
            // Inserer la nouvelle saison
            const result = await conn.query(
                `INSERT INTO seasons (name, description, start_date, end_date, is_current, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [name, description, start_date, end_date, set_as_current ? 1 : 0]
            );
            
            console.log(`[DEBUG] Season created with ID: ${result.insertId}`);
            
            await conn.commit();
            
            return await this.getSeasonById(result.insertId);
        } catch (error) {
            await conn.rollback();
            console.error('[ERROR] Failed to create season:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre a jour une saison
     */
    static async updateSeason(seasonId, seasonData) {
        const { name, description, start_date, end_date } = seasonData;
        
        // Validation
        const validation = this.validateSeasonData(seasonData, seasonId);
        if (!validation.isValid) {
            throw new Error(`Erreur de validation: ${validation.errors.join(', ')}`);
        }
        
        const conn = await db.pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            console.log(`[DEBUG] Updating season ${seasonId}`);
            
            // Verifier que la saison existe
            const existingCheck = await conn.query(
                "SELECT id FROM seasons WHERE id = ?", 
                [seasonId]
            );
            
            if (existingCheck.length === 0) {
                throw new Error('Saison non trouvee');
            }
            
            // Verifier l'unicite du nom si change
            if (name) {
                const nameCheck = await conn.query(
                    "SELECT id FROM seasons WHERE name = ? AND id != ?", 
                    [name, seasonId]
                );
                
                if (nameCheck.length > 0) {
                    throw new Error('Une saison avec ce nom existe deja');
                }
            }
            
            // Construire la requete de mise a jour dynamiquement
            const updateFields = [];
            const updateValues = [];
            
            if (name !== undefined) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (description !== undefined) {
                updateFields.push('description = ?');
                updateValues.push(description);
            }
            if (start_date !== undefined) {
                updateFields.push('start_date = ?');
                updateValues.push(start_date);
            }
            if (end_date !== undefined) {
                updateFields.push('end_date = ?');
                updateValues.push(end_date);
            }
            
            if (updateFields.length > 0) {
                updateFields.push('updated_at = NOW()');
                updateValues.push(seasonId);
                
                const updateQuery = `UPDATE seasons SET ${updateFields.join(', ')} WHERE id = ?`;
                const result = await conn.query(updateQuery, updateValues);
                
                console.log(`[DEBUG] Season updated, affected rows: ${result.affectedRows}`);
            }
            
            await conn.commit();
            
            return await this.getSeasonById(seasonId);
        } catch (error) {
            await conn.rollback();
            console.error(`[ERROR] Failed to update season ${seasonId}:`, error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Definir une saison comme courante
     */
    static async setCurrentSeason(seasonId) {
        const conn = await db.pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            console.log(`[DEBUG] Setting season ${seasonId} as current`);
            
            // Verifier que la saison existe
            const existingCheck = await conn.query(
                "SELECT id FROM seasons WHERE id = ?", 
                [seasonId]
            );
            
            if (existingCheck.length === 0) {
                throw new Error('Saison non trouvee');
            }
            
            // Desactiver toutes les saisons courantes
            await conn.query("UPDATE seasons SET is_current = 0, updated_at = NOW()");
            
            // Activer la saison selectionnee
            const result = await conn.query(
                "UPDATE seasons SET is_current = 1, updated_at = NOW() WHERE id = ?", 
                [seasonId]
            );
            
            console.log(`[DEBUG] Season ${seasonId} set as current, affected rows: ${result.affectedRows}`);
            
            await conn.commit();
            
            return await this.getSeasonById(seasonId);
        } catch (error) {
            await conn.rollback();
            console.error(`[ERROR] Failed to set current season ${seasonId}:`, error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer une saison (avec verification des dependances)
     */
    static async deleteSeason(seasonId) {
        const conn = await db.pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            console.log(`[DEBUG] Attempting to delete season ${seasonId}`);
            
            // Verifier que la saison existe
            const existingCheck = await conn.query(
                "SELECT id, name, is_current FROM seasons WHERE id = ?", 
                [seasonId]
            );
            
            if (existingCheck.length === 0) {
                throw new Error('Saison non trouvee');
            }
            
            const season = existingCheck[0];
            
            // Interdire la suppression de la saison courante
            if (season.is_current === 1) {
                throw new Error('Impossible de supprimer la saison courante');
            }
            
            // Verifier les dependances - adhesions
            const membershipCheck = await conn.query(
                "SELECT COUNT(*) as count FROM memberships WHERE id_season = ?", 
                [seasonId]
            );
            
            if (membershipCheck[0].count > 0) {
                throw new Error('Impossible de supprimer une saison avec des adhesions existantes');
            }
            
            // Verifier les dependances - emprunts
            const borrowingCheck = await conn.query(
                "SELECT COUNT(*) as count FROM borrowings WHERE id_season = ?", 
                [seasonId]
            );
            
            if (borrowingCheck[0].count > 0) {
                throw new Error('Impossible de supprimer une saison avec des emprunts existants');
            }
            
            // Supprimer la saison
            const result = await conn.query(
                "DELETE FROM seasons WHERE id = ?", 
                [seasonId]
            );
            
            console.log(`[DEBUG] Season ${seasonId} deleted, affected rows: ${result.affectedRows}`);
            
            await conn.commit();
            
            return result;
        } catch (error) {
            await conn.rollback();
            console.error(`[ERROR] Failed to delete season ${seasonId}:`, error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Recuperer les statistiques d'une saison
     */
    static async getSeasonStats(seasonId) {
        const stats = {};
        
        // Nombre total de membres
        const memberResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM memberships WHERE id_season = ?", 
            [seasonId]
        );
        stats.totalMembers = memberResult[0].count;
        
        // Nombre total d'emprunts
        const borrowingResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE id_season = ?", 
            [seasonId]
        );
        stats.totalBorrowings = borrowingResult[0].count;
        
        // Emprunts en cours
        const currentBorrowingResult = await db.pool.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE id_season = ? AND return_date IS NULL", 
            [seasonId]
        );
        stats.activeBorrowings = currentBorrowingResult[0].count;
        
        // Jeux les plus empruntes
        const popularGamesResult = await db.pool.query(`
            SELECT 
                g.id,
                g.name as game_name,
                COUNT(b.id) as borrow_count
            FROM borrowings b
            JOIN games g ON b.id_game = g.id
            WHERE b.id_season = ?
            GROUP BY b.id_game, g.name
            ORDER BY borrow_count DESC
            LIMIT 5
        `, [seasonId]);
        stats.popularGames = popularGamesResult;
        
        // Membres les plus actifs
        const activeMembersResult = await db.pool.query(`
            SELECT 
                m.id,
                m.name as member_lastname,
                m.firstname as member_firstname,
                COUNT(b.id) as borrow_count
            FROM borrowings b
            JOIN members m ON b.id_member = m.id
            WHERE b.id_season = ?
            GROUP BY b.id_member, m.name, m.firstname
            ORDER BY borrow_count DESC
            LIMIT 5
        `, [seasonId]);
        stats.activeMembers = activeMembersResult;
        
        // Nouveaux membres (n'etaient pas dans la saison precedente)
        const newMembersResult = await db.pool.query(`
            SELECT COUNT(*) as count 
            FROM memberships ms 
            WHERE ms.id_season = ? 
            AND ms.id_member NOT IN (
                SELECT ms2.id_member 
                FROM memberships ms2 
                JOIN seasons s2 ON ms2.id_season = s2.id 
                WHERE s2.id < ? 
            )
        `, [seasonId, seasonId]);
        stats.newMembers = newMembersResult[0].count;
        
        return stats;
    }

    /**
     * Recuperer les adhesions d'une saison
     */
    static async getSeasonMemberships(seasonId) {
        const query = `
            SELECT 
                m.id,
                m.name,
                m.firstname,
                m.email,
                m.phone_number,
                m.picture,
                ms.deposit,
                ms.id_season
            FROM memberships ms
            JOIN members m ON ms.id_member = m.id
            WHERE ms.id_season = ?
            ORDER BY m.name, m.firstname
        `;
        const result = await db.pool.query(query, [seasonId]);
        return result;
    }

    /**
     * Recuperer les emprunts d'une saison
     */
    static async getSeasonBorrowings(seasonId) {
        const query = `
            SELECT 
                b.id,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.name as member_lastname,
                m.firstname as member_firstname,
                g.name as game_name
            FROM borrowings b
            JOIN members m ON b.id_member = m.id
            JOIN games g ON b.id_game = g.id
            WHERE b.id_season = ?
            ORDER BY b.borrow_date DESC
        `;
        const result = await db.pool.query(query, [seasonId]);
        return result;
    }

    /**
     * Archiver une saison (marquer comme archivee sans supprimer)
     */
    static async archiveSeason(seasonId) {
        const conn = await db.pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            console.log(`[DEBUG] Archiving season ${seasonId}`);
            
            // Verifier que la saison existe et n'est pas courante
            const existingCheck = await conn.query(
                "SELECT id, is_current FROM seasons WHERE id = ?", 
                [seasonId]
            );
            
            if (existingCheck.length === 0) {
                throw new Error('Saison non trouvee');
            }
            
            if (existingCheck[0].is_current === 1) {
                throw new Error('Impossible d\'archiver la saison courante');
            }
            
            // Marquer comme archivee (si le champ existe)
            const result = await conn.query(
                "UPDATE seasons SET is_archived = 1, updated_at = NOW() WHERE id = ?", 
                [seasonId]
            );
            
            console.log(`[DEBUG] Season ${seasonId} archived, affected rows: ${result.affectedRows}`);
            
            await conn.commit();
            
            return await this.getSeasonById(seasonId);
        } catch (error) {
            await conn.rollback();
            console.error(`[ERROR] Failed to archive season ${seasonId}:`, error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Valider les donnees d'une saison
     */
    static validateSeasonData(seasonData, excludeId = null) {
        const errors = [];
        const { name, start_date, end_date } = seasonData;
        
        // Nom requis
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Le nom de la saison est requis');
        } else if (name.trim().length > 100) {
            errors.push('Le nom de la saison ne peut pas depasser 100 caracteres');
        }
        
        // Validation des dates si fournies
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            
            if (isNaN(startDate.getTime())) {
                errors.push('La date de debut n\'est pas valide');
            }
            
            if (isNaN(endDate.getTime())) {
                errors.push('La date de fin n\'est pas valide');
            }
            
            if (startDate >= endDate) {
                errors.push('La date de debut doit etre anterieure a la date de fin');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifier si une saison existe
     */
    static async seasonExists(seasonId) {
        const result = await db.pool.query(
            "SELECT COUNT(*) as count FROM seasons WHERE id = ?", 
            [seasonId]
        );
        return result[0].count > 0;
    }

    /**
     * Obtenir les analyses avancees d'une saison
     */
    static async getSeasonAnalytics(seasonId) {
        const analytics = await this.getSeasonStats(seasonId);
        
        // Ajouter des analyses temporelles
        const monthlyBorrowingsResult = await db.pool.query(`
            SELECT 
                YEAR(b.borrow_date) as year,
                MONTH(b.borrow_date) as month,
                COUNT(*) as borrow_count
            FROM borrowings b
            WHERE b.id_season = ?
            GROUP BY YEAR(b.borrow_date), MONTH(b.borrow_date)
            ORDER BY year, month
        `, [seasonId]);
        analytics.monthlyBorrowings = monthlyBorrowingsResult;
        
        // Taux de retour
        const returnRateResult = await db.pool.query(`
            SELECT 
                COUNT(*) as total_borrowings,
                COUNT(return_date) as returned_borrowings
            FROM borrowings 
            WHERE id_season = ?
        `, [seasonId]);
        
        if (returnRateResult[0].total_borrowings > 0) {
            analytics.returnRate = Math.round((returnRateResult[0].returned_borrowings / returnRateResult[0].total_borrowings) * 100);
        } else {
            analytics.returnRate = 0;
        }
        
        return analytics;
    }
}

module.exports = SeasonsService;