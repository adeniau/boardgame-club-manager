#!/usr/bin/env node

// Script to migrate existing images to shared volume and update database URLs

const fs = require('fs');
const mariadb = require('mariadb');

// Database connection
const pool = mariadb.createPool({
    host: 'db',
    port: 3306,
    user: 'bcm_user',
    password: 'password',
    database: 'BCM'
});

async function migrateImages() {
    console.log('🔄 Starting image migration...');
    
    try {
        // Create shared-images directory if it doesn't exist
        if (!fs.existsSync('shared-images')) {
            fs.mkdirSync('shared-images', { recursive: true });
            console.log('📁 Created shared-images directory');
        }

        // Get all games with images
        const games = await pool.query("SELECT id, name, picture FROM games WHERE picture != '' AND picture IS NOT NULL");
        console.log(`📊 Found ${games.length} games with images to migrate`);

        let migratedCount = 0;
        let updatedCount = 0;

        for (const game of games) {
            let filename = game.picture;
            let newUrl = '';
            
            // Extract filename from different formats
            if (filename.startsWith('http://') || filename.startsWith('https://')) {
                // Old format: full URL
                const url = new URL(filename);
                filename = url.pathname.split('/images/')[1];
                console.log(`🔗 Game "${game.name}": Converting URL to filename: ${filename}`);
            } else if (filename.startsWith('/images/')) {
                // New format: already a relative URL
                filename = filename.split('/images/')[1];
                console.log(`✅ Game "${game.name}": Already in new format`);
                continue;
            }
            // else: just a filename (current format after recent changes)
            
            if (filename && filename.length > 0) {
                const sourcePath = `images/${filename}`;
                const destPath = `shared-images/${filename}`;
                
                // Check if source file exists
                if (fs.existsSync(sourcePath)) {
                    try {
                        // Copy to shared volume
                        fs.copyFileSync(sourcePath, destPath);
                        console.log(`📋 Copied: ${sourcePath} → ${destPath}`);
                        migratedCount++;
                        
                        // Update database with relative URL
                        newUrl = `/images/${filename}`;
                        await pool.query("UPDATE games SET picture = ? WHERE id = ?", [newUrl, game.id]);
                        console.log(`🗃️  Updated DB: Game "${game.name}" → ${newUrl}`);
                        updatedCount++;
                        
                    } catch (err) {
                        console.error(`❌ Error migrating ${filename}:`, err.message);
                    }
                } else {
                    console.warn(`⚠️  Source file not found: ${sourcePath} for game "${game.name}"`);
                }
            }
        }
        
        console.log('\n🎉 Migration completed!');
        console.log(`📋 Files migrated: ${migratedCount}`);
        console.log(`🗃️  Database records updated: ${updatedCount}`);
        
    } catch (err) {
        console.error('💥 Migration failed:', err);
    } finally {
        await pool.end();
    }
}

// Run migration
migrateImages().catch(console.error);