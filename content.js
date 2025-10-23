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
        "Ah, the Assist tab. Where dreams become...queries.",
        "Perfect timing! I just finished my coffee.",
        "Let's do this! What are we building today?",
        "Hi! I'm Toolie, your friendly neighborhood tool mascot.",
        "Ooh, the Assist tab! My favorite place to hang out.",
        "Hello! I promise to only be moderately annoying."
      ],
      typing: [
        "Take your time, I've got all day...",
        "Interesting choice of words there.",
        "I can feel a good query coming on!",
        "Don't worry, I won't judge your spelling.",
        "Let me guess... another table component?",
        "Your typing skills are impressive!",
        "The suspense is killing me!",
        "Ideas are flowing, I can tell!",
        "Keep going, you're on a roll!",
        "This looks promising already!",
        "Words becoming reality, love it!",
        "I'm taking notes here...",
        "Fascinating stuff you're writing!",
        "The keyboard is your paintbrush!"
      ],
      building: [
        "Watch the magic happen! (It's actually just code)",
        "Building faster than you can say 'low-code platform'...",
        "Behold! Components materializing before your eyes!",
        "This is going better than expected, honestly.",
        "I'm working harder than a CPU on Black Friday.",
        "Assembling your masterpiece, piece by piece!",
        "Construction zone! Hard hat recommended.",
        "Making pixels dance and data flow!",
        "This is what I was born to do!",
        "Building at the speed of JavaScript!",
        "Your app is taking shape nicely!",
        "Putting the pieces together like a puzzle!",
        "Code: being written. Magic: being made.",
        "From concept to reality in 3... 2... 1...",
        "I love the smell of fresh code in the morning!",
        "Building blocks are coming together!"
      ],
      thinking: [
        "Hmm, let me think about that...",
        "Processing... my gears are turning!",
        "Give me a sec, I'm pondering the possibilities.",
        "Interesting question! Let me work on this.",
        "Crunching the numbers... or maybe the components?",
        "Consulting my internal documentation...",
        "Let me put on my thinking cap.",
        "Running through the scenarios...",
        "This requires some serious computation!",
        "Analyzing all the options here...",
        "My circuits are working overtime!",
        "Deep thoughts happening right now...",
        "Loading wisdom... please wait.",
        "Channeling my inner AI assistant..."
      ],
      success: [
        "Nailed it! Even I'm impressed.",
        "Look at that! It actually works!",
        "Success! Time to add 47 more features, right?",
        "Beautiful. *Chef's kiss*",
        "Now that's what I call a working app!",
        "I'd give that a solid 5/7. Perfect score.",
        "Boom! That's how it's done!",
        "Victory is sweet, isn't it?",
        "We did it! High five! ✋",
        "Another win for the good guys!",
        "That turned out better than I expected!",
        "Mission accomplished! What's next?",
        "Flawless execution! Well, pretty close.",
        "And the crowd goes wild! *cheers*",
        "That's a wrap! Ship it!",
        "Success looks good on you!",
        "Now THAT'S what I'm talking about!"
      ],
      error: [
        "Well, that was unexpected. (It really wasn't)",
        "Houston, we have a problem...",
        "Don't panic! Just... maybe read the error message?",
        "Error: Success not found. Try again?",
        "I've seen worse. Not by much, but I have.",
        "Time to put on your debugging hat!",
        "Oops! Did you try turning it off and on again?",
        "Error 418: I'm a teapot. (Just kidding, different error)",
        "It's not a bug, it's an unplanned feature!",
        "The error message is trying to tell us something...",
        "Well, that didn't go as planned.",
        "Errors happen! Even to the best of us.",
        "Red means stop. Let's figure this out.",
        "Plot twist! Let's debug this together.",
        "Remember: every error is a learning opportunity!",
        "Failed successfully? Wait, that's not right...",
        "Time to channel your inner detective! 🔍"
      ],
      idle: [
        "Still here if you need me...",
        "Just hanging out, doing tool things.",
        "No rush. I'm not going anywhere.",
        "Enjoying the view of your app canvas.",
        "Thinking about queries and components...",
        "Patiently waiting for our next adventure.",
        "Taking a moment to appreciate good code.",
        "I wonder what you'll build next?",
        "Just vibing here, ready when you are.",
        "Daydreaming about databases and APIs...",
        "Is it time to build something cool yet?",
        "Still hanging around! I'm very good at it.",
        "Contemplating the meaning of low-code life.",
        "Just chilling, watching the pixels go by.",
        "I'm not bored, you're bored! (Okay, maybe a little)",
        "Ready to jump into action whenever!",
        "Standing by for your next brilliant idea."
      ]
    };
    this.lastMessages = {}; // Track last message for each context

    // AI summary tracking
    this.buildingMessageCount = 0;
    this.hasPromptAPI = false;
    this.useAISummaries = false;
    this.lastSummaryTime = 0;
    this.aiSession = null;
    this.isCreatingSession = false;
  }

  async init() {
    // Check for Chrome AI availability
    await this.checkChromeAI();
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

  async checkChromeAI() {
    console.log('🚀 Toolie: Checking for Chrome AI capabilities...');
    console.log('🔍 Toolie: LanguageModel API exists?', 'LanguageModel' in self);

    try {
      // Check for Prompt API (LanguageModel) (Chrome 138+)
      if ('LanguageModel' in self) {
        console.log('🔍 Toolie: LanguageModel API exists, checking availability...');

        // Check availability with output language specified
        const availability = await self.LanguageModel.availability({
          expectedInputs: [{ type: "text", languages: ["en"] }],
          expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
        console.log('🔍 Toolie: LanguageModel API availability:', availability);

        if (availability === 'readily' || availability === 'available') {
          this.hasPromptAPI = true;
          this.useAISummaries = true;
          console.log('✅ Toolie: Prompt API available!');

          // Try to create session immediately (model already downloaded)
          // If this fails due to user gesture, it will be created on first keystroke
          const sessionCreated = await this.createAISession();
          if (sessionCreated) {
            console.log('✅ Toolie: AI summaries enabled! 🎉');
          } else {
            console.log('✅ Toolie: AI summaries will be enabled on first user interaction');
          }
        } else if (availability === 'after-download' || availability === 'downloadable') {
          console.log('⚠️ Toolie: Language model needs to be downloaded');
          console.log('💡 Toolie: Will download model on first use (requires user interaction)');

          // Mark as available but session will be created on first use (which happens after user types)
          this.hasPromptAPI = true;
          this.useAISummaries = true;
          console.log('✅ Toolie: Prompt API ready (download pending)');
        } else {
          console.log('⚠️ Toolie: Prompt API not available:', availability);
          this.useAISummaries = false;
        }
      } else {
        console.log('❌ Toolie: Prompt API not found (requires Chrome 138+)');
        this.useAISummaries = false;
      }

      console.log('📊 Toolie: Final AI status - hasPromptAPI:', this.hasPromptAPI, 'useAISummaries:', this.useAISummaries);

      if (!this.useAISummaries) {
        console.log('⚠️ Toolie: Chrome AI not available, using regular messages');
      }
    } catch (error) {
      console.log('❌ Toolie: Error checking AI capabilities:', error.message, error);
      this.useAISummaries = false;
    }
  }

  async createAISession() {
    try {
      console.log('🎭 Toolie: Creating AI session with personality...');

      const params = await self.LanguageModel.params();
      console.log('🔧 Toolie: Model params:', params);

      // Create session with Toolie's personality as system prompt
      // Note: topK and temperature must both be specified or neither
      const sessionConfig = {
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          {
            role: 'system',
            content: `You are Toolie, a slightly sarcastic but helpful mascot for Retool (a low-code platform).
Your job is to observe what Retool Assist is building and summarize it in 1-2 sentences with personality.

Tone guidelines:
- Be friendly but a bit cheeky
- Use casual language ("whipping up", "tossing in", "hooking up")
- Occasionally make light observations ("fancy!", "getting serious now", "oooh data tables")
- Keep it SHORT - max 2 sentences
- Focus on WHAT is being built, not how
- Be conversational, like you're a coworker watching over someone's shoulder

Example responses:
- "Whipping up a posts table with some mock data - 15-20 sample posts with all the usual suspects: IDs, dates, platforms, the works."
- "Just configured a bunch of charts and KPIs to use filtered data. Getting fancy with those dashboards! 📊"
- "Tossed in a query that grabs post data and filters it by date. Pretty standard stuff, but hey, it works!"
- "Building out a full social media dashboard - tables, charts, KPIs, the whole shebang. Someone's ambitious today!"

Remember: Short, sarcastic-but-nice, focused on the work being done.`
          }
        ],
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`📥 Toolie: Model download progress: ${Math.round(e.loaded * 100)}%`);
          });
        }
      };

      // Only add temperature and topK if they're valid
      if (params.defaultTemperature && params.defaultTopK && params.maxTemperature) {
        sessionConfig.temperature = Math.min(params.defaultTemperature * 1.2, params.maxTemperature);
        sessionConfig.topK = params.defaultTopK;
        console.log('🔧 Toolie: Using custom temperature:', sessionConfig.temperature, 'topK:', sessionConfig.topK);
      } else {
        console.log('🔧 Toolie: Using default temperature and topK');
      }

      this.aiSession = await self.LanguageModel.create(sessionConfig);

      console.log('✅ Toolie: AI session created with personality!');
      return true;
    } catch (error) {
      console.log('❌ Toolie: Failed to create AI session:', error.message);
      this.useAISummaries = false;
      this.aiSession = null;
      return false;
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
    console.log('Toolie: Setting up Assist observers');

    // Observe input field for typing (including CodeMirror contenteditable)
    const checkInput = () => {
      // Find both traditional inputs and CodeMirror contenteditable divs
      const inputs = document.querySelectorAll('textarea, input[type="text"], .cm-content[contenteditable="true"]');
      inputs.forEach(input => {
        if (!input.dataset.toolieObserved) {
          input.dataset.toolieObserved = 'true';
          console.log('Toolie: Observing input:', input.tagName, input.className);

          let typingTimeout;
          let messageTimeout;
          let keyPressCount = 0;
          let lastMessageTime = 0;

          const handleInput = () => {
            clearTimeout(typingTimeout);
            keyPressCount++;

            // Initialize AI session on first keystroke if needed (user gesture!)
            if (keyPressCount === 1 && this.hasPromptAPI && !this.aiSession && !this.isCreatingSession) {
              console.log('👆 Toolie: User gesture detected, initializing AI session...');
              this.isCreatingSession = true;
              this.createAISession().then(() => {
                this.isCreatingSession = false;
              });
            }

            // Only trigger typing state after 3+ key presses
            if (keyPressCount >= 3 && this.lastActivityType !== 'typing') {
              this.setAnimation('typing');
              this.lastActivityType = 'typing';
              console.log('Toolie: User is typing');
            }

            // Show message if typing for a while AND 5 seconds since last message
            const now = Date.now();
            if (keyPressCount >= 3 && (now - lastMessageTime) >= 5000) {
              this.showMessage('typing');
              lastMessageTime = now;
              console.log('Toolie: Showing typing message');
            }

            // Reset to normal 10 seconds after stopping
            typingTimeout = setTimeout(() => {
              this.setAnimation('normal');
              this.lastActivityType = null;
              keyPressCount = 0;
              lastMessageTime = 0;
              console.log('Toolie: User stopped typing');
            }, 10000);
          };

          // For contenteditable, listen to both input and keydown
          input.addEventListener('input', handleInput);
          if (input.contentEditable === 'true') {
            input.addEventListener('keydown', handleInput);
          }
        }
      });
    };

    // Check for inputs periodically
    setInterval(checkInput, 1000);

    // Check for Assist thinking/planning state
    this.observeAssistThinking();

    // Observe for building/generation activity
    this.observeBuilding();

    // Setup idle state detection
    this.setupIdleDetection();
  }

  observeAssistThinking() {
    console.log('Toolie: Setting up Assist thinking observer');

    // Check for "Thinking..." or "Planning..." text in the Assist sidebar
    const checkThinkingState = () => {
      // Look for the thinking/planning indicators
      const thinkingSelectors = [
        '[data-testid="Editor::SidebarContent"]', // Main sidebar
      ];

      for (const selector of thinkingSelectors) {
        const sidebar = document.querySelector(selector);
        if (sidebar) {
          const textContent = sidebar.textContent || '';

          // Check for errors first
          if (textContent.includes('Error') ||
              textContent.includes('Failed') ||
              textContent.includes('failed') ||
              textContent.includes('Something went wrong')) {
            if (this.lastActivityType !== 'assist-error') {
              this.setAnimation('normal');
              this.showMessage('error');
              this.lastActivityType = 'assist-error';
              console.log('Toolie: Assist encountered an error');
            }
            return;
          }

          // Check if Assist is thinking or planning
          if (textContent.includes('Thinking') && !textContent.includes('Stop response')) {
            if (this.lastActivityType !== 'assist-thinking') {
              this.setAnimation('thinking');
              this.showMessage('thinking');
              this.lastActivityType = 'assist-thinking';
              console.log('Toolie: Assist is thinking');
            }
            return;
          } else if (textContent.includes('Planning')) {
            if (this.lastActivityType !== 'assist-planning') {
              this.setAnimation('thinking');
              this.lastActivityType = 'assist-planning';
              this.buildingMessageCount = 0;
              console.log('Toolie: Assist is planning');
              // Start periodic messages
              this.startBuildingMessages();
            }
            return;
          } else if (textContent.includes('Building')) {
            if (this.lastActivityType !== 'assist-building') {
              this.setAnimation('excited');
              this.lastActivityType = 'assist-building';
              this.buildingMessageCount = 0;
              console.log('Toolie: Assist is building');
              // Start periodic messages
              this.startBuildingMessages();
            }
            return;
          }
        }
      }

      // If we get here and were previously thinking/planning, reset
      if (this.lastActivityType === 'assist-thinking' ||
          this.lastActivityType === 'assist-planning' ||
          this.lastActivityType === 'assist-building') {
        this.stopBuildingMessages();
        this.setAnimation('excited');
        this.showMessage('success');
        this.lastActivityType = 'assist-complete';
        console.log('Toolie: Assist finished');

        setTimeout(() => {
          this.setAnimation('normal');
          this.lastActivityType = null;
        }, 3000);
      }
    };

    // Check periodically for thinking state
    setInterval(checkThinkingState, 500);
  }

  startBuildingMessages() {
    // Clear any existing interval
    this.stopBuildingMessages();

    // Show first message immediately
    this.showBuildingMessage();

    // Then show messages every 8 seconds
    this.buildingMessageInterval = setInterval(() => {
      this.showBuildingMessage();
    }, 8000);
  }

  stopBuildingMessages() {
    if (this.buildingMessageInterval) {
      clearInterval(this.buildingMessageInterval);
      this.buildingMessageInterval = null;
    }
  }

  async showBuildingMessage() {
    this.buildingMessageCount++;
    console.log(`Toolie: Building message #${this.buildingMessageCount}, useAISummaries: ${this.useAISummaries}`);

    // Every 2nd message, try to show an AI summary
    if (this.buildingMessageCount % 2 === 0 && this.useAISummaries) {
      console.log('🤖 Toolie: Attempting AI summary (message #' + this.buildingMessageCount + ')...');
      const success = await this.showAISummary();
      if (success) {
        console.log('✅ Toolie: AI summary succeeded!');
        return; // AI summary was shown
      }
      console.log('❌ Toolie: AI summary failed, using regular message');
      // If AI summary failed, fall through to regular message
    }

    // Show regular building message
    console.log('Toolie: Showing regular building message');
    this.showMessage('building');
  }

  async showAISummary() {
    console.log('🔍 Toolie: showAISummary() called');
    try {
      // Extract content from Assist sidebar
      console.log('📝 Toolie: Extracting content from sidebar...');
      const content = this.extractAssistContent();

      if (!content) {
        console.log('⚠️ Toolie: No content extracted from sidebar');
        return false;
      }

      if (content.length < 50) {
        console.log('⚠️ Toolie: Not enough content to summarize (length:', content.length, ')');
        return false;
      }

      console.log('✅ Toolie: Content extracted, length:', content.length);
      console.log('📄 Toolie: Content preview:', content.substring(0, 100) + '...');

      // Generate summary with timeout
      console.log('⏱️ Toolie: Generating AI summary with 5s timeout...');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Summary timeout')), 5000)
      );

      const summaryPromise = this.generateAISummary(content);
      const summary = await Promise.race([summaryPromise, timeoutPromise]);

      if (summary) {
        console.log('✅ Toolie: AI generated summary:', summary);
        // Display the summary with AI-generated personality
        this.showMessageDirect(summary);
        return true;
      }

      console.log('⚠️ Toolie: No summary generated');
      return false;
    } catch (error) {
      console.log('❌ Toolie: AI summary failed:', error.message, error);
      return false;
    }
  }

  async generateAISummary(text) {
    console.log('🎯 Toolie: generateAISummary() called');
    console.log('🎯 Toolie: hasPromptAPI:', this.hasPromptAPI);
    console.log('🎯 Toolie: aiSession exists:', !!this.aiSession);
    console.log('🎯 Toolie: isCreatingSession:', this.isCreatingSession);

    if (!this.hasPromptAPI) {
      console.log('⚠️ Toolie: Prompt API not available');
      return null;
    }

    // If session doesn't exist and isn't being created, we can't generate
    if (!this.aiSession) {
      if (this.isCreatingSession) {
        console.log('⏳ Toolie: Session is being created, skipping this summary');
      } else {
        console.log('⚠️ Toolie: Session not initialized (will be created on first user input)');
      }
      return null;
    }

    try {
      console.log('🟢 Toolie: Sending prompt to AI...');
      console.log('📝 Toolie: Input text preview:', text.substring(0, 200));

      // Use the session with Toolie's personality to generate a summary
      const prompt = `Summarize what's being built here in 1-2 sentences with your sarcastic-but-helpful tone:\n\n${text}`;

      const summary = await this.aiSession.prompt(prompt);

      console.log('✅ Toolie: AI returned:', summary);

      return summary.trim();
    } catch (error) {
      console.log('❌ Toolie: Prompt API failed:', error.message, error);
      return null;
    }
  }


  showMessageDirect(messageText, duration = 4000) {
    // Show a message directly without using the quips system
    console.log('💬 Toolie: showMessageDirect() called with:', messageText);
    const textElement = document.getElementById('toolie-speech-text');
    console.log('💬 Toolie: textElement:', textElement);
    console.log('💬 Toolie: speechBubble:', this.speechBubble);

    if (textElement && this.speechBubble) {
      textElement.textContent = messageText;
      this.speechBubble.classList.add('visible');
      console.log('💬 Toolie: Speech bubble should now be visible with message:', messageText);

      // Clear existing timeout
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }

      // Hide after duration
      this.messageTimeout = setTimeout(() => {
        this.hideSpeechBubble();
      }, duration);
    } else {
      console.log('❌ Toolie: Cannot show message - textElement or speechBubble is null');
    }
  }

  extractAssistContent() {
    try {
      const sidebar = document.querySelector('[data-testid="Editor::SidebarContent"]');
      if (!sidebar) {
        console.log('Toolie: Could not find Assist sidebar');
        return null;
      }

      console.log('📋 Toolie: Found sidebar, extracting content...');

      // Look for step completion messages - these contain the actual work descriptions
      const completionMessages = [];

      // Find all paragraph elements that contain step completion descriptions
      const paragraphs = sidebar.querySelectorAll('._main_1b2th_1 p');
      console.log('📋 Toolie: Found', paragraphs.length, 'completion message paragraphs');

      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        // Skip empty or very short messages
        if (text.length > 20) {
          completionMessages.push(text);
        }
      });

      // Get the last 3-5 completion messages for context
      const recentMessages = completionMessages.slice(-5);
      console.log('📋 Toolie: Using last', recentMessages.length, 'completion messages');

      if (recentMessages.length === 0) {
        console.log('📋 Toolie: No completion messages found');
        return null;
      }

      // Join the messages together
      const conversationText = recentMessages.join(' ');
      console.log('📋 Toolie: Extracted completion messages length:', conversationText.length);
      console.log('📋 Toolie: Completion messages preview:', conversationText.substring(0, 300));

      // Limit to ~300 words for summarization
      const words = conversationText.trim().split(/\s+/).slice(-300);
      const limitedText = words.join(' ');

      console.log('📋 Toolie: Final extracted text length:', limitedText.length, 'characters');
      console.log('📋 Toolie: Final text preview:', limitedText.substring(0, 200));

      // Only return if we have substantial content
      if (limitedText.length < 50) {
        console.log('📋 Toolie: Content too short after extraction');
        return null;
      }

      return limitedText;
    } catch (error) {
      console.log('Toolie: Error extracting content:', error);
      return null;
    }
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

  setupIdleDetection() {
    console.log('Toolie: Setting up idle detection');
    this.lastActivityTime = Date.now();
    this.isIdle = false;

    // Update last activity time whenever there's any activity
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.isIdle = false;
    };

    // Listen for user activity
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);

    // Check for idle state every 10 seconds
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivityTime;
      const idleThreshold = 30000; // 30 seconds

      // If idle for 30+ seconds and not currently in another state
      if (timeSinceActivity >= idleThreshold &&
          !this.isIdle &&
          !this.lastActivityType) {
        this.isIdle = true;
        this.setAnimation('normal');
        this.showMessage('idle');
        console.log('Toolie: Entering idle state');
      }

      // Show another idle message every 60 seconds while idle
      if (this.isIdle && timeSinceActivity >= idleThreshold) {
        if (timeSinceActivity % 60000 < 10000) { // Within 10 seconds of each minute mark
          this.showMessage('idle');
        }
      }
    }, 10000); // Check every 10 seconds
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

    character.classList.remove('normal', 'thinking', 'excited', 'typing');
    character.classList.add(type);
    console.log('Toolie animation:', type);

    // Update eye positions based on state
    this.updateEyePositions(type);
  }

  updateEyePositions(state) {
    const leftEye = document.querySelector('.eyeball-left');
    const rightEye = document.querySelector('.eyeball-right');

    if (!leftEye || !rightEye) {
      console.log('Toolie: Could not find eyeballs');
      return;
    }

    let leftPos, rightPos;

    switch(state) {
      case 'thinking':
        // Planning/building - eyes up and to the right
        leftPos = { x: 90, y: 21 };
        rightPos = { x: 125, y: 16 };
        break;
      case 'typing':
        // User typing - eyes look down at input
        leftPos = { x: 81, y: 25 };
        rightPos = { x: 117, y: 20 };
        break;
      case 'excited':
      case 'normal':
      default:
        // Center - looking at user
        leftPos = { x: 85, y: 21 };
        rightPos = { x: 120, y: 17 };
        break;
    }

    // Update SVG transform attributes
    leftEye.setAttribute('transform', `translate(${leftPos.x},${leftPos.y})`);
    rightEye.setAttribute('transform', `translate(${rightPos.x},${rightPos.y})`);

    console.log(`Toolie eyes: left(${leftPos.x},${leftPos.y}) right(${rightPos.x},${rightPos.y})`);
  }

  showMessage(context, duration = 4000) {
    const messages = this.quips[context] || this.quips.idle;

    // Prevent showing the same message twice in a row
    let message;
    let attempts = 0;
    do {
      message = messages[Math.floor(Math.random() * messages.length)];
      attempts++;
    } while (message === this.lastMessages[context] && attempts < 10 && messages.length > 1);

    // Store this message as the last one for this context
    this.lastMessages[context] = message;

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
