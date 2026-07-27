/**
 * Scroll to an in-page section, or navigate home with hash when off-page.
 * @param {string} id - Element id without '#'
 */
export function scrollToSection(id) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
    return;
  }
  window.location.assign(`/#${id}`);
}

export function handleSectionClick(e, id) {
  e.preventDefault();
  scrollToSection(id);
}
