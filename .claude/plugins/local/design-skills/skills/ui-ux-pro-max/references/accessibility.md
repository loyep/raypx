# Accessibility Checklist

## WCAG 2.1 Level AA Requirements

### Perceivable

1. **Text Alternatives (1.1)**
   - [ ] All images have meaningful alt text
   - [ ] Decorative images use alt=""
   - [ ] Complex images have extended descriptions

2. **Time-based Media (1.2)**
   - [ ] Videos have captions
   - [ ] Audio has transcripts
   - [ ] Live content has alternatives

3. **Adaptable (1.3)**
   - [ ] Use semantic HTML elements
   - [ ] Form inputs have labels
   - [ ] Instructions don't rely solely on sensory characteristics

4. **Distinguishable (1.4)**
   - [ ] Color contrast ≥ 4.5:1 for text
   - [ ] Text can be resized to 200%
   - [ ] Text spacing can be modified
   - [ ] Content doesn't require horizontal scroll at 320px

### Operable

5. **Keyboard Accessible (2.1)**
   - [ ] All functionality available via keyboard
   - [ ] No keyboard traps
   - [ ] Focus order is logical
   - [ ] Skip links provided

6. **Enough Time (2.2)**
   - [ ] Time limits can be extended
   - [ ] Moving content can be paused

7. **Seizures and Physical Reactions (2.3)**
   - [ ] No content flashes > 3 times/second

8. **Navigable (2.4)**
   - [ ] Page has descriptive title
   - [ ] Focus is visible
   - [ ] Link text is descriptive
   - [ ] Multiple navigation methods available

9. **Input Modalities (2.5)**
   - [ ] Touch targets are at least 44x44px
   - [ ] Motion-activated features have alternatives

### Understandable

10. **Readable (3.1)**
    - [ ] Page language is declared
    - [ ] Language changes are marked

11. **Predictable (3.2)**
    - [ ] Focus doesn't trigger unexpected changes
    - [ ] Input doesn't trigger unexpected changes
    - [ ] Navigation is consistent
    - [ ] Components are identified consistently

12. **Input Assistance (3.3)**
    - [ ] Form errors are identified
    - [ ] Error suggestions are provided
    - [ ] Error prevention for critical actions

### Robust

13. **Compatible (4.1)**
    - [ ] Valid HTML
    - [ ] Name, Role, Value for custom components
    - [ ] Status messages announced

## Common ARIA Patterns

### Landmark Roles
```html
<header role="banner">
<nav role="navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">
```

### Form Patterns
```html
<!-- Required field -->
<label for="email">
  Email <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>

<!-- Error message -->
<input aria-describedby="email-error" aria-invalid="true">
<span id="email-error" role="alert">Please enter a valid email</span>

<!-- Fieldset -->
<fieldset>
  <legend>Shipping Address</legend>
  <!-- fields -->
</fieldset>
```

### Interactive Components
```html
<!-- Button -->
<button type="button" aria-pressed="false">Toggle</button>

<!-- Dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">...</h2>
</div>

<!-- Tab panel -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1">...</div>
```

## Testing Tools

- **Axe DevTools**: Browser extension for automated testing
- **WAVE**: Visual accessibility checker
- **Lighthouse**: Built into Chrome DevTools
- **VoiceOver/NVDA**: Screen reader testing
- **Keyboard Testing**: Tab through entire page
