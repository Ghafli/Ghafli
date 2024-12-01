import { db, auth } from '../../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

class CustomizationService {
    constructor() {
        this.currentUser = auth.currentUser;
        this.userPrefsRef = collection(db, 'user_preferences');
        this.initializeThemeListener();
    }

    // Theme definitions
    static THEMES = {
        LIGHT: {
            name: 'light',
            colors: {
                primary: '#4A90E2',
                background: '#FFFFFF',
                surface: '#F8F9FA',
                text: '#212529',
                textSecondary: '#6C757D',
                border: '#DEE2E6'
            }
        },
        DARK: {
            name: 'dark',
            colors: {
                primary: '#61DAFB',
                background: '#1A1A1A',
                surface: '#2D2D2D',
                text: '#FFFFFF',
                textSecondary: '#CCCCCC',
                border: '#404040'
            }
        }
    };

    // Font options
    static FONTS = {
        SYSTEM: {
            name: 'System Default',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        },
        READABLE: {
            name: 'Readable',
            family: 'Georgia, "Times New Roman", Times, serif'
        },
        MODERN: {
            name: 'Modern',
            family: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI"'
        },
        DYSLEXIC: {
            name: 'Dyslexic Friendly',
            family: 'OpenDyslexic, Comic Sans MS, cursive'
        }
    };

    // Card style presets
    static CARD_STYLES = {
        CLASSIC: {
            name: 'Classic',
            borderRadius: '10px',
            shadow: '0 2px 4px rgba(0,0,0,0.1)',
            gradient: 'none'
        },
        MODERN: {
            name: 'Modern',
            borderRadius: '20px',
            shadow: '0 8px 16px rgba(0,0,0,0.1)',
            gradient: 'linear-gradient(135deg, var(--surface-color) 0%, var(--surface-color-light) 100%)'
        },
        MINIMAL: {
            name: 'Minimal',
            borderRadius: '4px',
            shadow: 'none',
            border: '1px solid var(--border-color)'
        }
    };

    /**
     * Initialize theme listener
     */
    initializeThemeListener() {
        // Watch for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                this.handleSystemThemeChange(e.matches);
            });
    }

    /**
     * Handle system theme change
     * @param {boolean} isDark - Whether system theme is dark
     */
    async handleSystemThemeChange(isDark) {
        const prefs = await this.getUserPreferences();
        if (prefs.themeMode === 'system') {
            this.applyTheme(isDark ? 'dark' : 'light');
        }
    }

    /**
     * Get user preferences
     * @returns {Promise<Object>} User preferences
     */
    async getUserPreferences() {
        try {
            const prefsRef = doc(this.userPrefsRef, this.currentUser.uid);
            const prefsDoc = await getDoc(prefsRef);

            if (prefsDoc.exists()) {
                return prefsDoc.data();
            }

            // Default preferences
            const defaultPrefs = {
                themeMode: 'system', // 'system', 'light', or 'dark'
                theme: CustomizationService.THEMES.LIGHT.name,
                font: CustomizationService.FONTS.SYSTEM.name,
                cardStyle: CustomizationService.CARD_STYLES.CLASSIC.name,
                fontSize: 16,
                animations: true,
                customColors: null
            };

            await setDoc(prefsRef, defaultPrefs);
            return defaultPrefs;
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            throw error;
        }
    }

    /**
     * Update user preferences
     * @param {Object} preferences - New preferences
     */
    async updatePreferences(preferences) {
        try {
            const prefsRef = doc(this.userPrefsRef, this.currentUser.uid);
            await updateDoc(prefsRef, preferences);
            this.applyPreferences(preferences);
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    }

    /**
     * Apply theme to document
     * @param {string} themeName - Theme name
     */
    applyTheme(themeName) {
        const theme = CustomizationService.THEMES[themeName.toUpperCase()];
        if (!theme) return;

        document.documentElement.setAttribute('data-theme', themeName);
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        });
    }

    /**
     * Apply font settings
     * @param {Object} fontSettings - Font settings
     */
    applyFontSettings(fontSettings) {
        const font = CustomizationService.FONTS[fontSettings.font.toUpperCase()];
        if (!font) return;

        document.documentElement.style.setProperty('--font-family', font.family);
        document.documentElement.style.setProperty('--font-size-base', `${fontSettings.fontSize}px`);
    }

    /**
     * Apply card style
     * @param {string} styleName - Card style name
     */
    applyCardStyle(styleName) {
        const style = CustomizationService.CARD_STYLES[styleName.toUpperCase()];
        if (!style) return;

        Object.entries(style).forEach(([key, value]) => {
            if (key !== 'name') {
                document.documentElement.style.setProperty(`--card-${key}`, value);
            }
        });
    }

    /**
     * Apply custom colors
     * @param {Object} colors - Custom colors
     */
    applyCustomColors(colors) {
        if (!colors) return;

        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--custom-${key}`, value);
        });
    }

    /**
     * Apply all preferences
     * @param {Object} preferences - User preferences
     */
    applyPreferences(preferences) {
        if (preferences.themeMode === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(isDark ? 'dark' : 'light');
        } else {
            this.applyTheme(preferences.theme);
        }

        this.applyFontSettings({
            font: preferences.font,
            fontSize: preferences.fontSize
        });

        this.applyCardStyle(preferences.cardStyle);

        if (preferences.customColors) {
            this.applyCustomColors(preferences.customColors);
        }

        // Apply animation preferences
        document.documentElement.style.setProperty(
            '--transition-duration',
            preferences.animations ? '0.3s' : '0s'
        );
    }

    /**
     * Reset preferences to defaults
     */
    async resetPreferences() {
        try {
            const defaultPrefs = {
                themeMode: 'system',
                theme: CustomizationService.THEMES.LIGHT.name,
                font: CustomizationService.FONTS.SYSTEM.name,
                cardStyle: CustomizationService.CARD_STYLES.CLASSIC.name,
                fontSize: 16,
                animations: true,
                customColors: null
            };

            await this.updatePreferences(defaultPrefs);
            return defaultPrefs;
        } catch (error) {
            console.error('Error resetting preferences:', error);
            throw error;
        }
    }
}

export default CustomizationService;
