# JS-musicalHelper (jojozelan Tools)

## About the Project
JS-musicalHelper is a web-based, multi-tool platform designed to assist musicians in the production, study, and creation of music. The fundamental concept of this website is to consolidate various musical utilities into a single, cohesive, and interactive environment. Whether you are practicing complex rhythms, studying music theory, or mapping out scales on a fretboard, this platform provides the necessary visual and audio tools to enhance your musical workflow.

The application is built using vanilla HTML, CSS, and JavaScript, making it lightweight and easy to run directly in any modern web browser without the need for complex backend setups or installations.

## Features and Modules

### 1. Main Menu (Hub)
The landing page serves as the central hub connecting all available tools. 
* **Customization:** It features a persistent theme selector with four distinct color palettes (Teak/Earth, Winter/Dove, Pine/Forest, Royal Purple) that carry over to all tools.
* **Localization:** Includes an i18n language toggle, allowing users to switch the entire application interface between English and Portuguese seamlessly.

### 2. Polyrhythm Metronome
A specialized metronome designed to help musicians visualize and practice complex polyrhythms (e.g., 3 against 4, 5 against 7).
* **Visual Generator:** Uses dynamic SVG geometry to draw shapes representing the beats. Dots move along the edges of the polygons to provide precise visual cues.
* **Audio Engine:** Utilizes the Web Audio API to play distinct tones for the Main Beat and the Sub Beat.
* **Customizable Inputs:** Users can easily adjust the primary beat, secondary beat, and the global BPM.

### 3. Scale Machine
An advanced, interactive fretboard visualizer and music theory study tool tailored for guitar and bass players.
* **Dynamic Fretboard:** Generates a fully interactive fretboard. Users can click on any note to hear its pitch.
* **Extensive Customization:** Allows selection of instrument (Guitar or Bass), root note, specific scales/modes (Ionian, Dorian, Harmonic Minor, Whole Tone, etc.), and fret count.
* **Tunings:** Supports multiple standard and alternate tunings (Drop D, Open G, DADGAD), plus a Custom Tuning editor to modify each string individually.
* **Music Theory Integration:** Displays the scale formula with exact intervals and provides a dedicated "About Scale" panel with detailed theoretical context for the selected scale.
* **Practice Mode:** A built-in study overlay with four interactive mini-games to help memorize the fretboard:
  * *Complete the Formula*: Fill in the missing notes using intervals as a guide.
  * *Degree to Note*: Given a scale degree, identify the correct note.
  * *Note to Degree*: Given a note, identify its harmonic function.
  * *Listen and Identify*: Ear training exercise to identify a note's degree by sound.
* **CHUG Button:** A dedicated feature for metal musicians that instantly triggers a low-tuned palm-mute sound based on the instrument's lowest string.

## Directory Structure

The repository is organized as follows:

```text
JS-musicalHelper/
├── index.html              # Root redirect file that points to the main source folder
├── src/                    # Main HTML interfaces
│   ├── index.html          # Main Menu interface
│   ├── PolyMetro.html      # Polyrhythm Metronome tool interface
│   └── ScaleMachine.html   # Scale Machine tool interface
├── css/                    # Stylesheets
│   ├── menu.css            # Global layout, typography, and Main Menu styling
│   ├── metronome.css       # Specific styles for the Polyrhythm Metronome
│   └── scale.css           # Specific styles for the Scale Machine and Fretboard
├── js/                     # Core JavaScript logic
│   ├── script.js           # Global logic, theme management, and translation system (i18n)
│   ├── metronome.js        # Audio scheduling, geometry drawing, and metronome controls
│   └── scale.js            # Fretboard generation, music theory dictionaries, and practice mode logic
└── pic ideas/              # Concept art, color palettes, and reference images
How to Run
Since this project consists of static files, no build process or package manager is required.

Clone the repository to your local machine.

Navigate to the project folder.

Open the index.html file in the root directory with any modern web browser to start using the tools.
