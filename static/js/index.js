window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Qualitative Results Tab Switching
function switchTab(element, tabId) {
    // Remove active class from all tabs
    const tabs = element.parentElement.parentElement.querySelectorAll('li');
    tabs.forEach(tab => tab.classList.remove('is-active'));
    
    // Add active class to clicked tab
    element.parentElement.classList.add('is-active');
    
    // Hide all tab contents and pause their videos
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        // Pause all videos in hidden tabs
        const videos = content.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0; // Reset to beginning
        });
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    selectedTab.style.display = 'block';
    
    // Auto-play all videos in the newly displayed tab
    const selectedVideos = selectedTab.querySelectorAll('video');
    selectedVideos.forEach(video => {
        video.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    });
    
    // Align videos in the newly displayed tab with a slight delay to ensure rendering
    setTimeout(() => alignVideos(selectedTab), 50);
}

// Align videos by normalizing title heights in a grid
function alignVideos(container = null) {
    let containers = [];
    
    if (container instanceof Element) {
        // If an element is passed, use it directly
        containers = [container];
    } else if (typeof container === 'string') {
        // If a string selector is passed, query for it
        containers = Array.from(document.querySelectorAll(container));
    } else {
        // Default: find all tab contents
        containers = Array.from(document.querySelectorAll('.tab-content'));
    }
    
    containers.forEach(cont => {
        // Find all column groups in this container
        const columnGroups = cont.querySelectorAll('.columns');
        
        columnGroups.forEach(columnGroup => {
            const columns = columnGroup.querySelectorAll('.column');
            let maxTitleHeight = 0;
            
            // First pass: find the maximum title height
            columns.forEach(column => {
                const titleElement = column.querySelector('h4, h3, h2, .video-title');
                if (titleElement) {
                    const titleHeight = titleElement.offsetHeight;
                    maxTitleHeight = Math.max(maxTitleHeight, titleHeight);
                }
            });
            
            // Second pass: apply max height to all titles to align videos
            if (maxTitleHeight > 0) {
                columns.forEach(column => {
                    const titleElement = column.querySelector('h4, h3, h2, .video-title');
                    if (titleElement) {
                        titleElement.style.minHeight = maxTitleHeight + 'px';
                        titleElement.style.display = 'flex';
                        titleElement.style.alignItems = 'center';
                        titleElement.style.justifyContent = 'center';
                    }
                });
            }
        });
    });
}

// Toggle Qualitative Results Section
function toggleQualitativeResults(button) {
    const content = button.closest('h2').nextElementSibling;
    const chevron = button.querySelector('.fa-chevron-down');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
        // Align videos after expanding the section
        setTimeout(() => alignVideos(content), 100);
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

// Setup hero video looping between a longer segment of the clip
function setupHeroVideoLoop() {
    const heroVideo = document.getElementById('hero-video');
    if (!heroVideo) return;
    
    const loopStart = 7;  // Match the #t=8.5 start offset
    const loopEnd = 10;     // Let the clip play longer before looping
    
    // Set initial start time when video metadata is loaded
    heroVideo.addEventListener('loadedmetadata', function() {
        heroVideo.currentTime = loopStart;
    });
    
    // Loop back to start when reaching end
    heroVideo.addEventListener('timeupdate', function() {
        if (heroVideo.currentTime >= loopEnd) {
            heroVideo.currentTime = loopStart;
        }
    });
}

$(document).ready(function() {
    // Setup hero video loop
    setupHeroVideoLoop();
    
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
    
    // Align videos on page load
    alignVideos();
    
    // Auto-play videos in the initially active tab
    const activeTab = document.querySelector('.tab-content[style*="display: block"]');
    if (activeTab) {
        const videos = activeTab.querySelectorAll('video');
        videos.forEach(video => {
            video.play().catch(e => {
                console.log('Autoplay prevented:', e);
            });
        });
    }
    
    // Re-align videos on window resize
    window.addEventListener('resize', function() {
        alignVideos();
    });

})
