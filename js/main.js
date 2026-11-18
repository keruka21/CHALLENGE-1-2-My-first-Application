/* Flora and Fauna of Bizkaia — shared interactions and accessible controls. */
"use strict";

/* Entry point: initialize only the components present on the current page. */
document.addEventListener("DOMContentLoaded", () => {
    initLanguage();
    initTheme();
    initNavbar();
    initAudio();
    initBackToTop();
    initInteractiveRegionMap();
    initCatalogTables();
    initForms();
    initContact();
    initBlogSlider();
    initHabitatFilter();
    initSpeciesRoute();
    initGallery();
    initVideoEmbeds();
});

/* Theme toggle */
function initTheme() {
    const button = document.getElementById("themeToggle"), icon = document.getElementById("themeIcon");
    if (!button) return;
    const set = theme => {
        document.documentElement.dataset.bsTheme = theme;
        if (icon) icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
        button.setAttribute("aria-label", theme === "dark" ? "Enable light theme" : "Enable dark theme");
        button.setAttribute("aria-pressed", String(theme === "dark"));
    };
    set("light");
    button.addEventListener("click", () => set(document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark"));
}

/* Keep the navbar transparent at the top and apply the primary color on scroll*/
function initNavbar() {
    const nav = document.getElementById("mainNavbar");
    if (!nav) return;
    const update = () => nav.classList.toggle("scrolled", scrollY > 45);
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
}

/* Background audio*/
function initAudio() {
    const audio = document.getElementById("backgroundAudio"),
          button = document.getElementById("audioToggle"),
          icon = document.getElementById("audioIcon");
    if (!audio || !button) return;
    audio.volume = 0.22;
    audio.muted = true;

    button.addEventListener("click", async () => {
        if (audio.paused) {
            audio.muted = false;
            try { await audio.play(); } catch (_) { return; }
            if (icon) icon.className = "bi bi-volume-up-fill";
            button.setAttribute("aria-pressed", "true");
            button.title = "Mute sound";
        } else {
            audio.pause();
            if (icon) icon.className = "bi bi-volume-mute-fill";
            button.setAttribute("aria-pressed", "false");
            button.title = "Enable sound";
        }
    });
}

/* Back-to-top*/
function initBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;
    const update = () => button.classList.toggle("is-visible", window.scrollY > 320);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/** Region map, list and table interactions. */
function initInteractiveRegionMap() {
    const svg = document.querySelector("#regionMapVisual svg");
    const list = document.querySelector(".region-selector");
    const table = document.getElementById("regionSightingsTable");
    const emptyBody = document.getElementById("regionSightingsEmpty");
    const titleEl = document.getElementById("selectedRegionTitle");
    const descEl = document.getElementById("selectedRegionDescription");
    const resetButton = document.getElementById("regionReset");

    if (!svg || !list || !table) return;

    const regionMap = {
        arratianervion:  { svgId: "arratia-nervion",  name: "Arratia-Nervión",       nameEu: "Arratia-Nerbioi" },
        busturiaurdaibai:{ svgId: "busturioaldea",    name: "Busturialdea-Urdaibai", nameEu: "Busturialdea" },
        duranguesado:    { svgId: "durangaldea",      name: "Duranguesado",          nameEu: "Durangaldea" },
        encartaciones:   { svgId: "encartaciones",    name: "Encartaciones",         nameEu: "Enkarterri" },
        granbilbao:      { svgId: "gran-bilbao",      name: "Gran Bilbao",           nameEu: "Bilbo Handia" },
        leaartibay:      { svgId: "lea-artibai",      name: "Lea-Artibai",           nameEu: "Lea-Artibai" },
        uribe:           { svgId: "uribe-kosta",      name: "Uribe",                 nameEu: "Uribealdea" }
    };

    const buttons = [...list.querySelectorAll(".region-select-btn")];
    const bodies = [...table.querySelectorAll("tbody[data-region]")];

    function showRegion(key) {
        const info = regionMap[key];
        if (!info) return;
        selectedRegionKey = key;
        const isEu = document.documentElement.lang === "eu";

        bodies.forEach(tb => tb.classList.toggle("d-none", tb.dataset.region !== key));
        emptyBody.classList.add("d-none");

        titleEl.textContent = `${info.name} · ${info.nameEu}`;
        descEl.textContent = isEu
            ? `${info.nameEu} eskualdeko espezieen behaketak azpian.`
            : `Species sightings recorded in the ${info.name} region.`;

        buttons.forEach(b => b.classList.toggle("is-selected", b.dataset.region === key));
        Object.values(regionMap).forEach(r => {
            svg.querySelector(`#${CSS.escape(r.svgId)}`)?.classList.toggle("is-selected", r.svgId === info.svgId);
        });
    }

    function deselect() {
        selectedRegionKey = "";
        bodies.forEach(tb => tb.classList.add("d-none"));
        emptyBody.classList.remove("d-none");
        const isEu = document.documentElement.lang === "eu";
        titleEl.textContent = isEu ? "Hautatu eskualde bat" : "Select a region";
        descEl.textContent = isEu
            ? "Klikatu eskualde batean bere datuak ikusteko."
            : "Click on a region to explore its data and sightings.";
        buttons.forEach(b => b.classList.remove("is-selected"));
        Object.values(regionMap).forEach(r => {
            svg.querySelector(`#${CSS.escape(r.svgId)}`)?.classList.remove("is-selected");
        });
    }

    function hover(key, on) {
        buttons.find(b => b.dataset.region === key)?.classList.toggle("is-hovered", on);
        const info = regionMap[key];
        if (info) svg.querySelector(`#${CSS.escape(info.svgId)}`)?.classList.toggle("is-hovered", on);
    }

    let selectedRegionKey = "";

    buttons.forEach(btn => {
        const key = btn.dataset.region;
        btn.addEventListener("mouseenter", () => hover(key, true));
        btn.addEventListener("mouseleave", () => hover(key, false));
        btn.addEventListener("focus", () => hover(key, true));
        btn.addEventListener("blur", () => hover(key, false));
        btn.addEventListener("click", e => { e.stopPropagation(); showRegion(key); });
    });

    Object.entries(regionMap).forEach(([key, info]) => {
        const path = svg.querySelector(`#${CSS.escape(info.svgId)}`);
        if (!path) return;
        path.setAttribute("tabindex", "0");
        path.setAttribute("role", "button");
        path.setAttribute("aria-label", `Select ${info.name} region`);
        path.addEventListener("mouseenter", () => hover(key, true));
        path.addEventListener("mouseleave", () => hover(key, false));
        path.addEventListener("focus", () => hover(key, true));
        path.addEventListener("blur", () => hover(key, false));
        path.addEventListener("click", e => { e.stopPropagation(); showRegion(key); });
        path.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); showRegion(key); }
        });
    });

    resetButton?.addEventListener("click", deselect);

    document.addEventListener("site:languagechange", event => {
        if (selectedRegionKey) showRegion(selectedRegionKey);
        else deselect();
    });
}

/* Shared catalogue filters, sorting and pagination. */
function initCatalogTables() {
    const filterForm = document.getElementById("catalogFilter");
    const searchInput = document.getElementById("speciesSearch");
    const groupSelect = document.getElementById("catalogGroup");
    const habitatSelect = document.getElementById("catalogHabitat");
    const resetButton = document.getElementById("catalogReset");
    const faunaTab = document.getElementById("fauna-tab");
    const floraTab = document.getElementById("flora-tab");

    const tableConfig = {
        fauna: {
            table: document.getElementById("faunaTable"),
            count: document.getElementById("faunaTableCount"),
            pagination: document.getElementById("faunaPagination"),
            rows: [],
            page: 1,
            sortKey: "common",
            sortDirection: 1
        },
        flora: {
            table: document.getElementById("floraTable"),
            count: document.getElementById("floraTableCount"),
            pagination: document.getElementById("floraPagination"),
            rows: [],
            page: 1,
            sortKey: "common",
            sortDirection: 1
        }
    };

    if (!filterForm || !searchInput || !groupSelect || !habitatSelect ||
        !tableConfig.fauna.table || !tableConfig.flora.table) {
        return;
    }

    const pageSize = 20;
    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

    Object.values(tableConfig).forEach(config => {
        config.rows = Array.from(config.table.querySelectorAll("tbody tr[data-species-id]"));
    });

    let activeType = "fauna";

    function currentLanguage() {
        return document.documentElement.lang === "eu" ? "eu" : "en";
    }

    function updateGroupOptions() {
        const options = Array.from(groupSelect.options);
        options.forEach(option => {
            const optionType = option.dataset.speciesType;
            option.hidden = Boolean(optionType && optionType !== activeType);
            option.disabled = Boolean(optionType && optionType !== activeType);
        });
        if (groupSelect.selectedOptions[0]?.disabled) {
            groupSelect.value = "";
        }
    }

    function getSortValue(row, key) {
        const cellIndexes = { id: 0, common: 2, scientific: 3, group: 4, habitat: 5 };
        const cell = row.cells[cellIndexes[key]];
        if (!cell) return "";
        if (key === "common") {
            return cell.querySelector(".species-common-name")?.textContent.trim() || cell.textContent.trim();
        }
        return cell.dataset.sortValue || cell.textContent.trim();
    }

    function updateSortIndicators(config) {
        config.table.querySelectorAll("thead th").forEach(header => header.removeAttribute("aria-sort"));
        config.table.querySelectorAll(".catalog-sort-button").forEach(button => {
            const icon = button.querySelector("i");
            const isActive = button.dataset.sortKey === config.sortKey;
            const header = button.closest("th");
            button.setAttribute("aria-pressed", String(isActive));
            if (isActive && header) {
                header.setAttribute("aria-sort", config.sortDirection === 1 ? "ascending" : "descending");
            }
            if (icon) {
                icon.className = isActive
                    ? (config.sortDirection === 1 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up")
                    : "bi bi-arrow-down-up";
            }
        });
    }

    function updateCount(config, visibleCount, startIndex, endIndex, totalPages) {
        if (!config.count) return;
        const language = currentLanguage();
        if (visibleCount === 0) {
            config.count.textContent = language === "eu"
                ? "Ez da espeziekin bat datorren emaitzarik aurkitu."
                : "No species match the selected filters.";
            return;
        }
        config.count.textContent = language === "eu"
            ? `${visibleCount} espezie · ${startIndex}–${endIndex} erakusten · ${config.page}. orrialdea ${totalPages}tik`
            : `${visibleCount} species · showing ${startIndex}–${endIndex} · page ${config.page} of ${totalPages}`;
    }

    function createPageButton(label, page, options = {}) {
        const item = document.createElement("li");
        item.className = `page-item${options.active ? " active" : ""}${options.disabled ? " disabled" : ""}`;
        const button = document.createElement("button");
        button.className = "page-link";
        button.type = "button";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        if (options.active) button.setAttribute("aria-current", "page");
        if (options.label) button.setAttribute("aria-label", options.label);
        button.addEventListener("click", () => {
            tableConfig[activeType].page = page;
            renderActiveTable();
        });
        item.append(button);
        return item;
    }

    function renderPagination(config, totalPages) {
        if (!config.pagination) return;
        config.pagination.replaceChildren();
        const language = currentLanguage();
        const previousLabel = language === "eu" ? "Aurrekoa" : "Previous";
        const nextLabel = language === "eu" ? "Hurrengoa" : "Next";

        config.pagination.append(
            createPageButton("‹", Math.max(1, config.page - 1), { disabled: config.page === 1, label: previousLabel })
        );

        const maxVisiblePages = 5;
        let firstPage = Math.max(1, config.page - 2);
        let lastPage = Math.min(totalPages, firstPage + maxVisiblePages - 1);
        firstPage = Math.max(1, lastPage - maxVisiblePages + 1);

        for (let page = firstPage; page <= lastPage; page += 1) {
            config.pagination.append(createPageButton(String(page), page, { active: page === config.page }));
        }

        config.pagination.append(
            createPageButton("›", Math.min(totalPages, config.page + 1), { disabled: config.page === totalPages, label: nextLabel })
        );
    }

    function renderActiveTable() {
        const config = tableConfig[activeType];
        const query = searchInput.value.trim().toLocaleLowerCase();
        const selectedGroup = groupSelect.value;
        const selectedHabitat = habitatSelect.value;

        const filteredRows = config.rows.filter(row => {
            const matchesSearch = !query || (row.dataset.search || "").toLocaleLowerCase().includes(query);
            const matchesGroup = !selectedGroup || row.dataset.group === selectedGroup;
            const matchesHabitat = !selectedHabitat || row.dataset.habitat === selectedHabitat;
            return matchesSearch && matchesGroup && matchesHabitat;
        });

        filteredRows.sort((first, second) => {
            const firstValue = getSortValue(first, config.sortKey);
            const secondValue = getSortValue(second, config.sortKey);
            return collator.compare(firstValue, secondValue) * config.sortDirection;
        });

        const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
        config.page = Math.min(config.page, totalPages);

        config.rows.forEach(row => { row.hidden = true; });

        const startOffset = (config.page - 1) * pageSize;
        const visibleRows = filteredRows.slice(startOffset, startOffset + pageSize);
        visibleRows.forEach(row => { row.hidden = false; });

        const firstVisible = filteredRows.length ? startOffset + 1 : 0;
        const lastVisible = Math.min(startOffset + pageSize, filteredRows.length);

        updateCount(config, filteredRows.length, firstVisible, lastVisible, totalPages);
        renderPagination(config, totalPages);
        updateSortIndicators(config);
    }

    function resetPageAndRender() {
        tableConfig[activeType].page = 1;
        renderActiveTable();
    }

    filterForm.addEventListener("submit", event => { event.preventDefault(); resetPageAndRender(); });
    searchInput.addEventListener("input", resetPageAndRender);
    groupSelect.addEventListener("change", resetPageAndRender);
    habitatSelect.addEventListener("change", resetPageAndRender);

    resetButton?.addEventListener("click", () => {
        searchInput.value = "";
        groupSelect.value = "";
        habitatSelect.value = "";
        tableConfig[activeType].page = 1;
        renderActiveTable();
    });

    Object.values(tableConfig).forEach(config => {
        config.table.querySelectorAll(".catalog-sort-button").forEach(button => {
            button.addEventListener("click", () => {
                const selectedKey = button.dataset.sortKey;
                if (config.sortKey === selectedKey) {
                    config.sortDirection *= -1;
                } else {
                    config.sortKey = selectedKey;
                    config.sortDirection = 1;
                }
                config.page = 1;
                if (config === tableConfig[activeType]) {
                    renderActiveTable();
                } else {
                    updateSortIndicators(config);
                }
            });
        });
    });

    document.querySelectorAll("#biodiversityTabs [data-bs-toggle='tab']").forEach(tab => {
        tab.addEventListener("shown.bs.tab", event => {
            activeType = event.target.id === "flora-tab" ? "flora" : "fauna";
            updateGroupOptions();
            tableConfig[activeType].page = 1;
            renderActiveTable();
        });
    });

    document.querySelectorAll(".language-button").forEach(button => {
        button.addEventListener("click", () => { window.setTimeout(renderActiveTable, 0); });
    });

    const queryParams = new URLSearchParams(window.location.search);
    const requestedType = queryParams.get("type");
    const requestedHabitat = queryParams.get("habitat");
    if (requestedHabitat) {
        const canonicalHabitat = requestedHabitat
            .toLowerCase()
            .trim()
            .replace(/%20/g, " ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        const matchingOption = Array.from(habitatSelect.options).find(option =>
            option.value.toLowerCase() === canonicalHabitat ||
            option.textContent.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === canonicalHabitat
        );
        if (matchingOption) habitatSelect.value = matchingOption.value;
    }

    if (requestedType?.toLowerCase() === "flora" && window.bootstrap?.Tab && floraTab) {
        bootstrap.Tab.getOrCreateInstance(floraTab).show();
    } else if (faunaTab && window.bootstrap?.Tab) {
        bootstrap.Tab.getOrCreateInstance(faunaTab).show();
    }

    updateGroupOptions();
    renderActiveTable();
}

function initForms() {
    const frontEndOnlyForms = new Set(["signupForm", "sightingForm", "accountRegisterForm", "speciesForm", "profileForm", "privacySettingsForm"]);
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add("was-validated");
                return;
            }
            if (frontEndOnlyForms.has(form.id)) {
                event.preventDefault();
                let feedback = form.querySelector("[data-form-feedback]");
                if (!feedback) {
                    feedback = document.createElement("div");
                    feedback.dataset.formFeedback = "true";
                    feedback.className = "alert alert-info mt-3 mb-0";
                    feedback.setAttribute("role", "status");
                    form.append(feedback);
                }
                const isBasque = document.documentElement.lang === "eu";
                feedback.textContent = isBasque
                    ? "Prototipo honetako formularioa ez dago zerbitzari batera konektatuta; datuak ez dira gorde."
                    : "This prototype form is not connected to a server yet; your information has not been saved.";
            }
        });
    });
}

function initContact() {
    document.getElementById("contactForm")?.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("contactName").value.trim(),
              email = document.getElementById("contactEmail").value.trim(),
              message = document.getElementById("contactMessage").value.trim();
        const subject = "Website contact — Flora & Fauna of Bizkaia";
        const body = `Name: ${name}\nSender email: ${email}\n\nMessage:\n${message}`;
        location.href = `mailto:faunayflora@bizkaia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}


/*Apply the selected language to all translatable interface elements. */
function initLanguage() {
    const languageButtons = document.querySelectorAll(".language-button");
    if (!languageButtons.length) return;

    function setLanguage(lang) {
        languageButtons.forEach(btn => {
            const btnLang = btn.getAttribute("data-language");
            if (btnLang === lang) {
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");
            } else {
                btn.classList.remove("active");
                btn.setAttribute("aria-pressed", "false");
            }
        });

        const translatableElements = document.querySelectorAll("[data-en]:not(.gallery-item), [data-eu]:not(.gallery-item)");
        translatableElements.forEach(el => {
            const targetLang = (lang === "eu") ? "eu" : "en";
            const translation = el.getAttribute(`data-${targetLang}`);
            if (translation === null) return;
            if (el.dataset.translateMode === "html") el.innerHTML = translation;
            else el.textContent = translation;
        });

        document.querySelectorAll("[data-en-alt], [data-eu-alt]").forEach(el => {
            const value = el.getAttribute(`data-${lang}-alt`);
            if (value !== null) el.setAttribute("alt", value);
        });

        document.querySelectorAll("[data-en-placeholder], [data-eu-placeholder]").forEach(el => {
            const value = el.getAttribute(`data-${lang}-placeholder`);
            if (value !== null) el.setAttribute("placeholder", value);
        });

        document.querySelectorAll("[data-en-aria-label], [data-eu-aria-label]").forEach(el => {
            const value = el.getAttribute(`data-${lang}-aria-label`);
            if (value !== null) el.setAttribute("aria-label", value);
        });

        document.querySelectorAll("[data-en-title], [data-eu-title]").forEach(el => {
            const value = el.getAttribute(`data-${lang}-title`);
            if (value !== null) el.setAttribute("title", value);
        });

        document.querySelectorAll("[data-en-content], [data-eu-content]").forEach(el => {
            const value = el.getAttribute(`data-${lang}-content`);
            if (value !== null) el.setAttribute("content", value);
        });

        document.documentElement.lang = (lang === "eu") ? "eu" : "en";
        document.dispatchEvent(new CustomEvent("site:languagechange", { detail: { language: lang } }));
    }

    languageButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            setLanguage(btn.getAttribute("data-language"));
        });
    });

    setLanguage("en");
}

/*Blog slider navigation arrows*/
function initBlogSlider() {
    const track = document.getElementById("blogTrack");
    if (!track) return;
    const prevBtn = document.getElementById("blogPrev");
    const nextBtn = document.getElementById("blogNext");
    if (prevBtn) prevBtn.addEventListener("click", () => track.scrollBy({ left: -340, behavior: "smooth" }));
    if (nextBtn) nextBtn.addEventListener("click", () => track.scrollBy({ left: 340, behavior: "smooth" }));
}

/* Habitat card filtering. */
function initHabitatFilter() {
    const t = document.getElementById("habitatTypeFilter"), r = document.getElementById("habitatRegionFilter");
    if (!t || !r) return;
    const cards = [...document.querySelectorAll(".habitat-item")];
    function run() {
        cards.forEach(c => {
            const ok = (!t.value || c.dataset.habitatType === t.value) && (!r.value || c.dataset.regions.includes(r.value.toLowerCase()));
            c.classList.toggle("d-none", !ok);
        });
    }
    t.addEventListener("change", run);
    r.addEventListener("change", run);
}

/*Route the species detail page to the selected featured profile.*/
function initSpeciesRoute() {
    const params = new URLSearchParams(window.location.search);
    const speciesId = (params.get("id") || "").toUpperCase();

    const templateView = document.getElementById("speciesTemplateView");
    const robinView = document.getElementById("robinDetailView");
    const oakView = document.getElementById("oakDetailView");
    const heroKicker = document.getElementById("heroKicker");
    const heroTitle = document.getElementById("heroTitle");
    const heroSubtitle = document.getElementById("heroSubtitle");
    const breadcrumbSpecies = document.getElementById("breadcrumbSpecies");

    if (!templateView || !robinView || !oakView) return;

    const setTranslatedText = (element, english, basque) => {
        if (!element) return;
        element.dataset.en = english;
        element.dataset.eu = basque;
        element.textContent = document.documentElement.lang === "eu" ? basque : english;
    };

    let targetProfile = null;

    if (speciesId === "FAU-028" || speciesId === "ROBIN") {
        templateView.classList.add("d-none");
        oakView.classList.add("d-none");
        robinView.classList.remove("d-none");
        targetProfile = "robin";

        setTranslatedText(heroKicker, "FAU-028 · Fauna · Bird · Muscicapidae", "FAU-028 · Fauna · Hegaztia · Muscicapidae");
        setTranslatedText(heroTitle, "European robin", "Txantxangorria");
        setTranslatedText(
            heroSubtitle,
            "Erithacus rubecula — A familiar songbird of woodland edges, gardens and hedgerows.",
            "Erithacus rubecula — Baso-ertzetan, lorategietan eta heskaietan ohikoa den txori kantaria."
        );
        setTranslatedText(breadcrumbSpecies, "European robin", "Txantxangorria");
        setTranslatedText(
            document.querySelector("head title"),
            "European robin | Flora & Fauna of Biscay",
            "Txantxangorria | Bizkaiko Flora eta Fauna"
        );
    } else if (speciesId === "FLO-052" || speciesId === "OAK") {
        templateView.classList.add("d-none");
        robinView.classList.add("d-none");
        oakView.classList.remove("d-none");
        targetProfile = "oak";

        setTranslatedText(heroKicker, "FLO-052 · Flora · Trees and shrubs · Fagaceae", "FLO-052 · Flora · Zuhaitzak eta zuhaixkak · Fagaceae");
        setTranslatedText(heroTitle, "Pedunculate oak", "Haritz kanduduna");
        setTranslatedText(
            heroSubtitle,
            "Quercus robur — A characteristic native oak of Atlantic woodlands and a major ecological keystone.",
            "Quercus robur — Atlantikoko basoetako bertako haritz bereizgarria eta ekosistemen funtsezko espeziea."
        );
        setTranslatedText(breadcrumbSpecies, "Pedunculate oak", "Haritz kanduduna");
        setTranslatedText(
            document.querySelector("head title"),
            "Pedunculate oak | Flora & Fauna of Biscay",
            "Haritz kanduduna | Bizkaiko Flora eta Fauna"
        );
    }

    if (targetProfile && window.location.hash) {
        window.requestAnimationFrame(() => {
            const target = document.getElementById(window.location.hash.slice(1));
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}


/* Gallery filtering, photo viewer and species-profile navigation. */
function initGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const items = [...grid.querySelectorAll(".gallery-item")];
    const search = document.getElementById("gallerySearch");
    const group = document.getElementById("galleryGroup");
    const habitat = document.getElementById("galleryHabitat");
    const region = document.getElementById("galleryRegion");
    const count = document.getElementById("galleryCount");
    const empty = document.getElementById("galleryEmpty");

    // Gallery modal elements
    const modalImage = document.getElementById("galleryModalImage");
    const modalCode = document.getElementById("galleryModalCode");
    const modalDate = document.getElementById("galleryModalDate");
    const modalUploader = document.getElementById("galleryModalUploader");
    const speciesLink = document.getElementById("gallerySpeciesLink");
    const prevBtn = document.getElementById("galleryPrevBtn");
    const nextBtn = document.getElementById("galleryNextBtn");

    let currentIndex = 0;
    let visibleItems = [];

    function filter() {
        const q = (search?.value || "").trim().toLowerCase();
        const selectedGroup = group?.value || "";
        const h = (habitat?.value || "").toLowerCase();
        const r = (region?.value || "").toLowerCase();

        let n = 0;
        visibleItems = [];

        items.forEach(el => {
            const d = el.dataset;
            const matchesQuery = !q
                || (d.species && d.species.toLowerCase().includes(q))
                || (d.common && d.common.toLowerCase().includes(q))
                || (d.scientific && d.scientific.toLowerCase().includes(q))
                || (d.eu && d.eu.toLowerCase().includes(q));

            let matchesGroup = true;
            if (selectedGroup) {
                if (selectedGroup === "fauna" || selectedGroup === "flora") {
                    matchesGroup = (d.group === selectedGroup);
                } else {
                    matchesGroup = (d.type === selectedGroup);
                }
            }

            const matchesHabitat = !h || (d.habitat && d.habitat.toLowerCase().includes(h));
            const matchesRegion = !r || (d.region && d.region.toLowerCase().includes(r));

            const ok = matchesQuery && matchesGroup && matchesHabitat && matchesRegion;
            el.hidden = !ok;

            if (ok) {
                n++;
                visibleItems.push(el);
            }
        });

        count.textContent = n;
        empty.classList.toggle("d-none", n > 0);
    }

    [search, group, habitat, region].filter(Boolean).forEach(element => {
        element.addEventListener(element === search ? "input" : "change", filter);
    });

    function updateModal(index) {
        if (visibleItems.length === 0) return;
        currentIndex = (index + visibleItems.length) % visibleItems.length;
        const el = visibleItems[currentIndex];
        const d = el.dataset;

        if (modalImage) {
            modalImage.src = d.src;
            modalImage.alt = d.scientific || d.common || "Species photograph";
        }
        if (modalDate) modalDate.textContent = d.date || "Date not available";
        if (modalCode) modalCode.textContent = d.code || "N/A";
        if (modalUploader) modalUploader.textContent = d.uploader || "Anonymous";

        if (!speciesLink) return;
        if (d.code === "FAU-028") {
            speciesLink.href = "species-detail.html?id=FAU-028";
        } else if (d.code === "FLO-052") {
            speciesLink.href = "species-detail.html?id=FLO-052";
        } else {
            speciesLink.href = "species-detail.html";
        }
    }

    items.forEach(el => {
        el.addEventListener("click", () => {
            visibleItems = items.filter(i => !i.hidden);
            const index = visibleItems.indexOf(el);
            if (index !== -1) {
                updateModal(index);
                if (window.bootstrap) {
                    bootstrap.Modal.getOrCreateInstance(document.getElementById("galleryModal")).show();
                }
            }
        });
    });

    if (prevBtn) prevBtn.addEventListener("click", () => updateModal(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => updateModal(currentIndex + 1));

    document.addEventListener("keydown", (e) => {
        const modalEl = document.getElementById("galleryModal");
        if (modalEl && modalEl.classList.contains("show")) {
            if (e.key === "ArrowLeft") updateModal(currentIndex - 1);
            if (e.key === "ArrowRight") updateModal(currentIndex + 1);
        }
    });

    filter();
}


/* Load external video and webcam embeds only after the visitor requests them. */
function initVideoEmbeds() {
    const placeholders = document.querySelectorAll(".video-embed-placeholder");
    placeholders.forEach(button => {
        button.addEventListener("click", () => {
            const wrapper = button.parentElement;
            const frame = wrapper ? wrapper.querySelector("iframe[data-src]") : null;
            if (!frame) return;
            frame.src = frame.dataset.src;
            frame.setAttribute("tabindex", "0");
            button.remove();
        }, { once: true });
    });
}
