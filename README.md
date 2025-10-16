💸 MoneyFlow: Salary Per Second Counter 💰

MoneyFlow is a dynamic Chrome extension designed to provide instant visualization of your earnings, counting your salary accrued every second based on your monthly income in Indian Rupees (₹).

This extension is built with persistent storage, ensuring your counter keeps running even when the browser is closed!


🚀 Installation (Developer Mode)


Since this extension is not currently published on the Chrome Web Store, you must install it locally using Chrome's Developer Mode.

Prerequisites
A Google Chrome web browser.

The complete source code folder (your salary-counter directory).

The icon files (inr_16.png, inr_48.png, inr_128.png) must be present.

Steps to Install
Open Chrome Extensions: Open your Google Chrome browser and type the following into the address bar:

chrome://extensions
Enable Developer Mode: In the top-right corner, toggle the Developer mode switch to the ON position.

Load Unpacked: Click the Load unpacked button that appears.

Select Folder: Navigate to and select the entire salary-counter folder (the folder containing manifest.json).

Pin the Extension: Click the puzzle piece icon (Extensions menu) in your toolbar, find MoneyFlow 💸, and click the pin icon next to it to display the logo in the toolbar.

Your custom logo should now be visible, and the extension is ready to use!

⚙️ Core Technology


Manifest V3: Modern Chrome Extension standard.

Service Worker (service-worker.js): Used for persistent background storage (chrome.storage.local) to ensure the counter never stops unless manually paused.

Frontend: HTML/CSS/JavaScript.

Localization: Calculations and display are focused on Indian Rupees (₹).
