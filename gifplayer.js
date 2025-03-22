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

        console.log(originalImg);

        // Get natural dimensions
        const naturalWidth = originalImg.naturalWidth;
        const naturalHeight = originalImg.naturalHeight;
        
        // Read custom width/height attributes (if any)
        let customWidth = originalImg.getAttribute('width') ? parseInt(originalImg.getAttribute('width'), 10) : naturalWidth;
        let customHeight = originalImg.getAttribute('height') ? parseInt(originalImg.getAttribute('height'), 10) : naturalHeight;
        
        console.log("naturalWidth: " + naturalWidth);
        console.log("naturalHeight: " + naturalHeight);
        console.log("customWidth: " + customWidth);
        console.log("customHeight: " + customHeight);

        // If only one dimension is provided, maintain aspect ratio
        if (originalImg.getAttribute('width') && !originalImg.getAttribute('height')) {
            customHeight = Math.round(customWidth * naturalHeight / naturalWidth);
        } else if (!originalImg.getAttribute('width') && originalImg.getAttribute('height')) {
            customWidth = Math.round(customHeight * naturalWidth / naturalHeight);
        }

        // Create a wrapping container to hold the canvas + controls
        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.style.verticalAlign = 'top';
        container.style.border = '1px solid #ccc';
        container.style.margin = '0px 0';
        container.style.width = customWidth + 'px';
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
        timeline.style.maxWidth = (customWidth - 60) + 'px';
        
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
        
        // Initialize SuperGif, which comes from libgif.js
        const player = new SuperGif({
            gif: originalImg,
            auto_play: false,
        });
        
        // Force the canvas to be resized as soon as it is created,
        // even before the GIF is fully loaded.
        const canvasResizeInterval = setInterval(function() {
            const canvas = player.get_canvas();
            if (canvas) {
                canvas.style.width = customWidth + 'px';
                canvas.style.height = customHeight + 'px';
                clearInterval(canvasResizeInterval);
            }
        }, 50);

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
            
            // If custom dimensions are provided, update the canvas size accordingly
            if (originalImg.getAttribute('width') || originalImg.getAttribute('height')) {
                const canvas = player.get_canvas();
                canvas.style.width = customWidth + 'px';
                canvas.style.height = customHeight + 'px';
            }

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