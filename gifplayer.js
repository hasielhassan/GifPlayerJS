/**
 * Initializes custom GIF players for all <img> elements with .gif sources.
 * 
 * This function hides the original <img>, creates a new container with a
 * canvas and controls, and initializes a SuperGif player for each GIF.
 * It sets up play/pause controls and a timeline slider to scrub through
 * frames. The GIF is loaded asynchronously, and controls are updated
 * accordingly. Playback is paused by default.
 */
function InitializeGifPlayers() {

    // Grab all <img> elements ending in .gif (case-insensitive)
    const gifImages = document.querySelectorAll('img[src$=".gif" i]');
    
    gifImages.forEach(function(originalImg) {

    console.log(originalImg.naturalWidth);

    // Create a wrapping container to hold the canvas + controls
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.verticalAlign = 'top';
    container.style.border = '1px solid #ccc';
    container.style.margin = '0px 0';
    container.style.width = originalImg.naturalWidth + 'px';
    container.style.boxSizing = 'border-box';
    
    // Create a wrapper for the controls
    const controlsWrapper = document.createElement('div');
    controlsWrapper.style.display = 'flex';
    controlsWrapper.style.alignItems = 'center';
    controlsWrapper.style.marginTop = '1px';
    
    // Create Play/Pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.textContent = 'Play';
    playPauseBtn.style.width = '50px';
    playPauseBtn.style.marginRight = '5px';
    
    // Create a range slider
    const timeline = document.createElement('input');
    timeline.type = 'range';
    timeline.min = 0;
    timeline.value = 0;
    timeline.style.flex = '1';                 // let it grow
    timeline.style.minWidth = '50px';          // somewhat arbitrary
    timeline.style.maxWidth = (originalImg.naturalWidth - 60) + 'px';
    
    // Add button + slider to controls
    controlsWrapper.appendChild(playPauseBtn);
    controlsWrapper.appendChild(timeline);
    container.appendChild(controlsWrapper);

    // Insert the container just before the original <img>
    // (So it appears *above* that <img> in the DOM,
    //  but the container itself has the canvas.
    originalImg.parentNode.insertBefore(container, originalImg);
    
    // Hide the original <img>
    originalImg.style.display = 'none';
    
    // Initialize CustomSuperGif
    const player = new SuperGif({
        gif: originalImg,
        auto_play: false,
    });
    
    // Set up some variables for playback
    let isPlaying = false;
    let updateTimer = null;  // for the setInterval that updates the slider
    
    // Start an interval to sync the slider to the current frame
    function startPlaying() {
        player.play();
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        
        updateTimer = setInterval(function() {
        // libgif’s get_current_frame() returns the 0-based index
        timeline.value = player.get_current_frame();
        }, 100); // update ~10 times/sec
    }
    
    // Stop the interval (and pause the GIF)
    function stopPlaying() {
        player.pause();
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        
        if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
        }
    }
    
    // Load the GIF (asynchronously)
    player.load(function() {
        // Once loaded, we know how many frames there are
        const frameCount = player.get_length();
        timeline.max = frameCount - 1;
        // Now the GIF is on the first frame, paused
        
        // Handle button click
        playPauseBtn.addEventListener('click', function() {
        if (isPlaying) {
            stopPlaying();
        } else {
            startPlaying();
        }
        });
        
        // Handle scrubbing
        timeline.addEventListener('input', function() {
        // If the user scrubs, pause if playing
        if (isPlaying) {
            stopPlaying();
        }
        // Move to the new frame
        player.move_to(+this.value);
        });
    });
    });
}