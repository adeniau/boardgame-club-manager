const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../middleware/db');

// Helper function to highlight matching text
const highlightText = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

// Helper function to escape SQL wildcards and create search patterns
const createSearchPattern = (query) => {
    if (!query) return '%';
    return `%${query.replace(/[%_]/g, '\\$&')}%`;
};

// Global search across all entities
router.get('/global', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, limit = 20 } = req.query;
    
    if (!query || query.trim().length < 2) {
        return res.success({
            results: [],
            totalCount: 0,
            categories: {
                games: [],
                members: [],
                borrowings: [],
                seasons: []
            }
        });
    }
    
    const searchPattern = createSearchPattern(query.trim());
    const resultLimit = Math.min(parseInt(limit), 100);
    
    const connection = await db.getConnection();
    
    try {
        // Search games
        const [gamesResults] = await connection.execute(`
            SELECT 
                id,
                name,
                picture,
                available,
                'game' as type,
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) THEN 90
                    ELSE 70
                END as score
            FROM games 
            WHERE name LIKE ?
            ORDER BY score DESC, name ASC
            LIMIT ?
        `, [query.trim(), `${query.trim()}%`, searchPattern, Math.ceil(resultLimit / 4)]);
        
        // Search members
        const [membersResults] = await connection.execute(`
            SELECT 
                id,
                name,
                firstname,
                email,
                picture,
                admin,
                'member' as type,
                CASE 
                    WHEN LOWER(CONCAT(name, ' ', firstname)) = LOWER(?) THEN 100
                    WHEN LOWER(CONCAT(firstname, ' ', name)) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) OR LOWER(firstname) LIKE LOWER(?) THEN 90
                    WHEN LOWER(email) LIKE LOWER(?) THEN 80
                    ELSE 70
                END as score
            FROM members 
            WHERE name LIKE ? OR firstname LIKE ? OR email LIKE ?
            ORDER BY score DESC, name ASC, firstname ASC
            LIMIT ?
        `, [
            query.trim(), query.trim(), `${query.trim()}%`, `${query.trim()}%`, 
            searchPattern, searchPattern, searchPattern, searchPattern, 
            Math.ceil(resultLimit / 4)
        ]);
        
        // Search borrowings (with related member and game info)
        const [borrowingsResults] = await connection.execute(`
            SELECT DISTINCT
                b.id,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.name as member_name,
                m.firstname as member_firstname,
                g.name as game_name,
                g.picture as game_picture,
                s.name as season_name,
                'borrowing' as type,
                CASE 
                    WHEN LOWER(g.name) LIKE LOWER(?) THEN 90
                    WHEN LOWER(CONCAT(m.name, ' ', m.firstname)) LIKE LOWER(?) THEN 85
                    WHEN b.comment IS NOT NULL AND LOWER(b.comment) LIKE LOWER(?) THEN 75
                    ELSE 70
                END as score
            FROM borrowings b
            INNER JOIN members m ON b.id_member = m.id
            INNER JOIN games g ON b.id_game = g.id
            INNER JOIN seasons s ON b.id_season = s.id
            WHERE g.name LIKE ? 
               OR CONCAT(m.name, ' ', m.firstname) LIKE ?
               OR (b.comment IS NOT NULL AND b.comment LIKE ?)
            ORDER BY score DESC, b.borrow_date DESC
            LIMIT ?
        `, [
            searchPattern, searchPattern, searchPattern, 
            searchPattern, searchPattern, searchPattern, 
            Math.ceil(resultLimit / 4)
        ]);
        
        // Search seasons
        const [seasonsResults] = await connection.execute(`
            SELECT 
                id,
                name,
                description,
                start_date,
                end_date,
                is_current,
                'season' as type,
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) THEN 90
                    WHEN description IS NOT NULL AND LOWER(description) LIKE LOWER(?) THEN 80
                    ELSE 70
                END as score
            FROM seasons 
            WHERE name LIKE ? 
               OR (description IS NOT NULL AND description LIKE ?)
            ORDER BY score DESC, is_current DESC, name ASC
            LIMIT ?
        `, [
            query.trim(), `${query.trim()}%`, searchPattern,
            searchPattern, searchPattern, 
            Math.ceil(resultLimit / 4)
        ]);
        
        // Format results with highlights
        const formatResults = (results, type) => {
            return results.map(result => {
                let title, description, metadata;
                
                switch (type) {
                    case 'game':
                        title = highlightText(result.name, query);
                        description = `Jeu ${result.available === '1' ? 'disponible' : 'emprunté'}`;
                        metadata = {
                            available: result.available,
                            picture: result.picture
                        };
                        break;
                    case 'member':
                        title = highlightText(`${result.firstname} ${result.name}`, query);
                        description = highlightText(result.email, query);
                        metadata = {
                            isAdmin: result.admin === '1',
                            picture: result.picture,
                            email: result.email
                        };
                        break;
                    case 'borrowing':
                        title = `${highlightText(result.game_name, query)} emprunté par ${highlightText(`${result.member_firstname} ${result.member_name}`, query)}`;
                        description = `${result.borrow_date}${result.return_date ? ` - ${result.return_date}` : ' (en cours)'}`;
                        if (result.comment) {
                            description += ` - ${highlightText(result.comment, query)}`;
                        }
                        metadata = {
                            memberName: `${result.member_firstname} ${result.member_name}`,
                            gameName: result.game_name,
                            seasonName: result.season_name,
                            isActive: !result.return_date,
                            comment: result.comment,
                            gamePicture: result.game_picture
                        };
                        break;
                    case 'season':
                        title = highlightText(result.name, query);
                        description = result.description ? highlightText(result.description, query) : 
                                    `${result.start_date} - ${result.end_date}`;
                        metadata = {
                            isCurrent: result.is_current === 1,
                            startDate: result.start_date,
                            endDate: result.end_date,
                            description: result.description
                        };
                        break;
                }
                
                return {
                    id: result.id.toString(),
                    type,
                    title,
                    description,
                    score: result.score,
                    metadata
                };
            });
        };
        
        const games = formatResults(gamesResults, 'game');
        const members = formatResults(membersResults, 'member');
        const borrowings = formatResults(borrowingsResults, 'borrowing');
        const seasons = formatResults(seasonsResults, 'season');
        
        // Combine and sort all results by score
        const allResults = [...games, ...members, ...borrowings, ...seasons]
            .sort((a, b) => b.score - a.score)
            .slice(0, resultLimit);
        
        const totalCount = games.length + members.length + borrowings.length + seasons.length;
        
        res.success({
            results: allResults,
            totalCount,
            query: query.trim(),
            categories: {
                games: games.slice(0, 5),
                members: members.slice(0, 5),
                borrowings: borrowings.slice(0, 5),
                seasons: seasons.slice(0, 5)
            }
        });
        
    } finally {
        connection.release();
    }
}));

// Search games with filters
router.get('/games', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, available, limit = 20, offset = 0 } = req.query;
    
    const searchPattern = createSearchPattern(query);
    const resultLimit = Math.min(parseInt(limit), 100);
    const resultOffset = Math.max(parseInt(offset), 0);
    
    const connection = await db.getConnection();
    
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (query && query.trim()) {
            whereClause += ' AND name LIKE ?';
            params.push(searchPattern);
        }
        
        if (available !== undefined) {
            whereClause += ' AND available = ?';
            params.push(available === 'true' ? '1' : '0');
        }
        
        const [results] = await connection.execute(`
            SELECT 
                id,
                name,
                picture,
                available,
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) THEN 90
                    ELSE 70
                END as score
            FROM games 
            ${whereClause}
            ORDER BY score DESC, name ASC
            LIMIT ? OFFSET ?
        `, [query?.trim() || '', `${query?.trim() || ''}%`, ...params, resultLimit, resultOffset]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total FROM games ${whereClause}
        `, params);
        
        const formattedResults = results.map(game => ({
            id: game.id.toString(),
            type: 'game',
            title: query ? highlightText(game.name, query) : game.name,
            description: `Jeu ${game.available === '1' ? 'disponible' : 'emprunté'}`,
            score: game.score,
            metadata: {
                available: game.available,
                picture: game.picture,
                name: game.name
            }
        }));
        
        res.success({
            results: formattedResults,
            totalCount: countResult[0].total,
            query: query?.trim() || '',
            filters: { available }
        });
        
    } finally {
        connection.release();
    }
}));

// Search members with filters
router.get('/members', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, admin, limit = 20, offset = 0 } = req.query;
    
    const searchPattern = createSearchPattern(query);
    const resultLimit = Math.min(parseInt(limit), 100);
    const resultOffset = Math.max(parseInt(offset), 0);
    
    const connection = await db.getConnection();
    
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (query && query.trim()) {
            whereClause += ' AND (name LIKE ? OR firstname LIKE ? OR email LIKE ?)';
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        if (admin !== undefined) {
            whereClause += ' AND admin = ?';
            params.push(admin === 'true' ? '1' : '0');
        }
        
        const [results] = await connection.execute(`
            SELECT 
                id,
                name,
                firstname,
                email,
                picture,
                admin,
                CASE 
                    WHEN LOWER(CONCAT(name, ' ', firstname)) = LOWER(?) THEN 100
                    WHEN LOWER(CONCAT(firstname, ' ', name)) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) OR LOWER(firstname) LIKE LOWER(?) THEN 90
                    WHEN LOWER(email) LIKE LOWER(?) THEN 80
                    ELSE 70
                END as score
            FROM members 
            ${whereClause}
            ORDER BY score DESC, name ASC, firstname ASC
            LIMIT ? OFFSET ?
        `, [
            query?.trim() || '', query?.trim() || '', 
            `${query?.trim() || ''}%`, `${query?.trim() || ''}%`, searchPattern,
            ...params, resultLimit, resultOffset
        ]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total FROM members ${whereClause}
        `, params);
        
        const formattedResults = results.map(member => ({
            id: member.id.toString(),
            type: 'member',
            title: query ? highlightText(`${member.firstname} ${member.name}`, query) : `${member.firstname} ${member.name}`,
            description: query ? highlightText(member.email, query) : member.email,
            score: member.score,
            metadata: {
                isAdmin: member.admin === '1',
                picture: member.picture,
                email: member.email,
                name: member.name,
                firstname: member.firstname
            }
        }));
        
        res.success({
            results: formattedResults,
            totalCount: countResult[0].total,
            query: query?.trim() || '',
            filters: { admin }
        });
        
    } finally {
        connection.release();
    }
}));

// Search borrowings with filters
router.get('/borrowings', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, status, limit = 20, offset = 0 } = req.query;
    
    const searchPattern = createSearchPattern(query);
    const resultLimit = Math.min(parseInt(limit), 100);
    const resultOffset = Math.max(parseInt(offset), 0);
    
    const connection = await db.getConnection();
    
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (query && query.trim()) {
            whereClause += ' AND (g.name LIKE ? OR CONCAT(m.name, \' \', m.firstname) LIKE ? OR (b.comment IS NOT NULL AND b.comment LIKE ?))';
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        if (status === 'active') {
            whereClause += ' AND b.return_date IS NULL';
        } else if (status === 'returned') {
            whereClause += ' AND b.return_date IS NOT NULL';
        }
        
        const [results] = await connection.execute(`
            SELECT 
                b.id,
                b.borrow_date,
                b.return_date,
                b.comment,
                m.name as member_name,
                m.firstname as member_firstname,
                g.name as game_name,
                g.picture as game_picture,
                s.name as season_name,
                CASE 
                    WHEN LOWER(g.name) LIKE LOWER(?) THEN 90
                    WHEN LOWER(CONCAT(m.name, ' ', m.firstname)) LIKE LOWER(?) THEN 85
                    WHEN b.comment IS NOT NULL AND LOWER(b.comment) LIKE LOWER(?) THEN 75
                    ELSE 70
                END as score
            FROM borrowings b
            INNER JOIN members m ON b.id_member = m.id
            INNER JOIN games g ON b.id_game = g.id
            INNER JOIN seasons s ON b.id_season = s.id
            ${whereClause}
            ORDER BY score DESC, b.borrow_date DESC
            LIMIT ? OFFSET ?
        `, [
            searchPattern, searchPattern, searchPattern,
            ...params, resultLimit, resultOffset
        ]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total 
            FROM borrowings b
            INNER JOIN members m ON b.id_member = m.id
            INNER JOIN games g ON b.id_game = g.id
            INNER JOIN seasons s ON b.id_season = s.id
            ${whereClause}
        `, params);
        
        const formattedResults = results.map(borrowing => ({
            id: borrowing.id.toString(),
            type: 'borrowing',
            title: query ? 
                `${highlightText(borrowing.game_name, query)} emprunté par ${highlightText(`${borrowing.member_firstname} ${borrowing.member_name}`, query)}` :
                `${borrowing.game_name} emprunté par ${borrowing.member_firstname} ${borrowing.member_name}`,
            description: `${borrowing.borrow_date}${borrowing.return_date ? ` - ${borrowing.return_date}` : ' (en cours)'}` +
                        (borrowing.comment ? ` - ${query ? highlightText(borrowing.comment, query) : borrowing.comment}` : ''),
            score: borrowing.score,
            metadata: {
                memberName: `${borrowing.member_firstname} ${borrowing.member_name}`,
                gameName: borrowing.game_name,
                seasonName: borrowing.season_name,
                isActive: !borrowing.return_date,
                comment: borrowing.comment,
                gamePicture: borrowing.game_picture,
                borrowDate: borrowing.borrow_date,
                returnDate: borrowing.return_date
            }
        }));
        
        res.success({
            results: formattedResults,
            totalCount: countResult[0].total,
            query: query?.trim() || '',
            filters: { status }
        });
        
    } finally {
        connection.release();
    }
}));

// Search seasons with filters
router.get('/seasons', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, current, limit = 20, offset = 0 } = req.query;
    
    const searchPattern = createSearchPattern(query);
    const resultLimit = Math.min(parseInt(limit), 100);
    const resultOffset = Math.max(parseInt(offset), 0);
    
    const connection = await db.getConnection();
    
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (query && query.trim()) {
            whereClause += ' AND (name LIKE ? OR (description IS NOT NULL AND description LIKE ?))';
            params.push(searchPattern, searchPattern);
        }
        
        if (current !== undefined) {
            whereClause += ' AND is_current = ?';
            params.push(current === 'true' ? 1 : 0);
        }
        
        const [results] = await connection.execute(`
            SELECT 
                id,
                name,
                description,
                start_date,
                end_date,
                is_current,
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 100
                    WHEN LOWER(name) LIKE LOWER(?) THEN 90
                    WHEN description IS NOT NULL AND LOWER(description) LIKE LOWER(?) THEN 80
                    ELSE 70
                END as score
            FROM seasons 
            ${whereClause}
            ORDER BY score DESC, is_current DESC, name ASC
            LIMIT ? OFFSET ?
        `, [
            query?.trim() || '', `${query?.trim() || ''}%`, searchPattern,
            ...params, resultLimit, resultOffset
        ]);
        
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as total FROM seasons ${whereClause}
        `, params);
        
        const formattedResults = results.map(season => ({
            id: season.id.toString(),
            type: 'season',
            title: query ? highlightText(season.name, query) : season.name,
            description: season.description ? 
                (query ? highlightText(season.description, query) : season.description) :
                `${season.start_date} - ${season.end_date}`,
            score: season.score,
            metadata: {
                isCurrent: season.is_current === 1,
                startDate: season.start_date,
                endDate: season.end_date,
                description: season.description,
                name: season.name
            }
        }));
        
        res.success({
            results: formattedResults,
            totalCount: countResult[0].total,
            query: query?.trim() || '',
            filters: { current }
        });
        
    } finally {
        connection.release();
    }
}));

// Get search suggestions for autocomplete
router.get('/suggestions', authenticateToken, asyncHandler(async (req, res) => {
    const { q: query, type, limit = 8 } = req.query;
    
    if (!query || query.trim().length < 1) {
        return res.success({ suggestions: [] });
    }
    
    const searchPattern = `${query.trim()}%`;
    const resultLimit = Math.min(parseInt(limit), 20);
    
    const connection = await db.getConnection();
    
    try {
        let suggestions = [];
        
        if (!type || type === 'all') {
            // Get suggestions from all entities
            const [gamesSuggestions] = await connection.execute(`
                SELECT DISTINCT name as text, 'game' as entityType, COUNT(*) as count
                FROM games 
                WHERE name LIKE ?
                GROUP BY name
                ORDER BY name ASC
                LIMIT ?
            `, [searchPattern, Math.ceil(resultLimit / 4)]);
            
            const [membersSuggestions] = await connection.execute(`
                SELECT DISTINCT 
                    CONCAT(firstname, ' ', name) as text, 
                    'member' as entityType,
                    COUNT(*) as count
                FROM members 
                WHERE name LIKE ? OR firstname LIKE ?
                GROUP BY firstname, name
                ORDER BY firstname ASC, name ASC
                LIMIT ?
            `, [searchPattern, searchPattern, Math.ceil(resultLimit / 4)]);
            
            const [seasonsSuggestions] = await connection.execute(`
                SELECT DISTINCT name as text, 'season' as entityType, COUNT(*) as count
                FROM seasons 
                WHERE name LIKE ?
                GROUP BY name
                ORDER BY is_current DESC, name ASC
                LIMIT ?
            `, [searchPattern, Math.ceil(resultLimit / 4)]);
            
            suggestions = [
                ...gamesSuggestions.map(s => ({ ...s, type: 'entity' })),
                ...membersSuggestions.map(s => ({ ...s, type: 'entity' })),
                ...seasonsSuggestions.map(s => ({ ...s, type: 'entity' }))
            ];
        } else {
            // Get suggestions for specific entity type
            switch (type) {
                case 'games':
                    const [gamesSuggestions] = await connection.execute(`
                        SELECT DISTINCT name as text, 'game' as entityType, COUNT(*) as count
                        FROM games 
                        WHERE name LIKE ?
                        GROUP BY name
                        ORDER BY name ASC
                        LIMIT ?
                    `, [searchPattern, resultLimit]);
                    suggestions = gamesSuggestions.map(s => ({ ...s, type: 'entity' }));
                    break;
                    
                case 'members':
                    const [membersSuggestions] = await connection.execute(`
                        SELECT DISTINCT 
                            CONCAT(firstname, ' ', name) as text, 
                            'member' as entityType,
                            COUNT(*) as count
                        FROM members 
                        WHERE name LIKE ? OR firstname LIKE ?
                        GROUP BY firstname, name
                        ORDER BY firstname ASC, name ASC
                        LIMIT ?
                    `, [searchPattern, searchPattern, resultLimit]);
                    suggestions = membersSuggestions.map(s => ({ ...s, type: 'entity' }));
                    break;
                    
                case 'seasons':
                    const [seasonsSuggestions] = await connection.execute(`
                        SELECT DISTINCT name as text, 'season' as entityType, COUNT(*) as count
                        FROM seasons 
                        WHERE name LIKE ?
                        GROUP BY name
                        ORDER BY is_current DESC, name ASC
                        LIMIT ?
                    `, [searchPattern, resultLimit]);
                    suggestions = seasonsSuggestions.map(s => ({ ...s, type: 'entity' }));
                    break;
            }
        }
        
        // Sort suggestions by relevance
        suggestions.sort((a, b) => {
            // Exact matches first
            if (a.text.toLowerCase().startsWith(query.toLowerCase()) && !b.text.toLowerCase().startsWith(query.toLowerCase())) {
                return -1;
            }
            if (!a.text.toLowerCase().startsWith(query.toLowerCase()) && b.text.toLowerCase().startsWith(query.toLowerCase())) {
                return 1;
            }
            return a.text.localeCompare(b.text);
        });
        
        res.success({
            suggestions: suggestions.slice(0, resultLimit),
            query: query.trim()
        });
        
    } finally {
        connection.release();
    }
}));

module.exports = router;