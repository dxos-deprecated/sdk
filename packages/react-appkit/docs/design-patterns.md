# Design Patterns

- Use arrow functions for React components.

- Be consistent with components vs. containers (uses client hooks).
  - https://dev.to/notfocaccia/container-vs-presentational-components-in-react-redux-3lel

- Group hooks at start of function.

- Styles
    - Don't use inline styles in components.
    - Use theme colors and padding.
    - Use flexbox.
    - Don't use specific width/height geometry.

- Dialogs
    - Fixed predictable sizes: `<Dialog fullWidth maxWidth="xs" ...>`
    - TODO(burdon): Standardize header (icon).
