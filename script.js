(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  const button = document.getElementById("menuButton");
  const nav = document.getElementById("globalNav");
  const label = document.getElementById("menuLabel");
  const mobile = window.matchMedia("(max-width: 1100px)");

  // Keep anchors and the final content clear of fixed controls, including text zoom.
  const actions = document.querySelector(".mobile-actions");
  const updateOffsets = () => {
    const root = document.documentElement;
    root.style.setProperty(
      "--header-offset",
      `${header?.getBoundingClientRect().height || 0}px`,
    );
    root.style.setProperty(
      "--actions-offset",
      `${actions?.getBoundingClientRect().height || 0}px`,
    );
  };
  document.documentElement.dataset.enhanced = "true";
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(updateOffsets);
    if (header) observer.observe(header);
    if (actions) observer.observe(actions);
  }
  window.addEventListener("resize", updateOffsets, { passive: true });

  // A disclosure menu: links remain available when JavaScript is unavailable.
  if (header && button && nav) {
    const setMenu = (open, restoreFocus = false) => {
      nav.hidden = mobile.matches && !open;
      button.setAttribute("aria-expanded", String(mobile.matches && open));
      if (label) label.textContent = open ? "閉じる" : "メニュー";
      if (restoreFocus) button.focus();
    };
    const sync = () => {
      // If resizing hides a currently focused navigation link, return to the trigger.
      const restore = mobile.matches && nav.contains(document.activeElement);
      button.hidden = !mobile.matches;
      setMenu(false, restore);
    };
    header.dataset.enhanced = "true";
    sync();
    mobile.addEventListener("change", sync);
    button.addEventListener("click", () =>
      setMenu(button.getAttribute("aria-expanded") !== "true"),
    );
    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !mobile.matches) return;
      setMenu(false);
      // For in-page navigation, place keyboard focus at the destination as well.
      const url = new URL(link.href);
      if (url.pathname === location.pathname && url.hash) {
        const destination = document.getElementById(
          decodeURIComponent(url.hash.slice(1)),
        );
        if (destination) {
          destination.setAttribute("tabindex", "-1");
          destination.focus({ preventScroll: true });
        }
      }
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        button.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false, true);
      }
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setMenu(false);
    });
    header.addEventListener("focusout", (event) => {
      if (event.relatedTarget && !header.contains(event.relatedTarget))
        setMenu(false);
    });
  }
  updateOffsets();

  // Only expose connected HTTPS destinations; no inactive or '#' contact links.
  const contacts = window.SEIBU_CONTACTS || {};
  let available = 0;
  document.querySelectorAll("[data-contact-link]").forEach((link) => {
    const value = contacts[link.dataset.contactLink];
    if (typeof value !== "string" || !value.trim()) return;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" || url.username || url.password) return;
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.hidden = false;
      available += 1;
    } catch {
      /* Leave unconfigured destinations hidden. */
    }
  });
  const panel = document.getElementById("onlineContacts");
  const note = document.getElementById("onlineNote");
  if (panel) panel.hidden = available === 0;
  if (note) note.hidden = available > 0;
  const year = document.getElementById("currentYear");
  if (year) year.textContent = String(new Date().getFullYear());
})();
