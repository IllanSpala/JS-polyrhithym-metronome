JS-musicalHelper (jojozelan Tools)
About the Project

JS-musicalHelper is a web-based, multi-tool platform designed to assist musicians in the production, study, and creation of music. The fundamental concept of this website is to consolidate various musical utilities into a single, cohesive, and interactive environment.

Whether you are practicing complex rhythms, studying music theory, or mapping out scales on a fretboard, this platform provides the necessary visual and audio tools to enhance your musical workflow.

The application is built using vanilla HTML, CSS, and JavaScript, making it lightweight and easy to run directly in any modern web browser without the need for complex backend setups or installations.

Project Architecture & Roadmap

Below is the structural map of the project, highlighting the existing core modules and the planned roadmap for future features (such as the Tablature Player and User Authentication).

graph TD
    %% Styling
    classDef main fill:#e0e0e0,stroke:#333,stroke-width:1px;
    classDef existing fill:#d6d6f5,stroke:#333,stroke-width:1px;
    classDef core fill:#d9ebd8,stroke:#333,stroke-width:1px;
    classDef planned fill:#f5e6d3,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef backend fill:#f5d3d3,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;

    %% Hub
    Index["index.html\nMain menu - theme switcher"]:::main

    %% Core files
    MenuCSS["menu.css\nLayout - flat UI - themes"]:::core
    ScriptJS["script.js\nThemes - i18n"]:::core
    Index -.-> MenuCSS
    Index -.-> ScriptJS

    %% Existing tools
    PolyMetro["PolyMetro.html\nPolyrhythm metronome"]:::existing
    ScaleMachine["ScaleMachine.html\nScales - fretboard - practice"]:::existing
    Index --> PolyMetro
    Index --> ScaleMachine
    PolyMetro -.-> ScriptJS
    ScaleMachine -.-> ScriptJS

    %% Planned modules
    TabPlayer["TabPlayer.html (Planned)\nAlphaTab player - looping"]:::planned
    UserArea["Profile.html (Planned)\nUser dashboard"]:::planned
    FirebaseDB[("BaaS Cloud (Planned)\nAuth - User database")]:::backend

    Index -.-> TabPlayer
    Index -.-> UserArea
    TabPlayer -.->|Saves progress| FirebaseDB
    UserArea -.->|Login / Sync| FirebaseDB
Features and Modules
1. Main Menu (Hub)

The landing page serves as the central hub connecting all available tools.

Customization

Persistent theme selector with four distinct color palettes:

Teak / Earth

Winter / Dove

Pine / Forest

Royal Purple

Themes are shared across all tools and saved locally.

Localization

Built-in i18n toggle allowing seamless switching between:

English

Portuguese

2. Polyrhythm Metronome

A specialized metronome designed to help musicians visualize and practice complex polyrhythms such as 3:4, 5:7, etc.

Visual Generator

Uses dynamic SVG geometry to draw polygons representing rhythmic subdivisions.

Animated dots move along the shapes to provide visual timing cues.

Audio Engine

Built on the Web Audio API

Separate tones for:

Main beat

Subdivision beat

Controls

Adjustable:

Primary beat

Secondary beat

Global BPM

3. Scale Machine

An advanced, interactive fretboard visualizer and music theory study tool designed primarily for guitar and bass players.

Dynamic Fretboard

Generates a clickable fretboard in real time.

Clicking any note plays its pitch.

Customization
Users can configure:

Instrument: Guitar or Bass

Root note

Scale / mode:

Ionian

Dorian

Harmonic Minor

Whole Tone

and many more

Number of frets

Tuning Support
Includes:

Standard tunings

Drop tunings

Open tunings

Fully custom per-string tuning editor

Music Theory Integration
Displays:

Scale interval formulas

Harmonic degrees

Contextual theory explanations in an About Scale panel

4. Practice Mode (Scale Machine)

Includes four interactive training mini-games:

Complete the Formula

Fill in missing notes based on interval patterns.

Degree to Note

Given a scale degree, select the correct note on the fretboard.

Note to Degree

Identify the harmonic function of a note within the scale.

Listen and Identify

Ear-training exercise for recognizing degrees by sound.

5. CHUG Button

A dedicated feature aimed at metal musicians.

Instantly plays a low-tuned palm-mute sample

Uses the currently selected instrument tuning to determine pitch

Directory Structure
JS-musicalHelper/
├── index.html              # Root redirect file
├── src/                    # Main HTML interfaces
│   ├── index.html          # Main Menu
│   ├── PolyMetro.html      # Polyrhythm Metronome
│   └── ScaleMachine.html   # Scale Machine
├── css/
│   ├── menu.css            # Global layout and menu styling
│   ├── metronome.css       # Metronome styles
│   └── scale.css           # Fretboard and scale styles
├── js/
│   ├── script.js           # Global logic, themes, i18n
│   ├── metronome.js        # Metronome engine
│   └── scale.js            # Fretboard and theory logic
└── pic ideas/              # Concept art and references
How to Run

This project is entirely static and requires no build step.

Steps

Clone the repository:

git clone https://github.com/your-username/JS-musicalHelper.git

Navigate to the folder:

cd JS-musicalHelper

Open:

index.html

in any modern browser.

Roadmap

Planned future modules include:

Tablature Player

AlphaTab integration

Looping and tempo control

User Accounts

Progress saving

Cloud sync via Firebase
