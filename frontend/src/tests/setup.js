import '@testing-library/jest-dom/vitest'

// jsdom does not implement scrollIntoView; some components call it.
Element.prototype.scrollIntoView = () => {}

// localStorage is provided by jsdom, but clear it between tests
// so one test never sees another test's tokens.
afterEach(() => {
  localStorage.clear()
})
