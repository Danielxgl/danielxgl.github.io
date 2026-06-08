(() => {
    "use strict";

    const body = document.body;
    const root = body.dataset.root || "";
    const pageId = body.dataset.page || "";
    const sidebarContainer = document.getElementById("sidebar-container");
    let lastFocusedElement = null;

    function setTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("oct-theme", theme);
        const label = document.querySelector(".theme-toggle__label");
        const icon = document.querySelector(".theme-toggle__icon");
        if (label) label.textContent = theme === "dark" ? "Usar tema claro" : "Usar tema oscuro";
        if (icon) icon.textContent = theme === "dark" ? "☀" : "◐";
    }

    function initTheme() {
        const saved = localStorage.getItem("oct-theme");
        const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(saved || preferred);
    }

    function hydrateSidebar(container) {
        container.querySelectorAll("[data-link]").forEach((element) => {
            element.setAttribute("href", `${root}${element.dataset.link}`);
        });
        container.querySelectorAll("[data-src]").forEach((element) => {
            element.setAttribute("src", `${root}${element.dataset.src}`);
        });

        const activeLink = container.querySelector(`[data-nav="${CSS.escape(pageId)}"]`);
        if (activeLink) activeLink.setAttribute("aria-current", "page");

        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("page-overlay");
        const openButton = document.getElementById("open-btn");
        const closeButton = document.getElementById("close-btn");
        const themeButton = document.getElementById("theme-toggle");

        function openSidebar() {
            if (!sidebar || !overlay) return;
            lastFocusedElement = document.activeElement;
            sidebar.classList.add("is-open");
            overlay.hidden = false;
            body.style.overflow = "hidden";
            closeButton?.focus();
        }

        function closeSidebar() {
            if (!sidebar || !overlay) return;
            sidebar.classList.remove("is-open");
            overlay.hidden = true;
            body.style.overflow = "";
            lastFocusedElement?.focus();
        }

        openButton?.addEventListener("click", openSidebar);
        closeButton?.addEventListener("click", closeSidebar);
        overlay?.addEventListener("click", closeSidebar);
        themeButton?.addEventListener("click", () => {
            const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            setTheme(next);
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && sidebar?.classList.contains("is-open")) closeSidebar();
        });
        sidebar?.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 980) closeSidebar();
            });
        });

        setTheme(document.documentElement.dataset.theme || "light");
    }

    function fallbackSidebar() {
        return `
            <nav id="sidebar" class="sidebar" aria-label="Navegación principal">
                <div class="sidebar__header">
                    <a class="brand" data-link="index.html"><img data-src="img/favicon.svg" alt="" width="42" height="42"><span><strong>Portafolio OCT</strong><small>Office y CAT Tools</small></span></a>
                    <button id="close-btn" class="icon-btn sidebar__close" type="button" aria-label="Cerrar menú"><span aria-hidden="true">×</span></button>
                </div>
                <ul class="nav-list">
                    <li><a data-link="index.html" data-nav="inicio">⌂ Inicio</a></li>
                    <li><a data-link="entradas/office/office.html" data-nav="office">▦ Microsoft Office</a></li>
                    <li><a data-link="entradas/cat-tools/cat-tools.html" data-nav="cat-tools">文 CAT Tools</a></li>
                    <li><a data-link="entradas/productividad/productividad.html" data-nav="productividad">✓ Productividad</a></li>
                    <li><a data-link="entradas/plantilla/entrada_plantilla.html" data-nav="plantilla">＋ Plantilla de entrada</a></li>
                    <li><a data-link="404.html" data-nav="404"><span aria-hidden="true">?</span> 404</a></li>
                    </ul>
                <div class="sidebar__footer"><button id="theme-toggle" class="theme-toggle" type="button"><span class="theme-toggle__icon">◐</span><span class="theme-toggle__label">Cambiar apariencia</span></button></div>
            </nav><div id="page-overlay" class="page-overlay" hidden></div>`;
    }

    async function loadSidebar() {
        if (!sidebarContainer) return;
        try {
            const response = await fetch(`${root}sidebar.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            sidebarContainer.innerHTML = await response.text();
        } catch (error) {
            sidebarContainer.innerHTML = fallbackSidebar();
            console.warn("Se usó el menú de respaldo. Para cargar sidebar.html, abre el sitio mediante un servidor local.", error);
        }
        hydrateSidebar(sidebarContainer);
    }

    function initFilters() {
        const input = document.querySelector("[data-entry-filter]");
        if (!input) return;
        const cards = [...document.querySelectorAll("[data-entry-card]")];
        const empty = document.querySelector("[data-filter-empty]");
        input.addEventListener("input", () => {
            const query = input.value.trim().toLocaleLowerCase("es");
            let visible = 0;
            cards.forEach((card) => {
                const matches = card.textContent.toLocaleLowerCase("es").includes(query);
                card.hidden = !matches;
                if (matches) visible += 1;
            });
            if (empty) empty.style.display = visible ? "none" : "block";
        });
    }

    function initReadingProgress() {
        const bar = document.querySelector(".reading-progress span");
        if (!bar) return;
        const update = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
    }

    function fillDynamicText() {
        document.querySelectorAll("[data-current-year]").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });
    }

    initTheme();
    document.addEventListener("DOMContentLoaded", () => {
        loadSidebar();
        initFilters();
        initReadingProgress();
        fillDynamicText();
    });
})();
