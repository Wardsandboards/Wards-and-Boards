// jsdom does not implement these; stub them so components that call them
// during effects/handlers don't throw under test.
Element.prototype.scrollIntoView = () => {}
window.scrollTo = () => {}
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: () => Promise.resolve() },
    configurable: true,
  })
}
