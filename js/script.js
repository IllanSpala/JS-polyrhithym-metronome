// --- SHARED THEME DATA ---
const themes = [
    { bgStart: '#af8c62', bgEnd: '#6f4f43', glassBg: 'rgba(37, 34, 38, 0.5)', btnBg: 'rgba(79, 64, 70, 0.9)', accentA: '#596361', accentB: '#d6b89c' },
    { bgStart: '#c0bab3', bgEnd: '#52423d', glassBg: 'rgba(22, 15, 12, 0.6)', btnBg: 'rgba(57, 18, 20, 0.8)', accentA: '#e0e0e0', accentB: '#160f0c' },
    { bgStart: '#1c2c3b', bgEnd: '#192a34', glassBg: 'rgba(255, 255, 255, 0.05)', btnBg: 'rgba(68, 93, 99, 0.8)', accentA: '#718d99', accentB: '#b3c6d0' },
    { bgStart: '#959bb5', bgEnd: '#3a3e6c', glassBg: 'rgba(10, 17, 35, 0.6)', btnBg: 'rgba(58, 62, 108, 0.8)', accentA: '#8387c3', accentB: '#ffffff' }
];

function changeTheme(index) {
    const t = themes[index];
    const root = document.documentElement;
    root.style.setProperty('--bg-start', t.bgStart);
    root.style.setProperty('--bg-end', t.bgEnd);
    root.style.setProperty('--glass-bg', t.glassBg);
    root.style.setProperty('--btn-bg', t.btnBg);
    root.style.setProperty('--accent-a', t.accentA);
    root.style.setProperty('--accent-b', t.accentB);
    
    // Salva a escolha do usuário no navegador
    localStorage.setItem('appTheme', index);

    // Sincroniza com a página de escalas caso a função exista lá
    if (typeof applyThemeToBody === "function") applyThemeToBody(index);
    if (typeof drawShapes === "function") drawShapes();
}

// Inicialização: Lê o tema salvo ou usa o 0/2 como padrão
const savedTheme = localStorage.getItem('appTheme');
const initialTheme = savedTheme !== null ? parseInt(savedTheme) : 0;
changeTheme(initialTheme);

// --- TRANSLATION SYSTEM (i18n) ---
const translations = {
    pt: {
        "footer_text": "© 2026 jojozelan Tools",
        "back_menu": "Voltar ao menu",
        "select_tool": "Selecione uma Ferramenta",
        "metro_title": "Metrônomo",
        "metro_desc": "Gerador polirrítmico visual com batidas personalizáveis.",
        "scale_title": "Máquina de Escalas",
        "scale_desc": "Gerador e visualizador de escalas aleatórias.",
        "tab_title": "Tab Player",
        "tab_desc": "Leitor de tablatura com loop, metrônomo e transposição.",
        "open_tool": "ABRIR FERRAMENTA",
        "poly_title": "Metrônomo Polirrítmico",
        "main_beat": "Batida Princ.",
        "sub_beat": "Sub Batida",
        "btn_start": "INICIAR",
        "btn_stop": "PARAR",
        "lbl_instrument": "Instrumento",
        "lbl_root": "Tônica",
        "lbl_scale": "Escala",
        "lbl_tuning": "Afinação",
        "lbl_frets": "Trastes",
        "legend_title": "Notas da escala — clique para detalhes e som",
        "custom_tuning_title": "Afinação personalizada",
        "btn_about": "Sobre a Escala",
        "btn_tasks": "Exercícios",
        "tasks_title": "Mini Tasks para Praticar",
        "btn_close": "✕ Fechar",
        "str_7": "7ª corda",
        "str_5": "5ª corda"
    },
    en: {
        "footer_text": "© 2026 jojozelan Tools",
        "back_menu": "Back to Main Menu",
        "select_tool": "Select a Tool",
        "metro_title": "Metronome",
        "metro_desc": "Visual polyrhythmic generator with customizable beats.",
        "scale_title": "Scale Machine",
        "scale_desc": "Random scale generator and visualizer.",
        "tab_title": "Tab Player",
        "tab_desc": "Tab reader with loop, metronome & transposition.",
        "open_tool": "OPEN TOOL",
        "poly_title": "Polyrhythm Metronome",
        "main_beat": "MainBeat",
        "sub_beat": "SubBeat",
        "btn_start": "START",
        "btn_stop": "STOP",
        "lbl_instrument": "Instrument",
        "lbl_root": "Root",
        "lbl_scale": "Scale",
        "lbl_tuning": "Tuning",
        "lbl_frets": "Frets",
        "legend_title": "Scale notes — click for details and sound",
        "custom_tuning_title": "Custom tuning",
        "btn_about": "About Scale",
        "btn_tasks": "Exercises",
        "tasks_title": "Mini Tasks to Practice",
        "btn_close": "✕ Close",
        "str_7": "7th string",
        "str_5": "5th string"
    }
};

let currentLang = localStorage.getItem('appLang') || 'pt';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    applyTranslations();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[currentLang][key]) el.title = translations[currentLang][key];
    });

    document.querySelectorAll('.lang-flag').forEach(f => f.classList.remove('active'));
    const activeFlag = document.getElementById('flag-' + currentLang);
    if (activeFlag) activeFlag.classList.add('active');
}

document.addEventListener('DOMContentLoaded', applyTranslations);