const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mysql = require('mysql2');
const dbConfig = require('../middleware/db');

// Get user preferences
router.get('/', auth, async (req, res) => {
  try {
    const connection = mysql.createConnection(dbConfig);
    
    const query = `
      SELECT 
        theme, 
        language, 
        notifications_enabled,
        notification_types,
        keyboard_shortcuts_enabled,
        custom_shortcuts,
        dashboard_widgets,
        items_per_page,
        date_format
      FROM user_preferences 
      WHERE user_id = ?
    `;
    
    connection.query(query, [req.user.userId], (error, results) => {
      connection.end();
      
      if (error) {
        console.error('Error fetching preferences:', error);
        return res.serverError('Erreur lors de la recuperation des preferences');
      }
      
      // If no preferences exist, return defaults
      if (results.length === 0) {
        const defaultPreferences = {
          theme: 'auto',
          language: 'fr',
          notifications_enabled: true,
          notification_types: ['borrowing', 'return', 'overdue'],
          keyboard_shortcuts_enabled: true,
          custom_shortcuts: {},
          dashboard_widgets: ['stats', 'recent', 'popular', 'charts'],
          items_per_page: 10,
          date_format: 'dd/mm/yyyy'
        };
        return res.success(defaultPreferences);
      }
      
      const preferences = {
        ...results[0],
        notification_types: JSON.parse(results[0].notification_types || '[]'),
        custom_shortcuts: JSON.parse(results[0].custom_shortcuts || '{}'),
        dashboard_widgets: JSON.parse(results[0].dashboard_widgets || '[]')
      };
      
      res.success(preferences);
    });
  } catch (error) {
    console.error('Error in GET /preferences:', error);
    res.serverError('Erreur serveur');
  }
});

// Update user preferences
router.put('/', auth, async (req, res) => {
  try {
    const {
      theme,
      language,
      notifications_enabled,
      notification_types,
      keyboard_shortcuts_enabled,
      custom_shortcuts,
      dashboard_widgets,
      items_per_page,
      date_format
    } = req.body;
    
    const connection = mysql.createConnection(dbConfig);
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        // Update existing preferences
        query = `
          UPDATE user_preferences SET 
            theme = ?,
            language = ?,
            notifications_enabled = ?,
            notification_types = ?,
            keyboard_shortcuts_enabled = ?,
            custom_shortcuts = ?,
            dashboard_widgets = ?,
            items_per_page = ?,
            date_format = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;
        params = [
          theme,
          language,
          notifications_enabled,
          JSON.stringify(notification_types),
          keyboard_shortcuts_enabled,
          JSON.stringify(custom_shortcuts),
          JSON.stringify(dashboard_widgets),
          items_per_page,
          date_format,
          req.user.userId
        ];
      } else {
        // Insert new preferences
        query = `
          INSERT INTO user_preferences (
            user_id,
            theme,
            language,
            notifications_enabled,
            notification_types,
            keyboard_shortcuts_enabled,
            custom_shortcuts,
            dashboard_widgets,
            items_per_page,
            date_format
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        params = [
          req.user.userId,
          theme,
          language,
          notifications_enabled,
          JSON.stringify(notification_types),
          keyboard_shortcuts_enabled,
          JSON.stringify(custom_shortcuts),
          JSON.stringify(dashboard_widgets),
          items_per_page,
          date_format
        ];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error updating preferences:', error);
          return res.serverError('Erreur lors de la mise a jour des preferences');
        }
        
        res.success({ message: 'Preferences mises a jour avec succes' });
      });
    });
  } catch (error) {
    console.error('Error in PUT /preferences:', error);
    res.serverError('Erreur serveur');
  }
});

// Update theme only
router.put('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark', 'auto'].includes(theme)) {
      return res.badRequest('Theme invalide');
    }
    
    const connection = mysql.createConnection(dbConfig);
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        query = 'UPDATE user_preferences SET theme = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
        params = [theme, req.user.userId];
      } else {
        query = 'INSERT INTO user_preferences (user_id, theme) VALUES (?, ?)';
        params = [req.user.userId, theme];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error updating theme:', error);
          return res.serverError('Erreur lors de la mise a jour du theme');
        }
        
        res.success({ message: 'Theme mis a jour avec succes' });
      });
    });
  } catch (error) {
    console.error('Error in PUT /preferences/theme:', error);
    res.serverError('Erreur serveur');
  }
});

// Update language only
router.put('/language', auth, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!['fr', 'en'].includes(language)) {
      return res.badRequest('Langue invalide');
    }
    
    const connection = mysql.createConnection(dbConfig);
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        query = 'UPDATE user_preferences SET language = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
        params = [language, req.user.userId];
      } else {
        query = 'INSERT INTO user_preferences (user_id, language) VALUES (?, ?)';
        params = [req.user.userId, language];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error updating language:', error);
          return res.serverError('Erreur lors de la mise a jour de la langue');
        }
        
        res.success({ message: 'Langue mise a jour avec succes' });
      });
    });
  } catch (error) {
    console.error('Error in PUT /preferences/language:', error);
    res.serverError('Erreur serveur');
  }
});

// Update notifications only
router.put('/notifications', auth, async (req, res) => {
  try {
    const { notifications_enabled, notification_types } = req.body;
    
    const connection = mysql.createConnection(dbConfig);
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        query = `
          UPDATE user_preferences SET 
            notifications_enabled = ?, 
            notification_types = ?, 
            updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = ?
        `;
        params = [notifications_enabled, JSON.stringify(notification_types), req.user.userId];
      } else {
        query = `
          INSERT INTO user_preferences (user_id, notifications_enabled, notification_types) 
          VALUES (?, ?, ?)
        `;
        params = [req.user.userId, notifications_enabled, JSON.stringify(notification_types)];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error updating notifications:', error);
          return res.serverError('Erreur lors de la mise a jour des notifications');
        }
        
        res.success({ message: 'Notifications mises a jour avec succes' });
      });
    });
  } catch (error) {
    console.error('Error in PUT /preferences/notifications:', error);
    res.serverError('Erreur serveur');
  }
});

// Update shortcuts only
router.put('/shortcuts', auth, async (req, res) => {
  try {
    const { keyboard_shortcuts_enabled, custom_shortcuts } = req.body;
    
    const connection = mysql.createConnection(dbConfig);
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        query = `
          UPDATE user_preferences SET 
            keyboard_shortcuts_enabled = ?, 
            custom_shortcuts = ?, 
            updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = ?
        `;
        params = [keyboard_shortcuts_enabled, JSON.stringify(custom_shortcuts), req.user.userId];
      } else {
        query = `
          INSERT INTO user_preferences (user_id, keyboard_shortcuts_enabled, custom_shortcuts) 
          VALUES (?, ?, ?)
        `;
        params = [req.user.userId, keyboard_shortcuts_enabled, JSON.stringify(custom_shortcuts)];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error updating shortcuts:', error);
          return res.serverError('Erreur lors de la mise a jour des raccourcis');
        }
        
        res.success({ message: 'Raccourcis mis a jour avec succes' });
      });
    });
  } catch (error) {
    console.error('Error in PUT /preferences/shortcuts:', error);
    res.serverError('Erreur serveur');
  }
});

// Reset preferences to defaults
router.post('/reset', auth, async (req, res) => {
  try {
    const connection = mysql.createConnection(dbConfig);
    
    const defaultPreferences = {
      theme: 'auto',
      language: 'fr',
      notifications_enabled: true,
      notification_types: ['borrowing', 'return', 'overdue'],
      keyboard_shortcuts_enabled: true,
      custom_shortcuts: {},
      dashboard_widgets: ['stats', 'recent', 'popular', 'charts'],
      items_per_page: 10,
      date_format: 'dd/mm/yyyy'
    };
    
    // Check if preferences exist
    const checkQuery = 'SELECT user_id FROM user_preferences WHERE user_id = ?';
    
    connection.query(checkQuery, [req.user.userId], (error, results) => {
      if (error) {
        connection.end();
        console.error('Error checking preferences:', error);
        return res.serverError('Erreur lors de la verification des preferences');
      }
      
      const preferencesExist = results.length > 0;
      let query;
      let params;
      
      if (preferencesExist) {
        // Update existing preferences with defaults
        query = `
          UPDATE user_preferences SET 
            theme = ?,
            language = ?,
            notifications_enabled = ?,
            notification_types = ?,
            keyboard_shortcuts_enabled = ?,
            custom_shortcuts = ?,
            dashboard_widgets = ?,
            items_per_page = ?,
            date_format = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;
        params = [
          defaultPreferences.theme,
          defaultPreferences.language,
          defaultPreferences.notifications_enabled,
          JSON.stringify(defaultPreferences.notification_types),
          defaultPreferences.keyboard_shortcuts_enabled,
          JSON.stringify(defaultPreferences.custom_shortcuts),
          JSON.stringify(defaultPreferences.dashboard_widgets),
          defaultPreferences.items_per_page,
          defaultPreferences.date_format,
          req.user.userId
        ];
      } else {
        // Insert new preferences with defaults
        query = `
          INSERT INTO user_preferences (
            user_id,
            theme,
            language,
            notifications_enabled,
            notification_types,
            keyboard_shortcuts_enabled,
            custom_shortcuts,
            dashboard_widgets,
            items_per_page,
            date_format
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        params = [
          req.user.userId,
          defaultPreferences.theme,
          defaultPreferences.language,
          defaultPreferences.notifications_enabled,
          JSON.stringify(defaultPreferences.notification_types),
          defaultPreferences.keyboard_shortcuts_enabled,
          JSON.stringify(defaultPreferences.custom_shortcuts),
          JSON.stringify(defaultPreferences.dashboard_widgets),
          defaultPreferences.items_per_page,
          defaultPreferences.date_format
        ];
      }
      
      connection.query(query, params, (error, results) => {
        connection.end();
        
        if (error) {
          console.error('Error resetting preferences:', error);
          return res.serverError('Erreur lors de la reinitialisation des preferences');
        }
        
        res.success({ 
          message: 'Preferences reinitialisees avec succes',
          preferences: defaultPreferences
        });
      });
    });
  } catch (error) {
    console.error('Error in POST /preferences/reset:', error);
    res.serverError('Erreur serveur');
  }
});

module.exports = router;