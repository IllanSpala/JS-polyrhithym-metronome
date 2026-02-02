# PolyMetronome (Jojozelan Edition) ⏱️🎵

**PolyMetronome** is a web-based visual metronome designed to help musicians practice complex polyrhythms. It provides both audio and visual feedback to master polyrhythmic patterns (e.g., 3 against 4, 5 against 7).

## 📂 Repository Structure

This project is located within the `PolyMetronome_jojozelan` directory of the repository.

```text
JS-polyrhithym-metronome/
└── PolyMetronome_jojozelan/  <-- Project Root
    ├── index.html            # Main entry point
    ├── style.css             # Styling and Visual effects
    ├── script.js             # Metronome logic & Web Audio API
    └── assets/               # Sounds and icons
🚀 Features
Polyrhythm Support: Run two independent rhythm counters simultaneously (e.g., Pulse A and Pulse B).

Visual Feedback: Visual indicators that flash in sync with the selected beats, making it easier to "see" the polyrhythm.

Tempo Control: Precise BPM (Beats Per Minute) adjustment.

Browser-Based: Runs entirely in the browser using the Web Audio API for accurate timing.

🛠️ Technologies Used
HTML5: Semantic structure.

CSS3: Layout and visual animations.

JavaScript (Vanilla): Core logic, timing calculation, and audio handling.

⚡ How to Run
Since this is a static web project, you do not need to install complex dependencies like Node.js.

Clone the repository:

Bash

git clone [https://github.com/IllanSpala/JS-polyrhithym-metronome.git](https://github.com/IllanSpala/JS-polyrhithym-metronome.git)
Navigate to the specific project folder: (Important: The project lives inside the PolyMetronome_jojozelan folder)

Bash

cd JS-polyrhithym-metronome/PolyMetronome_jojozelan
Launch the App:

Option A (Simplest): Locate index.html in your file explorer and double-click to open it in your browser.

Option B (VS Code): If using VS Code, install the "Live Server" extension, right-click index.html, and select "Open with Live Server".

🎹 Usage Guide
Set your primary time signature (e.g., 4/4).

Set the secondary (polyrhythm) counter (e.g., 3).

Adjust the BPM slider.

Press Start to hear and see the polyrhythm in action.

Developed by IllanSpala
