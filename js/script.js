// --- SHARED THEME DATA ---
const themes = [
    {   // Palette 1: Earthy
        bgStart: '#af8c62', bgEnd: '#6f4f43',
        glassBg: 'rgba(37, 34, 38, 0.5)', 
        btnBg: 'rgba(79, 64, 70, 0.9)',
        accentA: '#596361', accentB: '#d6b89c'
    },
    {   // Palette 2: Winter/Dove
        bgStart: '#c0bab3', bgEnd: '#52423d',
        glassBg: 'rgba(22, 15, 12, 0.6)', 
        btnBg: 'rgba(57, 18, 20, 0.8)',
        accentA: '#e0e0e0', accentB: '#160f0c'
    },
    {   // Palette 3: Pine Forest
        bgStart: '#1c2c3b', bgEnd: '#192a34',
        glassBg: 'rgba(255, 255, 255, 0.05)', 
        btnBg: 'rgba(68, 93, 99, 0.8)',
        accentA: '#718d99', accentB: '#b3c6d0'
    },
    {   // Palette 4: Royal Purple
        bgStart: '#959bb5', bgEnd: '#3a3e6c',
        glassBg: 'rgba(10, 17, 35, 0.6)', 
        btnBg: 'rgba(58, 62, 108, 0.8)',
        accentA: '#8387c3', accentB: '#ffffff'
    }
];

// --- SHARED FUNCTION ---
function changeTheme(index) {
    const t = themes[index];
    const root = document.documentElement;

    // Apply CSS Variables
    root.style.setProperty('--bg-start', t.bgStart);
    root.style.setProperty('--bg-end', t.bgEnd);
    root.style.setProperty('--glass-bg', t.glassBg);
    root.style.setProperty('--btn-bg', t.btnBg);
    root.style.setProperty('--accent-a', t.accentA);
    root.style.setProperty('--accent-b', t.accentB);

    // If we are on the Metronome page, redraw the shapes with new colors
    // We check if the function exists to avoid errors on the Main Menu
    if (typeof drawShapes === "function") {
        drawShapes();
    }
}

// Initialize Default Theme
changeTheme(0);