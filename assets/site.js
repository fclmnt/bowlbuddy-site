(() => {
    const root = document.documentElement;
    root.classList.remove("no-js");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Appearance: follows the system until the header button pins light or dark.
    // The <head> script applies a saved choice before the first paint.
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    const colors = { light: "#f5f5f7", dark: "#0b0b0c" };
    const pinned = () => (root.dataset.theme === "light" || root.dataset.theme === "dark" ? root.dataset.theme : null);
    const current = () => pinned() || (systemDark.matches ? "dark" : "light");
    const toggle = document.querySelector(".theme-toggle");

    const applyTheme = () => {
        const theme = pinned();
        document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
            meta.content = colors[theme || (meta.media.includes("dark") ? "dark" : "light")];
        });
        if (toggle) {
            const next = current() === "dark" ? "light" : "dark";
            toggle.setAttribute("aria-label", toggle.dataset[next === "dark" ? "labelDark" : "labelLight"]);
        }
    };

    if (toggle) {
        toggle.addEventListener("click", () => {
            const next = current() === "dark" ? "light" : "dark";
            // Back to following the system when the choice matches it.
            const matchesSystem = next === (systemDark.matches ? "dark" : "light");
            const swap = () => {
                if (matchesSystem) delete root.dataset.theme;
                else root.dataset.theme = next;
                applyTheme();
            };
            // Cross-fade instead of flashing the whole page to the other brightness.
            if (document.startViewTransition && !reduceMotion) document.startViewTransition(swap);
            else swap();
            try {
                if (matchesSystem) localStorage.removeItem("theme");
                else localStorage.setItem("theme", next);
            } catch (e) {}
        });
    }
    systemDark.addEventListener("change", applyTheme);
    applyTheme();

    // Header shadow once the page scrolls.
    const header = document.querySelector(".site-header");
    const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Sections fade in as they scroll into view.
    const revealed = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealed.forEach((el) => el.classList.add("in"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px" });
        revealed.forEach((el) => io.observe(el));
    }
})();
