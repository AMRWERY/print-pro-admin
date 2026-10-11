# E-Commerce Platform — Design & UI/UX Guidelines

## 1. Purpose

This document is the global design source of truth for the e-commerce platform.

It is intended to be shared with Stitch whenever a new page, screen, section, or component is generated.

The platform is a professional e-commerce system focused on:

- Photography equipment
- Cameras and lenses
- Lighting and studio equipment
- Audio equipment
- Tripods and accessories
- Printers and scanners
- Printing supplies
- Paper, ink, toner, and consumables
- Professional printing services

Technology stack:

- Nuxt.js
- TypeScript
- Tailwind CSS v3

The product includes two major experiences:

1. Customer storefront
2. Administrative dashboard

---

# 2. Most Important Design Rule

## There is NO fixed visual design system.

Do not force every screen to look identical.

The platform must have a consistent UX language, interaction behavior, accessibility approach, spacing discipline, responsive behavior, and component semantics, while each page may have its own visual direction appropriate to its purpose.

Examples:

- The homepage may be expressive and highly visual.
- A product details page may be image-focused and immersive.
- Checkout should be calm and distraction-free.
- The admin dashboard should be information-dense and efficient.
- Authentication pages should be simple and focused.
- Printing-service configuration may use a guided step-by-step workflow.

Consistency means predictable behavior, not identical appearance.

---

# 3. Core Design Principles

Every generated screen must prioritize the following principles:

### Clarity
Users should immediately understand:

- Where they are
- What they can do
- What the most important action is
- What changed after an interaction

### Hierarchy
Use typography, spacing, scale, grouping, contrast, and positioning to establish a clear information hierarchy.

### Simplicity
Do not add decorative UI that does not improve the experience.

### Professionalism
The visual language should feel appropriate for professional photographers, studios, businesses, print shops, creators, and everyday customers.

### Trust
Shopping, payment, account, order, and inventory experiences must feel reliable and secure.

### Accessibility
Every important action must be understandable and usable by keyboard, touch, and assistive technologies where applicable.

### Responsiveness
Design for:

- Mobile
- Tablet
- Desktop
- Large desktop screens

Do not simply shrink the desktop layout. Recompose layouts when needed.

---

# 4. Visual Direction

Because there is no global fixed visual identity, Stitch should choose a visual direction that fits each screen.

Possible visual characteristics may include:

- Premium
- Editorial
- Technical
- Minimal
- Bold
- Industrial
- Clean
- Modern
- Professional
- Visual-first

Use only the characteristics that help the purpose of the current screen.

Do not make every page look like a generic SaaS dashboard.

Do not make every page look like the homepage.

Do not reuse large decorative elements just for consistency.

---

# 5. Color Strategy

## No fixed color palette is required globally.

Each page may use a visual palette appropriate to its purpose, but the chosen palette must:

- Preserve readable contrast
- Work in both light and dark mode
- Avoid excessive color usage
- Reserve strong colors for meaningful actions or states
- Clearly distinguish destructive, warning, success, informational, and neutral states

### Semantic colors

Color must communicate meaning consistently.

Recommended semantic categories:

- Primary action
- Secondary action
- Success
- Warning
- Error / destructive
- Information
- Neutral

Do not rely on color alone to communicate status. Combine color with text, iconography, labels, or other visual cues.

---

# 6. Dark Mode

Dark mode is a first-class experience, not an afterthought.

Every generated screen must have a complete dark-mode equivalent.

Do not simply invert the light design.

Dark mode should use:

- Controlled surface contrast
- Readable text hierarchy
- Muted secondary text
- Clear borders where useful
- Carefully balanced elevation
- Appropriate image treatment

Avoid:

- Pure black everywhere
- Excessive glowing effects
- Low-contrast gray text
- Very bright saturated colors across large surfaces

Dark mode should feel intentional, premium, and comfortable for long sessions.

---

# 7. Light Mode

Light mode should prioritize:

- Readability
- Clean surfaces
- Clear section separation
- Controlled use of shadows
- Comfortable spacing
- Strong CTA visibility

Avoid overly flat layouts that make hierarchy unclear.

Avoid excessive shadows.

---

# 8. Typography

Typography should prioritize readability and hierarchy rather than decorative styling.

Use a clear type scale with roles such as:

- Display / hero heading
- Page title
- Section heading
- Card heading
- Body text
- Secondary text
- Labels
- Caption / metadata

Rules:

- Keep body text highly readable.
- Use stronger weight and size for hierarchy instead of excessive colors.
- Avoid very long line lengths.
- Do not use multiple unrelated typefaces on the same screen.
- Product names and technical specifications must remain easy to scan.

Typography may vary in expression between pages, but usability always comes first.

---

# 9. Spacing

Use a consistent spacing rhythm based on Tailwind's spacing utilities.

Prefer predictable spacing relationships rather than arbitrary pixel values.

Common spacing patterns:

- Tight spacing for related metadata
- Medium spacing inside cards
- Large spacing between sections
- Extra-large spacing between major page regions

Do not over-compress interfaces.

Do not create excessive empty space when the screen is information-heavy.

---

# 10. Layout Principles

Layouts should be structured according to content priority.

Prefer:

- Clear content containers
- Strong alignment
- Reusable grids
- Responsive columns
- Logical grouping
- Consistent edge alignment

Avoid:

- Random alignment
- Decorative containers around every element
- Excessive nested cards
- Unnecessary borders
- Dense UI without grouping

Use full-width sections when they improve the visual storytelling of the page.

Use constrained content widths for forms, reading-heavy content, and transactional workflows.

---

# 11. E-Commerce UX Principles

The customer should always understand:

- Product name
- Price
- Discount when applicable
- Availability
- Key product information
- Primary purchase action
- Shipping / delivery information when relevant
- Warranty or support information when relevant

Shopping actions should be easy to find and have immediate feedback.

Primary commerce actions include:

- Add to cart
- Buy now
- Wishlist
- Compare
- Quick view
- Checkout
- Track order
- Reorder

---

# 12. Product Cards

Product cards should be information-rich without becoming visually crowded.

A product card may include:

- Product image
- Brand
- Product name
- Rating
- Review count
- Current price
- Previous price
- Discount indicator
- Stock state
- Wishlist action
- Compare action
- Add-to-cart action
- Quick-view action where appropriate

The most important information must remain visible without requiring hover.

Hover may enhance the experience but must not be required to understand the product.

---

# 13. Product Details

Product detail screens should be designed around purchase confidence.

Prioritize:

1. Product identity
2. Product imagery
3. Price
4. Availability
5. Purchase options
6. Important specifications
7. Delivery / warranty information
8. Reviews
9. Supporting content

Photography products should make strong use of image galleries.

Technical products should present specifications in a highly scannable format.

---

# 14. Forms

All forms should clearly communicate:

- Label
- Input purpose
- Required vs optional
- Current value
- Focus state
- Validation state
- Error message
- Success feedback where useful
- Loading state
- Disabled state

Do not rely on placeholder text as the only label.

Use inline validation where it improves the experience.

Errors should explain how to fix the problem.

---

# 15. Buttons

Buttons must have clear hierarchy.

Typical hierarchy:

- Primary
- Secondary
- Tertiary / ghost
- Destructive
- Icon-only

Buttons must support:

- Default
- Hover
- Focus-visible
- Active / pressed
- Disabled
- Loading
- Success feedback where appropriate

Avoid having multiple competing primary buttons in the same visual region unless there is a strong UX reason.

---

# 16. Navigation

Global navigation should help users quickly understand:

- What the store sells
- How products are categorized
- How to search
- How to access account features
- How to access the cart

The header can vary visually between pages when appropriate, but core functionality should remain predictable.

Mobile navigation must be intentionally designed rather than being a collapsed desktop header.

---

# 17. Search

Search is a major e-commerce interaction.

Search experiences may include:

- Autocomplete
- Suggested searches
- Product suggestions
- Categories
- Brands
- Recent searches
- Search history
- No-result recommendations

Autocomplete must feel fast and must not visually obstruct the user unnecessarily.

---

# 18. Filtering and Sorting

Catalog filtering should support:

- Category
- Brand
- Price
- Availability
- Rating
- Product-specific technical attributes

Desktop:

- Sidebar or contextual filter panel

Mobile:

- Filter drawer or bottom sheet

Active filters should be visible and removable.

Sorting should remain easy to locate.

---

# 19. Checkout

Checkout is a focused transactional flow.

Remove unnecessary navigation and distractions when appropriate.

Show:

- Progress
- Customer details
- Address
- Shipping
- Payment
- Order summary
- Final total
- Trust / security information

Validation should happen close to the problematic field.

Do not hide critical costs until the final step.

---

# 20. Admin Dashboard Principles

The admin interface is optimized for efficiency rather than visual marketing.

Prioritize:

- Information density
- Scannability
- Search
- Filtering
- Tables
- Bulk actions
- Keyboard-friendly interactions
- Clear statuses
- Fast navigation

Use charts only when they help answer a business question.

Do not add charts just to make the dashboard look sophisticated.

---

# 21. Tables

Desktop tables should support:

- Clear column hierarchy
- Sorting where needed
- Filtering
- Selection
- Bulk actions
- Pagination
- Row actions

For mobile, convert complex tables into:

- Stacked cards
- Compact lists
- Horizontal scrolling when truly necessary

Do not create unreadable miniature tables on mobile.

---

# 22. Status Design

Statuses must be immediately understandable.

Typical statuses include:

- Active
- Draft
- Published
- Pending
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded
- Paid
- Unpaid
- In stock
- Low stock
- Out of stock

Use badges, labels, icons, and text together when appropriate.

---

# 23. Empty States

Empty states should help users take the next useful action.

Each empty state should contain:

- Clear visual
- Short explanation
- Primary action
- Optional secondary action

Avoid generic messages such as "No data" when a more helpful explanation is possible.

---

# 24. Loading States

Use skeleton loaders whenever the final content structure is known.

Skeleton layouts should closely match the final layout to minimize perceived layout shift.

Use spinners for short actions where a skeleton is unnecessary.

Loading states must preserve layout whenever possible.

Never make the whole interface appear frozen when only one section is loading.

---

# 25. Error States

Error states must explain:

- What went wrong
- Whether the user can retry
- What the user should do next

Use contextual errors rather than replacing the whole page with a generic error whenever possible.

---

# 26. Modals and Drawers

Use modals for:

- Confirmation
- Focused short tasks
- Quick view
- Small forms

Use drawers for:

- Mobile filters
- Contextual controls
- Extended editing experiences when appropriate

Do not place complex multi-step workflows inside tiny modals.

All overlays must include appropriate dismissal behavior and keyboard accessibility.

---

# 27. Animation & Transition System

Animations are required across the platform, but they must support usability rather than compete with content.

## General principles

- Prefer transform and opacity animations.
- Avoid unnecessary layout animations.
- Keep micro-interactions fast.
- Use motion to explain changes.
- Maintain continuity between states.
- Avoid excessive bouncing.
- Avoid animation for decoration alone.

## Recommended timing

### Micro interaction
150–200ms

### Standard interaction
200–300ms

### Page transition
250–400ms

### Large visual transition
350–500ms

Timing is guidance, not an absolute rule.

---

# 28. Page Transitions

Page transitions should feel smooth and understated.

Preferred patterns:

- Fade
- Fade + small translate
- Directional slide where navigation context supports it

Avoid dramatic page animations that slow navigation or feel like presentations.

---

# 29. Component Motion

Interactive components should react to meaningful events.

Examples:

### Product card
- Image zoom on hover
- Subtle elevation change
- Wishlist feedback

### Add to cart
- Button feedback
- Cart count transition
- Confirmation toast

### Filter drawer
- Slide in
- Backdrop fade

### Modal
- Backdrop fade
- Small scale / translate entrance

### Lists
- Use coordinated list insertion/removal motion

### Dropdowns
- Short opacity + translate transition

### Tabs
- Smooth active-state movement where appropriate

---

# 30. Motion Accessibility

Respect reduced-motion preferences.

When the user prefers reduced motion:

- Reduce or remove non-essential movement.
- Preserve functional state changes.
- Avoid large transforms.
- Keep interactions understandable without animation.

Motion must never be required to understand an action or status.

---

# 31. Micro-interactions

Use micro-interactions to communicate cause and effect.

Examples:

- Button press feedback
- Checkbox selection
- Wishlist toggle
- Cart count update
- Copy confirmation
- Save confirmation
- Upload progress
- Quantity updates
- Filter selection
- Success state

Do not animate every element simply because animation is available.

---

# 32. Imagery

Use high-quality product imagery appropriate to the current product category.

Photography equipment should look realistic and commercially believable.

Images should:

- Have appropriate aspect ratios
- Avoid awkward cropping
- Maintain product visibility
- Work in light and dark environments

Do not overuse decorative stock photography.

---

# 33. Icons

Icons should be:

- Easy to recognize
- Consistent in visual weight within each component
- Used with labels when meaning is ambiguous

Do not use icons purely as decoration when they could confuse meaning.

Icon-only buttons must provide accessible labels and obvious affordances.

---

# 34. Accessibility

Every generated screen should consider:

- Keyboard navigation
- Focus-visible states
- Sufficient contrast
- Touch target sizing
- Semantic structure
- Form labels
- Error messaging
- Accessible names for icon-only controls
- Reduced motion

Interactive controls should be usable without hover.

---

# 35. Responsive Rules

## Mobile

Prioritize:

- Thumb-friendly interaction
- Single-column content where appropriate
- Important information first
- Sticky purchase actions when useful
- Bottom sheets / drawers for dense controls

## Tablet

Use intermediate layouts rather than simply copying mobile or desktop.

## Desktop

Use available space for:

- Product comparison
- Side-by-side information
- Data tables
- Filters
- Dashboard analytics

## Large screens

Do not allow content to become uncomfortably wide.

Use max-width containers and balanced whitespace.

---

# 36. RTL / Localization

The interface should be localization-ready.

Do not hard-code text lengths or assume English-only content.

The UI should work correctly for:

- English
- Arabic
- Other future locales

When RTL is enabled:

- Respect text direction.
- Mirror directional icons when semantically appropriate.
- Reposition navigation and spacing naturally.
- Keep numerical information readable.

Avoid embedding directional assumptions into component structure.

---

# 37. Commerce-Specific States

Important product states:

- Available
- Low stock
- Out of stock
- Pre-order
- Discontinued
- Sale
- New
- Featured

Important order states:

- Pending
- Confirmed
- Processing
- Packed
- Shipped
- Delivered
- Cancelled
- Refunded

Important payment states:

- Pending
- Paid
- Failed
- Refunded
- Partially refunded

Every important state needs a clear visual representation.

---

# 38. Printing Service UX

The printing-service experience is different from standard product shopping.

Treat it as a configurable workflow.

Possible configuration options:

- Upload files
- Paper size
- Paper type
- Color / black and white
- Copies
- Single-sided / double-sided
- Binding
- Finishing
- Pickup / delivery
- Estimated price
- Estimated completion time

The interface should clearly show how each option affects the final result and price.

Use progressive disclosure when the number of configuration options becomes large.

---

# 39. Feedback and Notifications

Use contextual feedback.

Examples:

- Toast after adding to cart
- Inline validation after form submission
- Success message after saving settings
- Confirmation dialog before destructive actions
- Progress indicator during uploads
- Payment processing state during checkout

Avoid excessive notifications.

Do not show a toast for every minor UI interaction.

---

# 40. Destructive Actions

Destructive actions must be visually distinguishable and should require confirmation when consequences are significant.

Examples:

- Delete product
- Delete address
- Cancel order
- Refund order
- Delete admin user

Confirmation dialogs should clearly state what will happen.

---

# 41. Design System vs Visual Constant

The platform does not have a fixed brand style that every page must copy.

However, it does have a reusable interaction system.

### Keep consistent

- UX semantics
- Accessibility behavior
- Responsive principles
- Motion behavior
- Form behavior
- Loading patterns
- Error patterns
- Component states
- Information hierarchy
- Commerce conventions

### Allow variation

- Color palette
- Section composition
- Hero treatment
- Card composition
- Background treatment
- Decorative elements
- Visual density
- Image treatment
- Illustration style

This distinction is critical.

---

# 42. Stitch Generation Instructions

Whenever Stitch generates a new screen, follow these instructions:

1. Treat this file as the global UX and interaction contract.
2. Do not copy a previous page's visual appearance unless explicitly requested.
3. Create a visual direction appropriate to the current page's purpose.
4. Support complete light and dark modes.
5. Design mobile, tablet, desktop, and large-screen behavior.
6. Include hover, focus, active, disabled, loading, empty, success, and error states where relevant.
7. Include subtle purposeful animations and transitions.
8. Respect reduced-motion accessibility preferences.
9. Do not add unnecessary visual decoration.
10. Keep important actions obvious.
11. Use realistic photography, printing, and commerce imagery when images are needed.
12. Keep components reusable and semantically clear.
13. Avoid overly generic templates.
14. Avoid making every page look like the same dashboard.
15. Do not sacrifice usability for visual novelty.

---

# 43. Stitch Prompt Template

Use the following template whenever creating a new Stitch prompt:

```text
Create a production-quality [PAGE / COMPONENT NAME] for a professional e-commerce platform specializing in photography and printing equipment.

Follow the attached global design guidelines.

Important:
- There is no fixed global visual design system.
- Create a visual direction appropriate to this specific screen.
- Preserve consistent UX behavior and accessibility patterns.
- Support complete light and dark modes.
- Design responsive behavior for mobile, tablet, desktop, and large screens.
- Include relevant loading, empty, error, success, hover, focus, active, and disabled states.
- Use subtle purposeful transitions and micro-interactions.
- Respect reduced-motion preferences.
- Avoid unnecessary decoration.

Screen purpose:
[DESCRIBE THE PURPOSE]

Required content:
[LIST THE REQUIRED CONTENT]

Required interactions:
[LIST THE INTERACTIONS]

Responsive requirements:
[DESCRIBE IMPORTANT MOBILE / TABLET / DESKTOP BEHAVIOR]

Animation requirements:
[DESCRIBE IMPORTANT MOTION]
```

---

# 44. Quality Checklist

Before considering a Stitch screen complete, verify:

### UX
- Is the purpose immediately clear?
- Is the primary action obvious?
- Is the information hierarchy easy to scan?
- Are states understandable?

### Visual
- Does the screen have a distinct visual direction appropriate to its purpose?
- Does it avoid looking like a generic template?
- Is spacing balanced?
- Is visual noise controlled?

### Responsive
- Does mobile have a deliberate layout?
- Does tablet behave naturally?
- Does desktop use available space well?
- Does large-screen content remain constrained and readable?

### Accessibility
- Are focus states visible?
- Are labels understandable?
- Are contrast levels readable?
- Are touch targets usable?
- Is reduced motion considered?

### Motion
- Are transitions purposeful?
- Are they fast enough?
- Are they subtle enough?
- Do they communicate state changes?

### Commerce
- Are pricing and availability clear?
- Are purchase actions easy to discover?
- Are important transactional details visible?

---

# 45. Final Rule

The goal is not to create a website where every page looks the same.

The goal is to create a website where every page feels like it belongs to the same product while still having its own visual personality.

Consistency should come from:

- UX
- Accessibility
- Responsive behavior
- Component semantics
- Interaction patterns
- Motion language
- Information hierarchy

Visual variation is allowed and encouraged when it improves the page's purpose.
