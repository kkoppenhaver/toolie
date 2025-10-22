# Toolie - Your Retool Assistant

A Chrome extension that brings Toolie (Retool's mascot) to life as a Clippy-style assistant in the Retool Assist tab.

## Features

- **Animated Character**: Toolie appears with animated eyes that look around, think, and get excited
- **Contextual Quips**: Helpful and sarcastic messages based on what you're doing:
  - Welcome messages when opening Assist
  - Comments while you're typing
  - Excitement while building
  - Celebration on success
  - Gentle ribbing on errors
- **Auto-hiding Speech Bubbles**: Messages fade in and out automatically
- **Non-intrusive**: Positioned near the Assist input, doesn't block your work

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `toolie` directory
5. Navigate to any Retool page with the Assist tab

## Missing Assets

You'll need to add extension icons before publishing:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can create these from the `toolie.svg` file or use placeholder images for testing.

## How It Works

- **Detection**: Watches for Assist tab indicators in the Retool DOM
- **Positioning**: Places Toolie to the right of the Assist input (bottom-left area)
- **Animations**: CSS animations for eye movements (looking around, thinking, excited)
- **Quips**: Random selection from contextual message pools
- **Triggers**:
  - Opening Assist tab → Welcome message
  - Typing in input → Thinking animation + typing quip
  - Building/generating → Excited animation + building quip
  - Completion → Success message

## Customization

### Adding More Quips

Edit the `quips` object in `content.js`:

```javascript
this.quips = {
  welcome: ["Your message here", ...],
  typing: [...],
  building: [...],
  success: [...],
  error: [...]
}
```

### Adjusting Position

Edit the positioning in `toolie.css`:

```css
#toolie-container {
  bottom: 60px;  /* Distance from bottom */
  left: 280px;   /* Distance from left */
}
```

### Modifying Animations

Eye animations are controlled by CSS classes in `toolie.css`:
- `.eyeball-left` and `.eyeball-right` - Eye elements
- `@keyframes lookAround` - Normal animation
- `@keyframes thinking` - Thinking state
- `@keyframes excited` - Excited state

## Development Notes

The extension currently detects the Assist tab using multiple selectors. You may need to adjust these based on Retool's actual DOM structure:

```javascript
const assistIndicators = [
  '[data-testid*="assist"]',
  '[class*="assist"]',
  '[aria-label*="Assist"]'
];
```

Test in your Retool environment and update selectors as needed.

## Troubleshooting

- **Toolie doesn't appear**: Check that you're on a Retool page with the Assist tab open
- **No animations**: Make sure the SVG loaded correctly (check browser console)
- **Wrong position**: Adjust CSS positioning values based on your Retool theme/layout
- **No messages**: Check browser console for errors, verify DOM selectors match Retool's structure
