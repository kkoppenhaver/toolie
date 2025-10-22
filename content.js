// Toolie - Retool Assist Companion
// A helpful (and sarcastic) assistant for your Retool building experience

class ToolieAssistant {
  constructor() {
    this.toolieElement = null;
    this.speechBubble = null;
    this.currentMessage = null;
    this.messageTimeout = null;
    this.observerSetup = false;
    this.lastActivityType = null;
    this.assistInputElement = null;
    this.positionUpdateInterval = null;

    // Quips organized by context
    this.quips = {
      welcome: [
        "Oh good, you're here. I was getting lonely.",
        "Ready to build something amazing? Or at least functional?",
        "Welcome back! Let's see what we can create today.",
        "Hello! I'll be your sarcastic guide for this journey.",
        "Ah, the Assist tab. Where dreams become... queries."
      ],
      typing: [
        "Take your time, I've got all day...",
        "Interesting choice of words there.",
        "I can feel a good query coming on!",
        "Don't worry, I won't judge your spelling.",
        "Let me guess... another table component?"
      ],
      building: [
        "Watch the magic happen! (It's actually just code)",
        "Building faster than you can say 'low-code platform'...",
        "Behold! Components materializing before your eyes!",
        "This is going better than expected, honestly.",
        "I'm working harder than a CPU on Black Friday."
      ],
      success: [
        "Nailed it! Even I'm impressed.",
        "Look at that! It actually works!",
        "Success! Time to add 47 more features, right?",
        "Beautiful. *Chef's kiss*",
        "Now that's what I call a working app!",
        "I'd give that a solid 5/7. Perfect score."
      ],
      error: [
        "Well, that was unexpected. (It really wasn't)",
        "Houston, we have a problem...",
        "Don't panic! Just... maybe read the error message?",
        "Error: Success not found. Try again?",
        "I've seen worse. Not by much, but I have.",
        "Time to put on your debugging hat!"
      ],
      idle: [
        "Still here if you need me...",
        "Just hanging out, doing tool things.",
        "No rush. I'm not going anywhere.",
        "Enjoying the view of your app canvas.",
        "Thinking about queries and components..."
      ]
    };
  }

  init() {
    // Check if we're on a Retool page
    if (!window.location.hostname.includes('retool.com')) {
      return;
    }

    // Wait for the page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Create Toolie UI
    this.createToolieUI();

    // Setup observers for Assist tab
    this.observeAssistTab();

    console.log('Toolie is ready!');
  }

  createToolieUI() {
    // Create container
    const container = document.createElement('div');
    container.id = 'toolie-container';
    container.className = 'hidden';

    // Load SVG
    const svgUrl = chrome.runtime.getURL('toolie.svg');
    fetch(svgUrl)
      .then(response => response.text())
      .then(svgContent => {
        const svgDiv = document.createElement('div');
        svgDiv.id = 'toolie-character';
        svgDiv.innerHTML = svgContent;
        container.appendChild(svgDiv);
      });

    // Create speech bubble
    const speechBubble = document.createElement('div');
    speechBubble.id = 'toolie-speech-bubble';
    speechBubble.innerHTML = '<p id="toolie-speech-text"></p>';
    container.appendChild(speechBubble);

    this.speechBubble = speechBubble;

    // Add to page
    document.body.appendChild(container);
    this.toolieElement = container;
  }

  observeAssistTab() {
    // Use MutationObserver to detect when Assist tab is opened
    const observer = new MutationObserver(() => {
      this.checkForAssistTab();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Initial check
    setTimeout(() => this.checkForAssistTab(), 1000);
  }

  checkForAssistTab() {
    // Look for Assist input field - updated selectors for new Retool UI
    const assistInputSelectors = [
      '[data-testid="Editor::SidebarContent"] .cm-content[role="textbox"]',
      '[data-testid="BasicEditor::copilotEditor"] .cm-content',
      '.cm-content[aria-multiline="true"][contenteditable="true"]',
      'textarea[placeholder*="Assist"]',
      'textarea[placeholder*="assist"]',
      'input[placeholder*="Assist"]',
      'input[placeholder*="assist"]',
      '[data-testid*="assist"] textarea',
      '[class*="assist"] textarea',
      '[aria-label*="Assist"] textarea'
    ];

    let assistInput = null;
    for (const selector of assistInputSelectors) {
      assistInput = document.querySelector(selector);
      if (assistInput) {
        break;
      }
    }

    // Fallback: look for any textarea in the lower portion of the page
    if (!assistInput) {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const rect = textarea.getBoundingClientRect();
        // Check if textarea is in bottom third of viewport
        if (rect.top > window.innerHeight * 0.66) {
          assistInput = textarea;
        }
      });
    }

    if (assistInput && !this.observerSetup) {
      this.assistInputElement = assistInput;
      this.showToolie();
      this.positionToolie();
      this.setupAssistObservers();
      this.observerSetup = true;
      this.showMessage('welcome');

      // Update position periodically in case of layout changes
      this.positionUpdateInterval = setInterval(() => {
        this.positionToolie();
      }, 500);
    } else if (!assistInput && this.observerSetup) {
      this.hideToolie();
      this.observerSetup = false;
      this.assistInputElement = null;
      if (this.positionUpdateInterval) {
        clearInterval(this.positionUpdateInterval);
        this.positionUpdateInterval = null;
      }
    }
  }

  setupAssistObservers() {
    // Observe input field for typing
    const checkInput = () => {
      const inputs = document.querySelectorAll('textarea, input[type="text"]');
      inputs.forEach(input => {
        if (!input.dataset.toolieObserved) {
          input.dataset.toolieObserved = 'true';

          let typingTimeout;
          input.addEventListener('input', () => {
            clearTimeout(typingTimeout);
            if (this.lastActivityType !== 'typing') {
              this.setAnimation('thinking');
              this.showMessage('typing');
              this.lastActivityType = 'typing';
            }

            typingTimeout = setTimeout(() => {
              this.setAnimation('normal');
              this.lastActivityType = null;
            }, 2000);
          });
        }
      });
    };

    // Check for inputs periodically
    setInterval(checkInput, 1000);

    // Observe for building/generation activity
    this.observeBuilding();
  }

  observeBuilding() {
    // Watch for loading indicators, new components being added, etc.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Look for signs of building/generation
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              // Check for loading indicators
              if (node.querySelector('[class*="loading"]') ||
                  node.querySelector('[class*="spinner"]') ||
                  node.classList?.contains('loading')) {
                this.onBuildingStart();
              }

              // Check for new components (adjust based on Retool's structure)
              if (node.classList?.contains('component') ||
                  node.querySelector('[data-component]')) {
                this.onBuildingComplete();
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  onBuildingStart() {
    if (this.lastActivityType !== 'building') {
      this.setAnimation('excited');
      this.showMessage('building');
      this.lastActivityType = 'building';
    }
  }

  onBuildingComplete() {
    if (this.lastActivityType === 'building') {
      this.setAnimation('excited');
      this.showMessage('success');
      this.lastActivityType = 'success';

      setTimeout(() => {
        this.setAnimation('normal');
        this.lastActivityType = null;
      }, 3000);
    }
  }

  positionToolie() {
    if (!this.toolieElement || !this.assistInputElement) return;

    // For CodeMirror editors, find the input container that's at the bottom
    // We want the actual input area, not the whole sidebar
    let positionElement = this.assistInputElement;
    const inputContainer = this.assistInputElement.closest('[class*="mainInputContainer"]') ||
                          this.assistInputElement.closest('[class*="textareaViewport"]');

    if (inputContainer) {
      positionElement = inputContainer;
    }

    const inputRect = positionElement.getBoundingClientRect();

    // Only reposition if the element is visible and has dimensions
    if (inputRect.width === 0 || inputRect.height === 0) return;

    // Position Toolie to the left of the input field, inside the sidebar
    // Place it about 60px from the left edge of the input (above the input)
    const left = inputRect.left + 300;
    const bottom = window.innerHeight - inputRect.top + 100; // 20px above the input

    this.toolieElement.style.left = `${left}px`;
    this.toolieElement.style.bottom = `${bottom}px`;

    // Debug logging (remove after fixing)
    console.log('Toolie position:', { left, bottom, inputRect });
  }

  showToolie() {
    if (this.toolieElement) {
      this.toolieElement.classList.remove('hidden');
      this.toolieElement.classList.add('visible');
    }
  }

  hideToolie() {
    if (this.toolieElement) {
      this.toolieElement.classList.remove('visible');
      this.toolieElement.classList.add('hidden');
      this.hideSpeechBubble();
    }
  }

  setAnimation(type) {
    const character = document.getElementById('toolie-character');
    if (!character) return;

    character.classList.remove('normal', 'thinking', 'excited');
    character.classList.add(type);
  }

  showMessage(context, duration = 4000) {
    const messages = this.quips[context] || this.quips.idle;
    const message = messages[Math.floor(Math.random() * messages.length)];

    const textElement = document.getElementById('toolie-speech-text');
    if (textElement && this.speechBubble) {
      textElement.textContent = message;
      this.speechBubble.classList.add('visible');

      // Clear existing timeout
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }

      // Hide after duration
      this.messageTimeout = setTimeout(() => {
        this.hideSpeechBubble();
      }, duration);
    }
  }

  hideSpeechBubble() {
    if (this.speechBubble) {
      this.speechBubble.classList.remove('visible');
    }
  }

  getRandomQuip(context) {
    const quips = this.quips[context] || this.quips.idle;
    return quips[Math.floor(Math.random() * quips.length)];
  }
}

// Initialize Toolie
const toolie = new ToolieAssistant();
toolie.init();
