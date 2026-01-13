# Fake Error Overlay for Google Classroom Cloak

## Overview

This feature adds a realistic Chrome error page overlay that appears when the user clicks away from the page (Google Classroom cloak). This helps disguise the page as a broken website when teachers or others are watching.

## Features

- ✅ **Automatic Activation**: Shows fake error when user clicks outside the window
- ✅ **Realistic Design**: Uses actual Chrome error page styling and content
- ✅ **Tab Camouflage**: Changes title to "Site unreachable" with no icon
- ✅ **Easy Dismissal**: Click "Checking the proxy and the firewall" link or "Reload" button
- ✅ **First-Time Notice**: Shows helpful message on first use
- ✅ **Non-Intrusive**: Overlay appears on top without page reload

## Files

### JavaScript
- `/assets/js/fake-error-overlay.js` - Main overlay manager

### CSS
- `/assets/css/fake-error-overlay.css` - Styling for overlay and notifications

### HTML
- Added references in `/index.html`
- Test page at `/test-fake-error.html`

## How It Works

### Initialization
```javascript
// Automatically initializes when page loads
window.FakeErrorOverlay.init();
```

### Blur Event
When the user clicks outside the browser window or switches tabs:
```javascript
window.addEventListener('blur', () => {
    window.FakeErrorOverlay.showOverlay();
});
```

### Dismissal
The overlay can be dismissed by:
1. Clicking the "Checking the proxy and the firewall" link
2. Clicking the "Reload" button
3. Programmatically: `window.FakeErrorOverlay.hideOverlay()`

### Tab Title Change
When showing the error:
```javascript
document.title = 'Site unreachable';
// Remove all favicons (no icon)
```

When hiding the error:
```javascript
document.title = this.originalTitle; // Restore
// Restore original favicon
```

## API Methods

### `FakeErrorOverlay.init()`
Initializes the overlay system, creates DOM elements, and sets up event listeners.

### `FakeErrorOverlay.showOverlay()`
Displays the fake error screen and changes the tab title.

### `FakeErrorOverlay.hideOverlay()`
Hides the fake error screen and restores the original tab title/icon.

### `FakeErrorOverlay.setUnreachableTitle()`
Changes the tab title to "Site unreachable" and removes the favicon.

## Testing

### Manual Testing
1. Open `/test-fake-error.html`
2. Click outside the browser window
3. Verify the error screen appears
4. Click "Checking the proxy and the firewall" to dismiss
5. Verify the screen disappears

### Interactive Controls
The test page provides buttons to:
- Show fake error manually
- Hide fake error manually
- Reset first-time notice
- Monitor focus/blur events

## Customization

### Change Error Message
Edit the `ERROR_HTML` constant in `/assets/js/fake-error-overlay.js`:
```javascript
const ERROR_HTML = `<!DOCTYPE html>
<!-- Your custom error page HTML -->
...
`;
```

### Modify Trigger Behavior
Change when the overlay appears by editing the event listener:
```javascript
// Currently triggers on blur
window.addEventListener('blur', () => this.showOverlay());

// Could also trigger on:
// - Specific key press
// - Timer
// - Custom event
```

### Style Adjustments
Edit `/assets/css/fake-error-overlay.css` to customize:
- Overlay appearance
- Animation timing
- First-time notice styling

## Browser Compatibility

- ✅ Chrome/Edge (Primary target)
- ✅ Firefox
- ✅ Safari
- ✅ Brave (Tested with Brave-specific styling)

## Storage

Uses `localStorage` to track:
- `verdis_fakeErrorShown`: Whether the first-time notice has been shown

## Security Considerations

- Overlay only affects visual appearance
- Does not interfere with page functionality
- Can be easily disabled via browser developer tools (intended behavior)
- No external dependencies or resources loaded

## Troubleshooting

### Overlay doesn't appear
1. Check browser console for errors
2. Verify JavaScript file is loaded: `window.FakeErrorOverlay`
3. Test blur event: Click address bar or switch tabs

### Tab title doesn't change
1. Check if browser blocks title changes
2. Verify `setUnreachableTitle()` is called
3. Some browsers may cache titles

### First-time notice doesn't show
1. Clear localStorage: `localStorage.removeItem('verdis_fakeErrorShown')`
2. Reload the page
3. Check if notice is hidden behind other elements

## Future Enhancements

Potential improvements:
- [ ] Multiple error page templates
- [ ] Customizable trigger keys (e.g., panic button)
- [ ] Randomized error messages
- [ ] Sound effects (optional)
- [ ] Mobile-optimized layout
- [ ] Configurable auto-dismiss timer

## Credits

- Chrome error page design: © Google/Chromium Authors
- Implementation: Verdis Team
- Requested by: User requirements for Google Classroom cloak
