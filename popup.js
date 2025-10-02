document.addEventListener('DOMContentLoaded', () => {
  const monthlySalaryInput = document.getElementById('monthlySalary');
  const startButton = document.getElementById('startButton');
  const display = document.getElementById('display');
  const timeElapsedDisplay = document.getElementById('timeElapsed'); 
  const startTimeDisplay = document.getElementById('startTimeDisplay'); 

  let intervalId = null;

  // CONSTANTS for calculation 
  const MONTHS_PER_YEAR = 12;
  const WORKING_DAYS_PER_YEAR = 250; 
  const WORKING_HOURS_PER_DAY = 8;
  const SECONDS_PER_HOUR = 3600;

  // --- FLOW STAGE LOGIC ---
  
  const getFlowStage = (monthlySalary) => {
      // Determines stage based on 40k increments
      if (monthlySalary >= 200000) return 'flow-stage-6'; // 200k+
      if (monthlySalary >= 160000) return 'flow-stage-5'; // 160k - 199.9k
      if (monthlySalary >= 120000) return 'flow-stage-4'; // 120k - 159.9k
      if (monthlySalary >= 80000) return 'flow-stage-3'; // 80k - 119.9k
      if (monthlySalary >= 40000) return 'flow-stage-2'; // 40k - 79.9k
      return 'flow-stage-1'; // < 40k
  };
  
  const setPilingFlow = (monthlySalary) => {
      // Remove all flow classes
      display.classList.remove('flow-stage-1', 'flow-stage-2', 'flow-stage-3', 'flow-stage-4', 'flow-stage-5', 'flow-stage-6');
      
      const stage = getFlowStage(monthlySalary);
      display.classList.add(stage);
  };

  // --- CORE UTILITY FUNCTIONS ---

  const calculateSalaryPerSecond = (monthlySalary) => {
    const annualSalary = monthlySalary * MONTHS_PER_YEAR;
    const workingHoursPerYear = WORKING_DAYS_PER_YEAR * WORKING_HOURS_PER_DAY;
    const hourlyRate = annualSalary / workingHoursPerYear;
    return hourlyRate / SECONDS_PER_HOUR;
  };

  const formatStartTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return `Started: ${date.toLocaleString('en-IN', options)}`;
  };
  
  // --- UI STATE MANAGEMENT ---

  const updateUI = (salaryPerSecond, startTime) => {
    if (intervalId) clearInterval(intervalId);

    const monthlySalary = salaryPerSecond * SECONDS_PER_HOUR * WORKING_HOURS_PER_DAY * WORKING_DAYS_PER_YEAR / MONTHS_PER_YEAR;
    monthlySalaryInput.value = monthlySalary.toFixed(0);

    // Set Running State
    startButton.textContent = "Chhuttiiiiii....."; 
    startButton.classList.add('running');
    startTimeDisplay.style.display = 'block';
    
    // Set the animation flow speed and color
    setPilingFlow(monthlySalary); 

    // Set Start Time
    startTimeDisplay.textContent = formatStartTime(startTime);

    // Calculation Loop (starts from elapsed time)
    intervalId = setInterval(() => {
        const currentTime = Date.now();
        const secondsWorked = Math.floor((currentTime - startTime) / 1000);
        const totalEarned = secondsWorked * salaryPerSecond;

        display.textContent = `₹${totalEarned.toFixed(2)}`;
        timeElapsedDisplay.textContent = `${secondsWorked} seconds`;

    }, 1000); 
  };
  
  const resetUI = () => {
    if (intervalId) clearInterval(intervalId);
    startButton.textContent = "Start Earning!";
    startButton.classList.remove('running');
    // Remove all flow classes and reset styles
    display.classList.remove('flow-stage-1', 'flow-stage-2', 'flow-stage-3', 'flow-stage-4', 'flow-stage-5', 'flow-stage-6');
    display.style.color = '#d4af37'; // Reset text color
    startTimeDisplay.style.display = 'none';
    display.textContent = `₹0.00`;
    timeElapsedDisplay.textContent = `0 seconds`;
  };

  // --- START/STOP LOGIC ---

  const toggleCounter = () => {
    // 1. Trigger the flash animation
    startButton.classList.add('flash-active');
    setTimeout(() => { startButton.classList.remove('flash-active'); }, 300);

    chrome.runtime.sendMessage({ command: "GET_STATE" }, (data) => {
      if (data && data.isRunning) { 
        // Stop the counter
        chrome.runtime.sendMessage({ command: "STOP_COUNTER" }, resetUI);
      } else {
        const monthlySalary = parseFloat(monthlySalaryInput.value);
        
        // --- FINAL CHECK: 250k Limit ---
        if (monthlySalary >= 250000) {
             // 1. Stop background process
            chrome.runtime.sendMessage({ command: "STOP_COUNTER" }); 
            
            // 2. Ensure UI is fully reset before showing error
            resetUI();
            
            // 3. Set the error message and highlight
            display.textContent = "Please! Switch the Job...";
            // Use the highest flow stage class to apply visual effect
            display.classList.add('flow-stage-6'); 
            // Change text color to something alarming (red)
            display.style.color = '#ff3333'; 
            
            // Also reset button state back to initial (important)
            startButton.textContent = "Start Earning!";
            startButton.classList.remove('running');
            
            return;
        }
        
        if (isNaN(monthlySalary) || monthlySalary <= 0) {
          display.textContent = "Enter a valid ₹ amount.";
          return;
        }

        const salaryPerSecond = calculateSalaryPerSecond(monthlySalary);
        const startTime = Date.now();

        // Reset error state (if any) and start the counter
        display.style.color = '#d4af37'; 
        chrome.runtime.sendMessage({ 
          command: "START_COUNTER", 
          salary: salaryPerSecond, 
          startTime: startTime 
        }, () => {
          updateUI(salaryPerSecond, startTime);
        });
      }
    });
  };

  // --- INITIALIZATION ---

  const initializePopup = () => {
    chrome.runtime.sendMessage({ command: "GET_STATE" }, (data) => {
      if (data && data.isRunning) {
        updateUI(data.monthlySalary, data.startTime);
      } else {
        resetUI();
      }
    });
  };

  // Event Listeners
  startButton.addEventListener('click', toggleCounter);
  monthlySalaryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      toggleCounter();
    }
  });

  initializePopup(); 
});