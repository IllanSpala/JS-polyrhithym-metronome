# JS-musicalHelper (jojozelan Tools)

## About the Project
**JS-musicalHelper** is a web-based, multi-tool platform designed to assist musicians in the production, study, and creation of music. The fundamental concept of this website is to consolidate various musical utilities into a single, cohesive, and interactive environment.

Whether you are practicing complex rhythms, studying music theory, or mapping out scales on a fretboard, this platform provides the necessary visual and audio tools to enhance your musical workflow.

The application is built using **vanilla HTML, CSS, and JavaScript**, making it lightweight and easy to run directly in any modern web browser without the need for complex backend setups or installations.

---

## Project Architecture & Roadmap

```mermaid
graph TD
    classDef main fill:#e0e0e0,stroke:#333,stroke-width:1px;
    classDef existing fill:#d6d6f5,stroke:#333,stroke-width:1px;
    classDef core fill:#d9ebd8,stroke:#333,stroke-width:1px;
    classDef planned fill:#f5e6d3,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef backend fill:#f5d3d3,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;

    Index["index.html\nMain menu - theme switcher"]:::main

    MenuCSS["menu.css\nLayout - flat UI - themes"]:::core
    ScriptJS["script.js\nThemes - i18n"]:::core
    Index -.-> MenuCSS
    Index -.-> ScriptJS

    PolyMetro["PolyMetro.html\nPolyrhythm metronome"]:::existing
    ScaleMachine["ScaleMachine.html\nScales - fretboard - practice"]:::existing
    Index --> PolyMetro
    Index --> ScaleMachine
    PolyMetro -.-> ScriptJS
    ScaleMachine -.-> ScriptJS

    TabPlayer["TabPlayer.html (Planned)\nAlphaTab player - looping"]:::planned
    UserArea["Profile.html (Planned)\nUser dashboard"]:::planned
    FirebaseDB[("BaaS Cloud (Planned)\nAuth - User database")]:::backend

    Index -.-> TabPlayer
    Index -.-> UserArea
    TabPlayer -.->|Saves progress| FirebaseDB
    UserArea -.->|Login / Sync| FirebaseDB
```

---

## Features and Modules

### 1. Main Menu (Hub)
Central hub connecting all tools with theme selection and language toggle.

### 2. Polyrhythm Metronome
Visual + audio tool for practicing polyrhythms using SVG and Web Audio API.

### 3. Scale Machine
Interactive fretboard with scales, tunings, and theory integration.

### 4. Practice Mode
Mini-games for theory and ear training.

### 5. CHUG Button
Low-tuned palm-mute trigger for metal practice.

---

## Directory Structure

```
JS-musicalHelper/
├── index.html
├── src/
│   ├── index.html
│   ├── PolyMetro.html
│   └── ScaleMachine.html
├── css/
│   ├── menu.css
│   ├── metronome.css
│   └── scale.css
├── js/
│   ├── script.js
│   ├── metronome.js
│   └── scale.js
└── pic ideas/
```

---

## How to Run

1. Clone the repository:
   git clone https://github.com/your-username/JS-musicalHelper.git

2. Open index.html in your browser.
