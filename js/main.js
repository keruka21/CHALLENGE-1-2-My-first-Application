/** Flora y Fauna de Bizkaia — interactions and accessible controls. */
"use strict";
/** Entry point: initialize only the components present on the current page. */
document.addEventListener("DOMContentLoaded",()=>{initLanguage();initTheme();initNavbar();initAudio();initBackToTop();initHero();initMap();initInteractiveRegionMap();initRegionSpeciesTable();initCatalog();initFaunaTable();initFloraTable();initBlogSlider();initPartners();initForms();initSession();initContact();initArticle();initMonthlySpecies();initSpeciesDetail();initAuthModal();initUserArea();document.querySelectorAll("#currentYear").forEach(el=>el.textContent=new Date().getFullYear());});
/** Persist Bootstrap 5.3 light/dark mode using the root data-bs-theme attribute. */
function initTheme(){const button=document.getElementById("themeToggle"),icon=document.getElementById("themeIcon");if(!button)return;const set=theme=>{document.documentElement.dataset.bsTheme=theme;localStorage.setItem("bizkaia-theme",theme);if(icon)icon.className=theme==="dark"?"bi bi-sun-fill":"bi bi-moon-stars-fill";button.setAttribute("aria-label",theme==="dark"?"Activar tema claro":"Activar tema oscuro");button.setAttribute("aria-pressed",String(theme==="dark"));};set(localStorage.getItem("bizkaia-theme")==="dark"?"dark":"light");button.addEventListener("click",()=>set(document.documentElement.dataset.bsTheme==="dark"?"light":"dark"));}
/** Keep the navbar transparent at the top and switch to the primary color on scroll. */
function initNavbar(){const nav=document.getElementById("mainNavbar");if(!nav)return;const update=()=>nav.classList.toggle("scrolled",scrollY>45);update();addEventListener("scroll",update,{passive:true});addEventListener("resize",update);}
/** Play the supplied European Robin audio in a loop and expose a mute toggle. */
function initAudio(){
 const audio=document.getElementById("backgroundAudio"),button=document.getElementById("audioToggle"),icon=document.getElementById("audioIcon");
 if(!audio||!button)return;
 audio.volume=.22;
 const state=playing=>{if(icon)icon.className=playing?"bi bi-volume-up-fill":"bi bi-volume-mute-fill";button.title=playing?"Silenciar sonido":"Activar sonido";button.setAttribute("aria-label",button.title);button.setAttribute("aria-pressed",String(playing));};
 let userMuted=false;
 const startAudio=async()=>{if(userMuted)return false;try{audio.muted=false;await audio.play();state(true);return true;}catch(error){state(false);return false;}};
 state(false);
 // Audible autoplay is blocked by many browsers until the first user gesture.
 const unlock=()=>{startAudio().then(ok=>{if(ok)["pointerdown","keydown","touchstart"].forEach(type=>document.removeEventListener(type,unlock,true));});};
 ["pointerdown","keydown","touchstart"].forEach(type=>document.addEventListener(type,unlock,{capture:true,passive:true}));
 audio.addEventListener("playing",()=>state(!audio.muted));audio.addEventListener("pause",()=>state(false));
 button.addEventListener("click",async()=>{if(!audio.paused&&!audio.muted){userMuted=true;audio.muted=true;state(false);}else{userMuted=false;await startAudio();}});
 startAudio();
}
/** Reveal the chevron after the hero and scroll back to the fixed navbar. */
function initBackToTop(){const button=document.getElementById("backToTop");if(!button)return;const update=()=>button.classList.toggle("is-visible",window.scrollY>320);addEventListener("scroll",update,{passive:true});addEventListener("resize",update);update();button.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));}
/** Start the Bootstrap carousel with a fade transition and automatic timing. */
function initHero(){const el=document.getElementById("heroCarousel");if(el&&window.bootstrap)bootstrap.Carousel.getOrCreateInstance(el,{interval:6200,ride:"carousel",pause:false}).cycle();}
/** Static comarca labels and target sections for the interactive map. */
const regions={"gran-bilbao":{name:"Gran Bilbao",target:"region-gran-bilbao"},"encartaciones":{name:"Encartaciones",target:"region-encartaciones"},"durangaldea":{name:"Duranguesado",target:"region-durangaldea"},"arratia-nervion":{name:"Arratia-Nervión",target:"region-arratia-nerbioi"},"lea-artibai":{name:"Lea-Artibai",target:"region-lea-artibai"},"busturioaldea":{name:"Busturialdea-Urdaibai",target:"region-busturialdea"},"uribe-kosta":{name:"Uribe (Plentzia-Mungia)",target:"region-uribe"}};
/** Connect the comarca list and SVG map using local, static catalogue data only. */
function initMap() {
    const svg = document.querySelector("#regionMapVisual svg, #mapSvgWrap svg");
    const list = document.getElementById("regionList");
    if (!svg || !list) return;
    const buttons = [...list.querySelectorAll("[data-region]")];
    function selectRegion(id) {
        const data = regions[id];
        if (!data) return;
        buttons.forEach(button => button.classList.toggle("is-active", button.dataset.region === id));
        Object.keys(regions).forEach(key => svg.querySelector(`#${CSS.escape(key)}`)?.classList.toggle("is-active", key === id));
        const selected = document.getElementById("regionSelected");
        const title = document.getElementById("regionTableTitle");
        const description = selected?.querySelector("p.region-description");
        if (title) title.textContent = data.name;
        if (description) {
            description.dataset.es = `Consulta las especies del catálogo asociadas a los hábitats descritos para ${data.name}.`;
            description.dataset.eus = `Kontsultatu ${data.name} eskualdeko fitxa, habitatak eta naturaguneak.`;
            description.textContent = localStorage.getItem("bizkaia-language") === "eus" ? description.dataset.eus : description.dataset.es;
        }
        const detailLink = document.getElementById("regionDetailsLink");
        if (detailLink) detailLink.href = `regions.html#${data.target}`;
        const catalogLink = document.getElementById("regionCatalogLink");
        if (catalogLink) catalogLink.href = `catalog.html?region=${id}`;
        const resultsBody = document.getElementById("homeRegionSpeciesBody");
        const resultRows = resultsBody ? [...resultsBody.querySelectorAll("tr[data-region]")] : [];
        let visibleCount = 0;
        resultRows.forEach(row => {
            const visible = row.dataset.region.split(/\s+/).includes(id);
            row.hidden = !visible;
            if (visible) visibleCount++;
        });
        const count = document.getElementById("homeRegionSpeciesCount");
        if (count) count.textContent = localStorage.getItem("bizkaia-language") === "eus"
            ? `${visibleCount} espezie, ${data.name} eskualdeko habitat deskribatuekin lotuta.`
            : `${visibleCount} especies del catálogo asociadas a los hábitats descritos para ${data.name}.`;
        window.applySiteLanguage?.(localStorage.getItem("bizkaia-language") || "es");
    }
    function hoverRegion(id, active) {
        list.querySelector(`[data-region="${CSS.escape(id)}"]`)?.classList.toggle("is-active", active);
        svg.querySelector(`#${CSS.escape(id)}`)?.classList.toggle("is-active", active);
    }
    buttons.forEach(button => {
        const id = button.dataset.region;
        const shape = svg.querySelector(`#${CSS.escape(id)}`);
        ["mouseenter", "focus"].forEach(eventName => button.addEventListener(eventName, () => hoverRegion(id, true)));
        ["mouseleave", "blur"].forEach(eventName => button.addEventListener(eventName, () => hoverRegion(id, false)));
        button.addEventListener("click", () => selectRegion(id));
        if (!shape) return;
        shape.setAttribute("tabindex", "0"); shape.setAttribute("role", "button");
        shape.setAttribute("aria-label", `Seleccionar comarca ${dataRegionName(id)}`);
        shape.addEventListener("click", () => selectRegion(id));
        shape.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectRegion(id); } });
        shape.addEventListener("mouseenter", () => hoverRegion(id, true));
        shape.addEventListener("mouseleave", () => hoverRegion(id, false));
    });
}

function dataRegionName(id) { return regions[id]?.name || id; }

/** Link the comarca list and SVG map with keyboard-accessible hover states. */
function initInteractiveRegionMap() {
    const section = document.getElementById("regionMapSection");
    if (!section) return;
    const svg = section.querySelector("#bizkaia-comarcas");
    const items = [...section.querySelectorAll("[data-map-region]")];
    if (!svg) return;
    items.forEach(item => {
        const id = item.dataset.mapRegion;
        const shape = svg.querySelector(`#${CSS.escape(id)}`);
        if (!shape) return;
        const setActive = active => {
            item.classList.toggle("is-active", active);
            shape.classList.toggle("is-active", active);
        };
        item.addEventListener("mouseenter", () => setActive(true));
        item.addEventListener("mouseleave", () => setActive(false));
        item.addEventListener("focusin", () => setActive(true));
        item.addEventListener("focusout", () => setActive(false));
        shape.setAttribute("tabindex", "0");
        shape.setAttribute("role", "link");
        shape.setAttribute("aria-label", `Ver ${item.textContent.trim()}`);
        shape.addEventListener("mouseenter", () => setActive(true));
        shape.addEventListener("mouseleave", () => setActive(false));
        shape.addEventListener("focus", () => setActive(true));
        shape.addEventListener("blur", () => setActive(false));
        const navigate = () => item.querySelector("a")?.click();
        shape.addEventListener("click", navigate);
        shape.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate();
            }
        });
    });
}

/** Filter the comarca table with Bootstrap tabs and paginate its visible rows. */
function initRegionSpeciesTable() {
    const body = document.getElementById("regionSpeciesBody");
    const tabs = document.getElementById("regionSpeciesTabs");
    const pagination = document.getElementById("regionSpeciesPagination");
    if (!body || !tabs || !pagination) return;

    let selectedType = "Todas";
    let currentPage = 1;
    const pageSize = 5;

    function render() {
        const rows = [...body.querySelectorAll("tr[data-species-type]")];
        let placeholder = body.querySelector("tr:not([data-species-type])");
        const filtered = rows.filter(row => selectedType === "Todas" || row.dataset.speciesType === selectedType);
        const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
        currentPage = Math.min(currentPage, pageCount);
        rows.forEach(row => { row.hidden = true; });
        filtered.forEach((row, index) => {
            row.hidden = index < (currentPage - 1) * pageSize || index >= currentPage * pageSize;
        });
        if (rows.length > 0 && filtered.length === 0) {
            if (!placeholder) {
                placeholder = document.createElement("tr");
                placeholder.innerHTML = '<td colspan="5" class="text-center text-secondary">No hay especies en esta pestaña para la comarca seleccionada.</td>';
                body.append(placeholder);
            }
            placeholder.innerHTML = '<td colspan="5" class="text-center text-secondary">No hay especies en esta pestaña para la comarca seleccionada.</td>';
            placeholder.hidden = false;
        } else if (placeholder) {
            placeholder.hidden = rows.length > 0;
        }

        pagination.innerHTML = "";
        if (filtered.length <= pageSize) return;
        const addPage = (label, page, disabled = false, active = false, ariaLabel = label) => {
            const item = document.createElement("li");
            item.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
            const button = document.createElement("button");
            button.className = "page-link";
            button.type = "button";
            button.textContent = label;
            button.setAttribute("aria-label", ariaLabel);
            if (active) button.setAttribute("aria-current", "page");
            button.disabled = disabled;
            button.addEventListener("click", () => { currentPage = page; render(); });
            item.append(button);
            pagination.append(item);
        };
        addPage("‹", currentPage - 1, currentPage === 1, false, "Página anterior");
        for (let page = 1; page <= pageCount; page++) addPage(String(page), page, false, page === currentPage, `Página ${page}`);
        addPage("›", currentPage + 1, currentPage === pageCount, false, "Página siguiente");
    }

    tabs.querySelectorAll("[data-species-filter]").forEach(button => {
        button.addEventListener("click", () => {
            selectedType = button.dataset.speciesFilter;
            currentPage = 1;
            tabs.querySelectorAll(".nav-link").forEach(tab => {
                const active = tab === button;
                tab.classList.toggle("active", active);
                tab.setAttribute("aria-selected", String(active));
            });
            render();
        });
    });

    new MutationObserver(render).observe(body, { childList: true });
    render();
}

/** Filter the sample catalogue by text, flora/fauna type and comarca. */
function initCatalog(){const form=document.getElementById("catalogFilter");if(!form)return;const search=document.getElementById("speciesSearch"),type=document.getElementById("speciesType"),region=document.getElementById("regionFilter"),cards=[...document.querySelectorAll(".species-card")],empty=document.getElementById("catalogEmpty"),params=new URLSearchParams(location.search);if(params.has("type"))type.value=params.get("type").toLowerCase()==="flora"?"Flora":"Fauna";if(params.has("region")&&region)region.value=params.get("region");function filter(e){e?.preventDefault();let count=0;cards.forEach(card=>{const ok=(!search.value||card.textContent.toLocaleLowerCase("es").includes(search.value.trim().toLocaleLowerCase("es")))&&(!type.value||card.dataset.type===type.value)&&(!region.value||card.dataset.region===region.value);card.classList.toggle("d-none",!ok);if(ok)count++;});if(empty)empty.hidden=count>0;}form.addEventListener("submit",filter);[search,type,region].forEach(el=>el.addEventListener("input",filter));filter();}
/** Static fauna register: searchable, sortable and paginated without a backend. */
function initFaunaTable() {
    const table = document.getElementById("faunaTable");
    if (!table) return;
    const body = table.querySelector("tbody");
    const search = document.getElementById("speciesSearch");
    const type = document.getElementById("speciesType");
    const group = document.getElementById("faunaGroupFilter");
    const habitat = document.getElementById("habitatFilter");
    const params = new URLSearchParams(location.search);
    const selectedRegion = params.get("region") || "";
    if (habitat && params.has("habitat")) habitat.value = params.get("habitat");
    const pagination = document.getElementById("faunaPagination");
    const count = document.getElementById("faunaTableCount");
    const pageSize = 8;
    let page = 1;
    let sortKey = "common";
    let sortDirection = 1;
    const allRows = [...body.querySelectorAll("tr")];
    const valueFor = (row, key) => {
        if (key === "id") return row.cells[0].textContent.trim();
        if (key === "common") return row.cells[2].textContent.trim();
        if (key === "scientific") return row.cells[3].textContent.trim();
        if (key === "group") return row.cells[4].textContent.trim();
        if (key === "habitat") return row.cells[5].textContent.trim();
        return "";
    };
    function render() {
        const query = (search?.value || "").trim().toLocaleLowerCase("es");
        const selectedType = type?.value || "";
        const selectedGroup = group?.value || "";
        const selectedHabitat = habitat?.value || "";
        const filtered = allRows.filter(row => {
            const textMatch = !query || row.dataset.search.includes(query);
            const groupMatch = !selectedGroup || row.dataset.group === selectedGroup;
            const typeMatch = !selectedType || selectedType === "Fauna";
            const habitatMatch = !selectedHabitat || row.cells[5]?.textContent.trim() === selectedHabitat;
            const regionMatch = !selectedRegion || (row.dataset.region || "").split(/\s+/).includes(selectedRegion);
            return textMatch && groupMatch && typeMatch && habitatMatch && regionMatch;
        });
        filtered.sort((a, b) => valueFor(a, sortKey).localeCompare(valueFor(b, sortKey), "es", {numeric:true}) * sortDirection);
        const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
        page = Math.min(page, pages);
        allRows.forEach(row => { row.hidden = true; });
        filtered.slice((page - 1) * pageSize, page * pageSize).forEach(row => { row.hidden = false; });
        if (count) count.textContent = localStorage.getItem("bizkaia-language") === "eus" ? `${filtered.length} espezie · ${pages} orrialdetik ${page}. orrialdea` : `${filtered.length} especies · página ${page} de ${pages}`;
        pagination.innerHTML = "";
        const addPage = (label, target, disabled, active, aria) => {
            const item = document.createElement("li");
            item.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "page-link";
            button.textContent = label;
            button.disabled = disabled;
            button.setAttribute("aria-label", aria);
            if (active) button.setAttribute("aria-current", "page");
            button.addEventListener("click", () => { page = target; render(); });
            item.append(button);
            pagination.append(item);
        };
        addPage("‹", page - 1, page === 1, false, "Página anterior");
        for (let i = 1; i <= pages; i++) addPage(String(i), i, false, page === i, `Página ${i}`);
        addPage("›", page + 1, page === pages, false, "Página siguiente");
        const empty = table.querySelector("tbody tr.fauna-empty");
        if (empty) empty.remove();
        if (!filtered.length) {
            const row = document.createElement("tr");
            row.className = "fauna-empty";
            row.innerHTML = `<td colspan="7" class="text-center text-secondary py-4">${localStorage.getItem("bizkaia-language") === "eus" ? "Ez da espezierik aurkitu." : "No se han encontrado especies."}</td>`;
            body.append(row);
        }
    }
    search?.addEventListener("input", () => { page = 1; render(); });
    group?.addEventListener("change", () => { page = 1; render(); });
    habitat?.addEventListener("change", () => { page = 1; render(); });
    type?.addEventListener("change", () => {
        if (type.value === "Flora") {
            document.getElementById("flora-tab")?.click();
        } else {
            document.getElementById("fauna-tab")?.click();
        }
        page = 1;
        render();
    });
    table.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
        const key = button.dataset.sort;
        sortDirection = sortKey === key ? -sortDirection : 1;
        sortKey = key;
        page = 1;
        render();
    }));
    render();
}


/** Search the flora register populated from the project's supplied species list. */
function initFloraTable(){
    const table=document.getElementById("floraTable"),search=document.getElementById("floraSearch"),count=document.getElementById("floraTableCount");
    if(!table)return;
    const rows=[...table.querySelectorAll("tbody tr")];
    function render(){const q=(search?.value||"").trim().toLocaleLowerCase("es");let visible=0;rows.forEach(row=>{const show=!q||(row.dataset.search||"").includes(q);row.hidden=!show;if(show)visible++;});if(count)count.textContent=`${visible} de ${rows.length} especies vegetales`;}
    search?.addEventListener("input",render);render();
}

/** Horizontal blog rail: native scrolling plus accessible previous/next controls. */
function initBlogSlider(){const track=document.getElementById("blogTrack");if(!track)return;document.getElementById("blogPrev")?.addEventListener("click",()=>track.scrollBy({left:-340,behavior:"smooth"}));document.getElementById("blogNext")?.addEventListener("click",()=>track.scrollBy({left:340,behavior:"smooth"}));dragScroll(track);}
/** Duplicate partner logos for a seamless CSS loop and pause on hover. */
function initPartners(){const track=document.getElementById("partnerTrack"),slider=document.getElementById("partnerSlider");if(!track||!slider||track.dataset.cloned)return;track.insertAdjacentHTML("beforeend",track.innerHTML);track.dataset.cloned="true";dragScroll(slider);slider.addEventListener("mouseenter",()=>track.style.animationPlayState="paused");slider.addEventListener("mouseleave",()=>track.style.animationPlayState="");}
/** Pointer-based drag-to-scroll helper for horizontal content rails. */
function dragScroll(el){
    let down=false, dragged=false, startX=0, startY=0, startLeft=0, pointerId=null;
    el.addEventListener("pointerdown",event=>{
        if(event.pointerType==="mouse"&&event.button!==0)return;
        down=true; dragged=false; pointerId=event.pointerId; startX=event.clientX; startY=event.clientY; startLeft=el.scrollLeft;
        el.classList.add("is-dragging");
        try{el.setPointerCapture(pointerId);}catch(error){}
    });
    el.addEventListener("pointermove",event=>{
        if(!down||event.pointerId!==pointerId)return;
        const dx=event.clientX-startX,dy=event.clientY-startY;
        if(!dragged&&Math.abs(dx)>5&&Math.abs(dx)>Math.abs(dy)){dragged=true;el.dataset.dragged="true";}
        if(dragged){event.preventDefault();el.scrollLeft=startLeft-dx;}
    });
    const finish=event=>{
        if(!down|| (event&&event.pointerId!==pointerId))return;
        down=false;el.classList.remove("is-dragging");
        try{if(pointerId!==null&&el.hasPointerCapture(pointerId))el.releasePointerCapture(pointerId);}catch(error){}
        pointerId=null;
        if(dragged){setTimeout(()=>{delete el.dataset.dragged;},80);}
        dragged=false;
    };
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>el.addEventListener(type,finish));
    el.addEventListener("click",event=>{if(el.dataset.dragged==="true"){event.preventDefault();event.stopPropagation();delete el.dataset.dragged;}},true);
}
/** Apply browser constraint validation and file-size checks to user submissions. */
function initForms() {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", event => {
            if (!form.checkValidity()) { event.preventDefault(); event.stopPropagation(); form.classList.add("was-validated"); return; }
            if (["loginForm", "accountRegisterForm", "sightingForm", "speciesForm", "privacySettingsForm"].includes(form.id)) {
                event.preventDefault();
                const status = form.querySelector("[data-form-status]") || document.getElementById("formStatus") || document.getElementById("privacyStatus");
                const message = "Prototipo de frontend: el formulario se ha validado en el navegador, pero no se envían ni se guardan datos.";
                if (status) { status.textContent = message; status.classList.remove("d-none"); }
                else window.alert(message);
            }
        });
    });
    ["sightingPhoto", "speciesPhoto"].forEach(id => {
        const input = document.getElementById(id);
        input?.addEventListener("change", () => input.setCustomValidity(input.files[0] && input.files[0].size > 5 * 1024 * 1024 ? "La imagen supera el límite de 5 MB." : ""));
    });
    const pass = document.getElementById("accountPasswordConfirm");
    pass?.addEventListener("input", () => pass.setCustomValidity(pass.value !== document.getElementById("accountPassword").value ? "Las contraseñas no coinciden" : ""));
}
/** Keep the visitor menu in its unauthenticated frontend-prototype state. */
function initSession() {
    document.getElementById("guestPanel")?.classList.remove("d-none");
    document.getElementById("memberPanel")?.classList.add("d-none");
}
/** Prepare a mailto link so the contact form works without a mail server. */
function initContact(){document.getElementById("contactForm")?.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("contactName").value,email=document.getElementById("contactEmail").value,message=document.getElementById("contactMessage").value;location.href=`mailto:info@florayfaunabizkaia.eus?subject=${encodeURIComponent("Consulta desde la web")}&body=${encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\n${message}`)}`;});}
/** Populate the shared article template from the selected local article slug. */
function initArticle() {
    const id = new URLSearchParams(location.search).get("id") || "urdaibai";
    const articles = {
      urdaibai: {title:"Urdaibai: un mosaico de vida", image:"img/hero/hero-bizkaia-2.jpg", intro:"El estuario, las marismas, los encinares cantábricos y el litoral forman un mosaico de ambientes conectados.", body:`<div class="article-layout article-layout-editorial"><p class="article-lead">Un estuario no es solo la desembocadura de un río: es una zona de transición donde cambian la salinidad, el nivel del agua y los sedimentos. Esa variedad crea oportunidades para numerosas especies.</p><h2>Un paisaje en movimiento</h2><p>En Urdaibai se suceden canales mareales, zonas de marisma, vegas, bosques y costa. Las aves acuáticas utilizan estos ambientes para alimentarse, descansar o desplazarse durante sus migraciones. La conservación requiere mirar el conjunto y también las conexiones entre sus partes.</p><blockquote class="article-pullquote">La biodiversidad depende tanto de los espacios valiosos como de la conexión entre ellos.</blockquote><h2>Cómo visitarlo con respeto</h2><ul><li>Utiliza senderos y observatorios habilitados.</li><li>No te acerques a nidos ni a grupos de aves en descanso.</li><li>Evita reproducir reclamos sonoros y no alimentes a la fauna.</li></ul><p>Para preparar la visita y conocer las actividades divulgativas, consulta la web de <a href="https://www.birdcenter.org/es/" target="_blank" rel="noopener">Urdaibai Bird Center</a>.</p></div>`},
      forest: {title:"El bosque atlántico y sus especies", image:"img/hero/hero-bizkaia-3.jpg", intro:"Robledales, hayedos, alisedas y otros bosques autóctonos forman una parte esencial del patrimonio natural de Bizkaia.", body:`<div class="article-layout article-layout-field"><h2>Un bosque es mucho más que árboles</h2><p>La estructura del bosque incluye árboles de distintas edades, madera muerta, claros, arbustos, suelo vivo y cursos de agua. Cada elemento aporta refugio o alimento a grupos diferentes de organismos.</p><div class="article-fact-grid"><div><strong>Dosel</strong><span>Regula la luz y el microclima</span></div><div><strong>Sotobosque</strong><span>Arbustos, helechos y regeneración</span></div><div><strong>Suelo</strong><span>Hongos, invertebrados y materia orgánica</span></div></div><h2>Recuperar bosque autóctono</h2><p>El Proyecto ROBLE de la Diputación Foral de Bizkaia busca aumentar la superficie ocupada por bosque autóctono y promover una gestión forestal compatible con la biodiversidad. La ficha institucional describe actuaciones entre 2021 y 2027 y la plantación de especies frondosas autóctonas.</p><p><a href="https://www.bizkaia.eus/es/programas-feder/proyecto-roble" target="_blank" rel="noopener">Consultar el Proyecto ROBLE en Bizkaia.eus</a>.</p></div>`},
      observe: {title:"Cómo observar fauna sin molestar", image:"img/hero/hero-bizkaia-4.jpg", intro:"Una buena observación comienza por reducir nuestra presencia y dejar que los animales mantengan su comportamiento natural.", body:`<div class="article-layout article-layout-checklist"><h2>Antes de salir</h2><p>Consulta las restricciones del espacio, la meteorología y las épocas sensibles de reproducción. Lleva prismáticos y utiliza el zoom de la cámara en lugar de acercarte.</p><h2>Durante la observación</h2><ol><li>Mantén distancia y deja siempre una vía de escape.</li><li>No manipules animales, huevos, nidos ni refugios.</li><li>No publiques la ubicación exacta de especies sensibles.</li><li>Evita flash, drones y sonidos para atraer animales.</li></ol><h2>Registra datos útiles</h2><p>Anota fecha, hora, lugar con el nivel de precisión adecuado, especie y comportamiento observado. Distingue lo que has visto de lo que supones.</p></div>`},
      roble: {title:"Proyecto ROBLE: recuperar bosque autóctono en Bizkaia", image:"img/habitats/bosques.jpg", intro:"La Diputación Foral de Bizkaia desarrolla, con cofinanciación FEDER, actuaciones para aumentar la superficie de bosque autóctono y diversificar los montes.", body:`<div class="article-layout article-layout-data"><p>El Proyecto ROBLE está planteado para el periodo 2021–2027. Según la información institucional, incluye la adquisición de terrenos y su transformación mediante plantaciones de especies frondosas autóctonas, con el objetivo de compatibilizar conservación y actividad forestal sostenible.</p><div class="article-stat-band"><div><strong>2021–2027</strong><span>Periodo del proyecto</span></div><div><strong>8,4 M€</strong><span>Inversión total indicada</span></div><div><strong>3,37 M€</strong><span>Ayudas de la Unión Europea (FEDER)</span></div><div><strong>111 ha</strong><span>Reconvertidas entre 2021 y 2023</span></div><div><strong>Más de 100.000</strong><span>Árboles autóctonos plantados; 73.000 robles del país</span></div></div><h2>Por qué importa la diversidad forestal</h2><p>La mezcla de especies y edades puede mejorar la variedad estructural del bosque y aportar recursos a fauna, hongos y otros organismos. La restauración requiere seguimiento a largo plazo: plantar es el comienzo, no el final del trabajo.</p><p class="article-source"><strong>Fuente y datos:</strong> <a href="https://www.bizkaia.eus/es/programas-feder/proyecto-roble" target="_blank" rel="noopener">Diputación Foral de Bizkaia · Proyecto ROBLE</a>. Las cifras se reproducen como aparecen en la ficha institucional consultada.</p></div>`},
      "fauna-center": {title:"El Centro de Recuperación de Fauna Silvestre de Bizkaia", image:"img/fauna/Erithacus_rubecula.jpg", intro:"La recuperación de animales heridos, enfermos o huérfanos se combina con vigilancia sanitaria y trabajos de conservación.", body:`<div class="article-layout article-layout-feature"><p>El Centro de Recuperación de Fauna Silvestre de Bizkaia atiende ejemplares que necesitan asistencia. La Diputación explica que, además de intentar que los animales recuperen las facultades necesarias para volver al medio natural, el centro participa en programas de vigilancia sanitaria y conservación de especies amenazadas.</p><h2>Más allá de la atención individual</h2><p>Los ejemplares que ingresan también pueden aportar información para el seguimiento de enfermedades, la detección de venenos y la creación de archivos genéticos, especialmente en especies incluidas en el Catálogo Vasco de Especies Amenazadas.</p><aside class="article-note"><strong>Si encuentras un animal silvestre herido</strong><p>No intentes alimentarlo ni tratarlo por tu cuenta. Evita manipularlo y contacta con los servicios oficiales de fauna silvestre.</p></aside><p class="article-source"><a href="https://www.bizkaia.eus/es/centro-de-recuperacion" target="_blank" rel="noopener">Fuente: Centro de Recuperación de Fauna Silvestre · Bizkaia.eus</a>.</p></div>`},
      vison: {title:"El visón europeo: conservar los ríos y sus orillas", image:"img/fauna/Mustela_lutreola.jpg", intro:"El visón europeo es una especie amenazada cuya conservación depende de riberas bien conservadas y de controlar amenazas como el visón americano.", body:`<div class="article-layout article-layout-species"><h2>Una especie ligada a los cursos de agua</h2><p><em>Mustela lutreola</em> está catalogada en España como especie en peligro de extinción. La estrategia estatal señala como una amenaza importante la expansión del visón americano, especie exótica invasora que compite con el visón autóctono.</p><h2>Seguimiento en Bizkaia</h2><p>La información publicada por la Diputación Foral de Bizkaia sobre el seguimiento de 2024 describe capturas de visones americanos en Urdaibai y Arratia, así como detecciones en distintos tramos fluviales. Estos datos muestran la complejidad del control y la necesidad de mantener el seguimiento.</p><p>La conservación no se limita a una especie: mejorar la continuidad de la vegetación de ribera, la calidad del agua y la naturalidad de los cauces beneficia a todo el ecosistema fluvial.</p><div class="article-source-list"><strong>Fuentes consultadas</strong><ul><li><a href="https://www.bizkaia.eus/es/tema-detalle/-/edukia/dt/12802" target="_blank" rel="noopener">Diputación Foral de Bizkaia · Seguimiento del visón europeo</a></li><li><a href="https://www.miteco.gob.es/es/biodiversidad/publicaciones/pbl-fauna-flora-estrategias-vison-europeo.html" target="_blank" rel="noopener">MITECO · Estrategia para la conservación del visón europeo</a></li></ul></div></div>`},
      energia: {title:"Transición energética y naturaleza: planificar con criterio", image:"img/hero/hero-bizkaia-1.jpg", intro:"La transición energética necesita reducir emisiones y, al mismo tiempo, considerar el territorio, la biodiversidad y la participación social.", body:`<div class="article-layout article-layout-policy"><p>La transición energética no consiste únicamente en instalar nuevas tecnologías. La ubicación, el diseño, la eficiencia, el almacenamiento y la participación local influyen en sus impactos y beneficios.</p><h2>Un ejemplo cercano: Ekiola Lea-Artibai</h2><p>En Etxebarria funciona la comunidad energética Ekiola Lea-Artibai, basada en una instalación solar fotovoltaica de ámbito local y en un modelo cooperativo para generar y consumir energía renovable. La iniciativa permite que la ciudadanía participe en la producción energética de proximidad.</p><p class="article-source"><a href="https://www.eve.eus/proyectos-energeticos/renovables-redes/comunidades-energeticas/" target="_blank" rel="noopener">Ente Vasco de la Energía · Comunidades energéticas</a> · <a href="https://www.eve.eus/proyectos-energeticos/renovables-redes/comunidades-energeticas/" target="_blank" rel="noopener">Ente Vasco de la Energía · Ekiola Lea-Artibai en funcionamiento</a>.</p><h2>Qué está promoviendo Bizkaia</h2><p>El Programa Transición Verde 2026 de la Diputación Foral de Bizkaia incluye líneas de apoyo para medición del impacto ambiental, inversiones verdes e innovación ambiental y economía circular. No debe confundirse este programa de ayudas empresariales con una convocatoria específica de instalación doméstica de renovables.</p><h2>Una planificación responsable</h2><ul><li>Priorizar ahorro y eficiencia energética.</li><li>Evaluar impactos sobre hábitats y especies antes de elegir emplazamientos.</li><li>Favorecer superficies ya transformadas cuando sea viable.</li><li>Incorporar seguimiento ambiental y medidas correctoras.</li></ul><p class="article-source"><a href="https://www.bizkaia.eus/es/tema-detalle/-/edukia/dt/12712" target="_blank" rel="noopener">Fuente: Programa Transición Verde 2026 · Bizkaia.eus</a>. Para el marco general, consulta también la <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2024-4783" target="_blank" rel="noopener">Ley 1/2024 de Transición Energética y Cambio Climático</a>.</p></div>`}
    };
    const article = articles[id] || articles.urdaibai;
    const title = document.getElementById("articleTitle");
    const image = document.getElementById("articleImage");
    const intro = document.getElementById("articleIntro");
    const body = document.getElementById("articleBody");
    if (title) title.textContent = article.title;
    if (image) { image.src = article.image; image.alt = article.title; }
    if (intro) intro.textContent = article.intro;
    if (body) body.innerHTML = article.body;
    window.applySiteLanguage?.(localStorage.getItem("bizkaia-language") || "es");
}
/** Authentication is intentionally not implemented in this frontend-only version. */
function readUser(){return null;}function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}

/** Keep the editorial species feature local and independent of server records. */
function initMonthlySpecies() {
    const title = document.getElementById("monthlyPeriod");
    if (!title) return;
    const date = new Date();
    const monthEs = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(date);
    const monthEu = new Intl.DateTimeFormat("eu-ES", { month: "long" }).format(date);
    title.dataset.es = `Especie destacada de ${monthEs} de ${date.getFullYear()}`;
    title.dataset.eus = `${date.getFullYear()}ko ${monthEu}ko espezie nabarmendua`;
    title.textContent = localStorage.getItem("bizkaia-language") === "eus" ? title.dataset.eus : title.dataset.es;
}

/** Reuse one species-detail layout for the catalogue species slugs. */
function initSpeciesDetail(){const id=new URLSearchParams(location.search).get("id");const data={robin:{common:"Petirrojo europeo",scientific:"Erithacus rubecula",type:"Fauna",image:"img/imagenes-extra/txantxangorri.jpg",description:"Ave pequeña y robusta, reconocible por la coloración anaranjada de la cara y el pecho. Habita bosques, setos, parques y jardines.",status:"Preocupación menor (referencia general; verificar fuente oficial)",habitats:"Bosques, setos, jardines y parques"},beech:{common:"Haya común",scientific:"Fagus sylvatica",type:"Flora",image:"img/hero/hero-bizkaia-3.jpg",description:"Árbol caducifolio de copa amplia, frecuente en hayedos frescos y ambientes de montaña.",status:"Verificar con fuente oficial",habitats:"Hayedos y bosques montanos"},heron:{common:"Garza real",scientific:"Ardea cinerea",type:"Fauna",image:"img/hero/hero-bizkaia-2.jpg",description:"Ave zancuda asociada a ríos, estuarios, marismas y otras zonas húmedas.",status:"Verificar con fuente oficial",habitats:"Estuarios, ríos y humedales"},"holm-oak":{common:"Encina",scientific:"Quercus ilex",type:"Flora",image:"img/hero/hero-bizkaia-5.jpeg",description:"Árbol perenne de hoja coriácea que forma encinares en ambientes templados y mediterráneos.",status:"Verificar con fuente oficial",habitats:"Encinares y bosques mixtos"},"roe-deer":{common:"Corzo",scientific:"Capreolus capreolus",type:"Fauna",image:"img/hero/hero-bizkaia-4.jpg",description:"Pequeño ungulado forestal que utiliza mosaicos de bosque, claros y zonas de matorral.",status:"Verificar con fuente oficial",habitats:"Bosques, claros y matorrales"},oak:{common:"Roble pedunculado",scientific:"Quercus robur",type:"Flora",image:"img/hero/hero-bizkaia-1.jpg",description:"Árbol caducifolio emblemático de los robledales atlánticos y bosques húmedos.",status:"Verificar con fuente oficial",habitats:"Robledales atlánticos y bosques mixtos"}}[id];if(!data)return;const set=(elementId,value)=>{const el=document.getElementById(elementId);if(el)el.textContent=value;};set("detailTitle",data.common);set("detailScientific",data.scientific);set("detailType",data.type);set("detailDescription",data.description);set("detailConservation",data.status);set("detailHabitats",data.habitats);const image=document.getElementById("detailImage");if(image){image.src=data.image;image.alt=data.common;}}


/** Show a Bootstrap modal when a visitor attempts a protected contribution. */
function initAuthModal() { /* Authentication is intentionally outside this frontend-only prototype. */ }


/** Load the signed-in user's approved and pending observations and privacy preferences. */
function initUserArea() {
    const table = document.querySelector("#mySightingsTable tbody");
    if (table) table.innerHTML = '<tr><td colspan="4" class="text-secondary">No hay registros personales: esta versión no almacena avistamientos.</td></tr>';
    const form = document.getElementById("privacySettingsForm");
    const status = document.getElementById("privacyStatus");
    form?.addEventListener("submit", event => { event.preventDefault(); if (status) status.textContent = "Los ajustes se muestran como interfaz de ejemplo y no se guardan."; });
}


/** Persist the selected language and translate every element carrying bilingual content. */
function initLanguage() {
    const buttons = [...document.querySelectorAll("[data-language]")];
    if (!buttons.length) return;
    const applyLanguage = language => {
        const selected = language === "eus" || language === "eu" ? "eus" : "es";
        document.documentElement.lang = selected === "eus" ? "eu" : "es";
        localStorage.setItem("bizkaia-language", selected);
        document.querySelectorAll("[data-es][data-eus]").forEach(element => {
            const translated = element.dataset[selected];
            if (translated === undefined) return;
            if (element.dataset.translateMode === "html") element.innerHTML = translated;
            else element.textContent = translated;
        });
        const translations = {
            "Conocer · Proteger · Compartir":"Ezagutu · Babestu · Partekatu",
            "Selecciona una comarca en el mapa o en la lista para consultar especies del catálogo asociadas a sus hábitats.":"Hautatu eskualde bat mapan edo zerrendan, bertako habitatekin lotutako katalogoko espezieak ikusteko.",
            "Proyecto ROBLE: recuperar bosque autóctono":"ROBLE proiektua: bertako basoa berreskuratzea",
            "Actuaciones para ampliar y diversificar los bosques autóctonos de Bizkaia.":"Bizkaiko bertako basoak handitzeko eta dibertsifikatzeko jarduerak.",
            "El trabajo del centro de recuperación":"Fauna berreskuratzeko zentroaren lana",
            "Qué ocurre cuando un animal silvestre necesita atención especializada.":"Zer gertatzen da animalia basati batek arreta espezializatua behar duenean.",
            "El visón europeo y los ríos":"Bisoi europarra eta ibaiak",
            "La conservación de una especie ligada a riberas y cauces bien conectados.":"Ibaiertzei eta ondo konektatutako ibilguei lotutako espezie baten kontserbazioa.",
            "Energía renovable y biodiversidad":"Energia berriztagarria eta biodibertsitatea",
            "Cómo planificar la transición energética teniendo en cuenta la naturaleza.":"Trantsizio energetikoa nola planifikatu natura kontuan hartuta.",
            "Conservación":"Kontserbazioa", "Fauna silvestre":"Fauna basatia", "Especies amenazadas":"Mehatxatutako espezieak", "Energía y territorio":"Energia eta lurraldea",
            "Tu observación puede ayudar a conocer mejor la biodiversidad de Bizkaia. Comparte qué has visto, dónde y cuándo; si puedes, añade una fotografía para facilitar la identificación.":"Zure behaketak Bizkaiko biodibertsitatea hobeto ezagutzen lagun dezake. Partekatu zer ikusi duzun, non eta noiz; ahal baduzu, gehitu argazki bat identifikazioa errazteko.",
            "Ciencia ciudadana · Conservación":"Herritarren zientzia · Kontserbazioa", "Tu mirada cuenta":"Zure begiradak balio du", "Observa":"Behatu", "Ubica":"Kokatu", "Fotografía":"Argazkia", "Compartir una observación":"Behaketa bat partekatu", "Consultar especies":"Espezieak kontsultatu",
            "Registro de flora":"Floraren erregistroa", "Listado de especies vegetales del proyecto. Las fotografías se incorporarán cuando estén preparadas.":"Proiektuko landare-espezieen zerrenda. Argazkiak prest daudenean gehituko dira.", "Foto pendiente":"Argazkia falta da", "Buscar por nombre común o científico":"Bilatu izen arruntaren edo zientifikoaren arabera"
            ,"Asociación orientativa basada en el hábitat principal de cada especie; no equivale a un registro de avistamiento verificado.":"Espezie bakoitzaren habitat nagusian oinarritutako lotura orientagarria da; ez da behaketa-erregistro egiaztatua."
            ,"especies vegetales":"landare-espezie"
            ," especies del catálogo asociadas a los hábitats descritos para ":" katalogoko espezie habitat deskribatuekin lotuta: ",
            "Un espacio colaborativo para descubrir la flora y fauna de nuestro territorio, explorar sus hábitats y aportar observaciones que ayuden a conservarlos.":"Gure lurraldeko flora eta fauna ezagutzeko, habitatak aztertzeko eta haiek kontserbatzen lagunduko duten behaketak partekatzeko gune kolaboratiboa.",
            "Participar":"Parte hartu", "Nuestro objetivo":"Gure helburua", "Explora el territorio":"Lurraldea arakatu",
            "Bizkaia comarca a comarca":"Bizkaia, eskualdez eskualde", "Selecciona una comarca en el mapa o en el listado para consultar especies registradas en sus hábitats.":"Hautatu eskualde bat mapan edo zerrendan, bertako habitatetako espezieak kontsultatzeko.",
            "Comarcas de Bizkaia":"Bizkaiko eskualdeak", "Catálogo territorial":"Lurralde-katalogoa", "Especies observadas":"Behatutako espezieak",
            "Especie":"Espeziea", "Nombre científico":"Izen zientifikoa", "Tipo":"Mota", "Conservación":"Kontserbazioa", "Ficha":"Fitxa",
            "Protagonista del mes":"Hileko protagonista", "Especie destacada":"Espezie nabarmendua", "Descubrir la especie":"Ezagutu espeziea", "Registrar observación":"Behaketa erregistratu",
            "Ideas para seguir explorando":"Arakatzen jarraitzeko ideiak", "Historias de naturaleza":"Naturaren istorioak", "Urdaibai: un mosaico de vida":"Urdaibai: bizitzaz osatutako mosaikoa",
            "Marismas, encinares y litoral forman un entorno valioso.":"Padurek, artadiek eta itsasertzak balio handiko ingurunea osatzen dute.",
            "Leer artículo":"Irakurri artikulua", "El bosque atlántico":"Baso atlantikoa", "Especies vegetales que forman nuestros bosques.":"Gure basoak osatzen dituzten landare-espezieak.",
            "Observar fauna sin molestar":"Fauna molestatu gabe behatzea", "Cómo registrar fauna respetando su hábitat.":"Nola erregistratu fauna haren habitata errespetatuz.",
            "La importancia de los datos locales":"Tokiko datuen garrantzia", "La ciencia ciudadana ayuda a conocer la distribución.":"Herritarren zientziak espezieen banaketa ezagutzen laguntzen du.",
            "Tu observación importa":"Zure behaketak garrantzia du", "¿Has encontrado una especie interesante?":"Espezie interesgarriren bat aurkitu duzu?",
            "Registra el lugar, la fecha y una fotografía para ampliar el conocimiento de la biodiversidad de Bizkaia.":"Erregistratu lekua, data eta argazkia Bizkaiko biodibertsitateari buruzko ezagutza zabaltzeko.",
            "Vídeos y webcams":"Bideoak eta webcamak", "La naturaleza de Bizkaia, en directo":"Bizkaiko natura zuzenean",
            "Descubre vídeos del Urdaibai Bird Center y cámaras en directo de los humedales y la costa vizcaína.":"Ezagutu Urdaibai Bird Centerreko bideoak eta Bizkaiko hezeguneetako zein kostaldeko zuzeneko kamerak.",
            "Organización territorial":"Lurralde-antolaketa", "Comarcas de Bizkaia":"Bizkaiko eskualdeak", "Explora la biodiversidad por zonas y descubre los hábitats característicos de cada comarca.":"Aztertu biodibertsitatea eremuka eta ezagutu eskualde bakoitzeko habitat bereizgarriak.",
            "Territorio":"Lurraldea", "Pasa el cursor por una comarca para resaltarla en el mapa o selecciónala para consultar su información.":"Jarri kurtsorea eskualde baten gainean mapan nabarmentzeko, edo hautatu haren informazioa ikusteko.",
            "Ver en Google Maps":"Ikusi Google Maps-en", "Ver especies":"Ikusi espezieak", "Ver ficha de comarca":"Ikusi eskualdeko fitxa", "Ver catálogo de fauna":"Ikusi faunaren katalogoa", "Biodiversidad":"Biodibertsitatea", "Catálogo de biodiversidad":"Biodibertsitate-katalogoa",
            "Consulta fichas de flora y fauna y filtra por tipo o comarca.":"Kontsultatu floraren eta faunaren fitxak, eta iragazi motaren edo eskualdearen arabera.",
            "Buscar especie":"Bilatu espeziea", "Flora y fauna":"Flora eta fauna", "Todas":"Guztiak", "Filtrar":"Iragazi",
            "Registro de fauna":"Faunaren erregistroa", "Listado estático de especies con identificador, fotografía y clasificación.":"Identifikatzailea, argazkia eta sailkapena dituzten espezieen zerrenda estatikoa.",
            "Todos los hábitats":"Habitat guztiak", "Todos los grupos":"Talde guztiak", "Foto":"Argazkia", "Hábitat principal":"Habitat nagusia", "Ver ficha":"Ikusi fitxa",
            "La tabla de flora se incorporará cuando estén preparadas las fotografías correspondientes.":"Floraren taula dagozkion argazkiak prestatzen direnean gehituko da.",
            "Espacios naturales":"Naturaguneak", "Hábitats de Bizkaia":"Bizkaiko habitatak", "Catálogo de ecosistemas":"Ekosistemen katalogoa",
            "Los 26 hábitats del proyecto":"Proiektuko 26 habitatak", "Ver especies de este hábitat":"Ikusi habitat honetako espezieak",
            "Audiovisual":"Ikus-entzunezkoa", "Vídeos y cámaras en directo":"Bideoak eta zuzeneko kamerak", "Vídeo destacado":"Bideo nabarmendua",
            "Urdaibai, naturaleza viva":"Urdaibai, natura bizia", "Lista de reproducción":"Erreprodukzio-zerrenda", "Abrir canal de YouTube":"Ireki YouTube kanala",
            "Observación en directo":"Zuzeneko behaketa", "Webcams de Bizkaia":"Bizkaiko webcamak", "Aves y marismas de Urdaibai":"Urdaibaiko hegaztiak eta padurak",
            "Ver cámaras oficiales":"Ikusi kamera ofizialak", "Webcam y olas de Sopela":"Sopelako webcam-a eta olatuak", "Abrir webcams de Sopela":"Ireki Sopelako webcamak",
            "Directorio de cámaras de playas":"Hondartzetako kameren direktorioa", "Ver directorio de webcams":"Ikusi webcam-direktorioa",
            "Cuaderno de campo":"Landako koadernoa", "Artículos, curiosidades y consejos para disfrutar de la biodiversidad.":"Biodibertsitateaz gozatzeko artikuluak, bitxikeriak eta aholkuak.",
            "Proyecto ROBLE: recuperar bosque autóctono":"ROBLE proiektua: bertako basoa berreskuratzea", "Leer reportaje":"Irakurri erreportajea",
            "El Centro de Recuperación de Fauna Silvestre":"Fauna Basatia Berreskuratzeko Zentroa", "Conocer el trabajo del centro":"Ezagutu zentroaren lana",
            "El visón europeo y los ríos de Bizkaia":"Bisoi europarra eta Bizkaiko ibaiak", "Leer la ficha":"Irakurri fitxa",
            "Transición energética y biodiversidad":"Trantsizio energetikoa eta biodibertsitatea", "Leer análisis":"Irakurri azterketa",
            "Información":"Informazioa", "Aviso legal":"Lege-oharra", "Política de cookies":"Cookie-politika", "Privacidad":"Pribatutasuna",
            "Volver a inicio":"Itzuli hasierara", "Contacto":"Kontaktua", "Explora":"Arakatu", "Estamos en CIFP TARTANGA LHII":"CIFP TARTANGA LHII-n gaude",
            "Lunes a viernes":"Astelehenetik ostiralera", "Política de privacidad":"Pribatutasun-politika", "Iniciar sesión":"Hasi saioa", "Solicitar cuenta":"Eskatu kontua",
            "Área de usuario":"Erabiltzaile-eremua", "Mi perfil y registros":"Nire profila eta erregistroak", "Ajustes y privacidad":"Ezarpenak eta pribatutasuna",
            "Cerrar sesión":"Itxi saioa", "Proponer una especie":"Proposatu espezie bat", "Registrar una especie":"Erregistratu espezie bat", "Registrar un avistamiento":"Erregistratu behaketa bat",
            "Marinos":"Itsas habitatak", "Litorales":"Itsasertzak", "Mar abierto":"Itsaso zabala", "Acantilados costeros":"Kostaldeko itsaslabarrak", "Islotes":"Uharte txikiak", "Playa":"Hondartza", "Dunas":"Dunak", "Estuarios":"Estuarioak", "Rías":"Itsasadarrak", "Zonas húmedas":"Hezeguneak", "Marismas":"Padurak", "Ríos":"Ibaiak", "Arroyos":"Errekak", "Bosques de ribera":"Ibaiertzeko basoak", "Bosques y formaciones forestales":"Basoak eta baso-formazioak", "Montaña":"Mendia", "Roquedos":"Harkaitzak", "Zonas de cumbre":"Gailur-eremuak", "Pastizales":"Larreak", "Matorrales de montaña":"Mendiko sastrakadiak", "Cortados calizos":"Kareharrizko amildegiak", "Cuevas":"Kobazuloak", "Medios humano-agropecuarios":"Nekazaritza eta abeltzaintzako inguruneak", "Valles":"Haranak", "Campiña atlántica":"Atlantikoko landazabala", "Urbes (ciudades y pueblos)":"Hiriak eta herriak",
            "Hábitat de Bizkaia":"Bizkaiko habitata", "Comarcas:":"Eskualdeak:",
            "Ecosistemas de agua salada que incluyen fondos, comunidades y zonas de transición del medio marino.":"Itsas hondoa, komunitateak eta itsas ingurunearen trantsizio-eremuak barne hartzen dituzten ur gaziko ekosistemak.",
            "Franja de contacto entre tierra y mar, sometida al oleaje, las mareas y el viento.":"Lurraren eta itsasoaren arteko eremua, olatuen, mareen eta haizearen eraginpean.",
            "Aguas alejadas de la costa, utilizadas por aves marinas y cetáceos durante sus desplazamientos y alimentación.":"Kostaldetik urrun dauden urak, itsas hegaztiek eta zetazeoek mugitzeko eta elikatzeko erabiltzen dituztenak.",
            "Paredes rocosas expuestas al mar, con vegetación adaptada al viento, la salinidad y la escasez de suelo.":"Itsasora begira dauden horma harritsuak, haizera, gazitasunera eta lurzoru urrira egokitutako landarediarekin.",
            "Pequeñas elevaciones rocosas aisladas en el mar que ofrecen refugio y lugares de cría a aves marinas.":"Itsasoan isolatutako goragune harritsu txikiak, itsas hegaztiei babeslekua eta ugaltzeko tokiak eskaintzen dizkietenak.",
            "Acumulaciones de arena o grava modeladas por el oleaje y las mareas; son espacios dinámicos y sensibles.":"Olatuen eta mareen eraginez moldatutako harea- edo legar-metaketak; ingurune dinamiko eta sentikorrak dira.",
            "Montículos de arena formados por el viento, con plantas especializadas que fijan el sustrato.":"Haizeak sortutako harea-muinoak, substratua finkatzen duten landare espezializatuekin.",
            "Tramos finales de los ríos donde se mezclan agua dulce y salada y se forman gradientes ecológicos.":"Ur geza eta gazia nahasten diren ibaien azken tarteak, gradiente ekologikoak sortzen dituztenak.",
            "Valles fluviales inundados por el mar, con canales, márgenes y comunidades propias de aguas salobres.":"Itsasoak hartutako ibai-haranak, ubide, ertzak eta ur gazikara propioetako komunitateekin.",
            "Áreas encharcadas de forma permanente o temporal que sostienen una elevada diversidad de vida.":"Modu iraunkorrean edo aldi baterako urez betetako eremuak, bizi-aniztasun handia dutenak.",
            "Humedales mareales con vegetación tolerante a la sal, esenciales para alimentación y descanso de aves.":"Mareen eraginpeko hezeguneak, gatzarekiko tolerantea den landarediarekin; hegaztien elikadurarako eta atseden hartzeko funtsezkoak.",
            "Cursos naturales de agua dulce que conectan montañas, valles y estuarios.":"Mendiak, haranak eta estuarioak lotzen dituzten ur gezako ibilgu naturalak.",
            "Pequeños cursos de agua, a menudo sombreados, que aportan conectividad y refugio a especies fluviales.":"Ur-ibilgu txikiak, askotan itzaltsuak, ibaietako espezieei konektibitatea eta babesa ematen dietenak.",
            "Formaciones arboladas que acompañan a ríos y arroyos, estabilizan orillas y aportan sombra.":"Ibai eta erreken ertzetan hazten diren zuhaitz-formazioak, ertzak egonkortu eta itzala ematen dutenak.",
            "Robledales, hayedos, encinares y otras formaciones forestales, naturales o seminaturales.":"Hariztiak, pagadiak, artadiak eta beste baso-formazio natural edo erdinatural batzuk.",
            "Paisajes de media y alta montaña con mosaicos de bosque, matorral, roquedo y pastizal.":"Baso, sastrakadi, harkaitz eta larreen mosaikoak dituzten erdi- eta goi-mendiko paisaiak.",
            "Afloramientos rocosos que proporcionan refugio, zonas de descanso y microhábitats especializados.":"Babesa, atsedenlekuak eta mikrohabitat espezializatuak eskaintzen dituzten harkaitz-azaleramenduak.",
            "Áreas elevadas expuestas al viento y a condiciones climáticas más extremas.":"Haizearen eta klima-baldintza gogorragoen eraginpean dauden goi-eremuak.",
            "Espacios abiertos dominados por herbáceas, mantenidos por condiciones naturales o por usos ganaderos.":"Belarkarak nagusi diren eremu irekiak, baldintza naturalek edo abeltzaintza-erabilerek mantenduak.",
            "Matorrales de altura y brezales que forman transiciones entre pastizales, roquedos y bosques.":"Larreen, harkaitzen eta basoen arteko trantsizioak osatzen dituzten goi-mendiko sastrakadiak eta txilardiak.",
            "Escarpes de roca caliza con grietas y repisas donde se desarrollan comunidades adaptadas a la roca.":"Kareharrizko amildegiak, arraildura eta erlaitzekin, harkaitzera egokitutako komunitateak garatzen dituztenak.",
            "Cavidades subterráneas y sistemas kársticos con fauna especializada y condiciones ambientales estables.":"Fauna espezializatua eta ingurumen-baldintza egonkorrak dituzten lurpeko barrunbeak eta sistema karstikoak.",
            "Paisajes de caseríos, cultivos, prados y setos que combinan actividad humana y biodiversidad.":"Baserri, laborantza, belardi eta heskaien paisaiak, giza jarduera eta biodibertsitatea uztartzen dituztenak.",
            "Unidades de paisaje que integran laderas, cursos fluviales, bosques y asentamientos.":"Maldak, ibai-ibilguak, basoak eta biziguneak biltzen dituzten paisaia-unitateak.",
            "Mosaico tradicional de prados, setos, pequeños bosquetes y explotaciones rurales del paisaje atlántico.":"Belardi, heskai, basotxo eta landa-ustiategien mosaiko tradizionala, paisaia atlantikoaren bereizgarria.",
            "Entornos urbanos con parques, jardines, arbolado, solares y corredores verdes que pueden albergar fauna y flora.":"Parkeak, lorategiak, zuhaitzak, orubeak eta korridore berdeak dituzten hiri-inguruneak, fauna eta flora har ditzaketenak.",
            "Ría del Nervión, parques urbanos, robledales y bosques de ribera.":"Nerbioi itsasadarra, hiri-parkeak, hariztiak eta ibaiertzeko basoak.",
            "Montes de Ordunte, hayedos, pastizales y bosques atlánticos.":"Ordunteko mendiak, pagadiak, larreak eta baso atlantikoak.",
            "Urkiola, roquedos calizos, hayedos y pastizales montanos.":"Urkiola, kareharrizko harkaitzak, pagadiak eta mendiko larreak.",
            "Valles fluviales, bosques de ribera y laderas del Gorbeia.":"Ibai-haranak, ibaiertzeko basoak eta Gorbeiako magalak.",
            "Río Lea, campiña, costa rocosa y playas.":"Lea ibaia, landazabala, kostalde harritsua eta hondartzak.",
            "Marismas, estuario, encinares cantábricos y litoral protegido.":"Padurak, estuarioa, artadi kantauriarrak eta babestutako itsasertza.",
            "Acantilados, dunas, playas y medio marino costero.":"Itsaslabarrak, dunak, hondartzak eta kostaldeko itsas ingurunea.",
            "Espacios naturales y centros de interpretación vinculados a los hábitats de Bizkaia.":"Bizkaiko habitatetako naturaguneak eta interpretazio-zentroak.",
            "Macizo montañoso con hayedos, roquedos calizos y pastizales de altura.":"Mendi-multzoa, pagadi, kareharrizko harkaitz eta goi-larreekin.",
            "Hayedos, pastos de montaña, ríos y paisajes del macizo del Gorbeia.":"Pagadiak, mendiko larreak, ibaiak eta Gorbeia mendiguneko paisaiak.",
            "Relieve kárstico, encinares, bosques y sistemas de cuevas.":"Erliebe karstikoa, artadiak, basoak eta kobazulo-sistemak.",
            "Estuario, marismas, encinares cantábricos, playas y acantilados.":"Estuarioa, padurak, artadi kantauriarrak, hondartzak eta itsaslabarrak.",
            "Islote y acantilados de gran valor paisajístico y litoral.":"Paisaia- eta itsasertz-balio handiko uhartetxoa eta itsaslabarrak.",
            "Centro de divulgación, observación e investigación de aves y humedales.":"Hegaztien eta hezeguneen dibulgazio-, behaketa- eta ikerketa-zentroa.",
            "Entorno fluvial con bosques de ribera y mosaico rural de Lea-Artibai.":"Ibai-ingurunea, ibaiertzeko basoekin eta Lea-Artibaiko landa-mosaikoarekin.",
            "Acantilados, arenales y medio marino costero de la franja litoral.":"Itsaslabarrak, hareatza eta kostaldeko itsas ingurunea.",
            "La recuperación de animales heridos, enfermos o huérfanos se combina con vigilancia sanitaria y trabajos de conservación.":"Zauritutako, gaixotutako edo umezurtz geratutako animaliak berreskuratzea osasun-zaintzarekin eta kontserbazio-lanekin uztartzen da.",
            "Atención a animales, vigilancia sanitaria y conservación de especies amenazadas.":"Animalien arreta, osasun-zaintza eta espezie mehatxatuen kontserbazioa.",
            "Seguimiento de la especie y amenazas que afectan a sus poblaciones.":"Espeziearen jarraipena eta haren populazioei eragiten dieten mehatxuak.",
            "Cómo compatibilizar las actuaciones de transición verde con la protección de los hábitats.":"Trantsizio berdeko jarduerak habitaten babesarekin nola bateratu.",
            "La Diputación Foral de Bizkaia desarrolla, con cofinanciación FEDER, actuaciones para aumentar la superficie de bosque autóctono y diversificar los montes.":"Bizkaiko Foru Aldundiak, EGEF funtsen kofinantzaketarekin, bertako basoen azalera handitzeko eta mendiak dibertsifikatzeko jarduerak garatzen ditu.",
            "El Centro de Recuperación de Fauna Silvestre de Bizkaia":"Bizkaiko Fauna Basatia Berreskuratzeko Zentroa",
            "El visón europeo y los ríos de Bizkaia":"Bisoi europarra eta Bizkaiko ibaiak",
            "Transición energética y biodiversidad":"Trantsizio energetikoa eta biodibertsitatea",
            "Este aviso identifica el carácter y las condiciones de uso del prototipo educativo Flora y Fauna de Bizkaia. Los datos identificativos definitivos deberán confirmarse antes de su publicación pública.":"Ohar honek Flora eta Fauna de Bizkaia hezkuntza-prototipoaren izaera eta erabilera-baldintzak azaltzen ditu. Behin betiko identifikazio-datuak argitaratu aurretik egiaztatu behar dira.",
            "Esta página describe el uso de tecnologías de almacenamiento en el prototipo educativo Flora y Fauna de Bizkaia. Debe revisarse y completarse antes de publicar el sitio como servicio real.":"Orrialde honek Flora eta Fauna de Bizkaia hezkuntza-prototipoan biltegiratze-teknologien erabilera azaltzen du. Webgunea benetako zerbitzu gisa argitaratu aurretik berrikusi eta osatu behar da.",
            "La selección del idioma y del tema visual se guarda en localStorage para recordar las preferencias entre visitas. El prototipo no guarda cuentas, avistamientos ni propuestas. Estas preferencias permanecen únicamente en el navegador y no se envían a un servidor.":"Hizkuntza eta ikusizko gaia localStorage-n gordetzen dira, bisiten artean hobespenak gogoratzeko. Prototipo honek ez ditu datuak zerbitzari batera bidaltzen eta ez du datu-baserik erabiltzen.",
            "Documento orientativo para un proyecto académico; no constituye asesoramiento jurídico.":"Proiektu akademiko baterako orientazio-dokumentua da; ez da aholkularitza juridikoa.",
            "Proyecto educativo de la clase 209 del Instituto Tartanga de FP.":"Tartanga LHIIko 209. gelako hezkuntza-proiektua.",
            "Proyecto Challenge 1.2, DAMi 1º":"Challenge 1.2 proiektua, DAMi 1. maila", "Grupo:":"Taldea:", "Estamos en CIFP TARTANGA LHII":"CIFP TARTANGA LHII-n gaude",
            "La naturaleza de Bizkaia,":"Bizkaiko natura,", " en tus manos":" zure esku", "Explorar":"Arakatu", "Una comunidad que observa para":"Behaketaren bidez kontserbatzeko komunitatea", "conservar el medio natural":"ingurune naturala kontserbatzeko", "Bizkaia reúne paisajes costeros, rías, bosques, montañas y zonas húmedas que albergan una extraordinaria diversidad biológica. Esta plataforma conecta ese patrimonio natural con las personas que quieren conocerlo y cuidarlo.":"Bizkaiak kostaldeko paisaiak, itsasadarrak, basoak, mendiak eta hezeguneak biltzen ditu, aniztasun biologiko aparta hartzen dutenak. Plataforma honek natura-ondare hori ezagutu eta zaindu nahi duten pertsonekin lotzen du.", "Organizamos la información por comarcas y hábitats, reunimos fichas de especies de flora y fauna y facilitamos el registro de observaciones. Cada aportación ayuda a construir una visión compartida de la biodiversidad local.":"Informazioa eskualde eta habitaten arabera antolatzen dugu, flora eta faunako espezieen fitxak biltzen ditugu eta behaketak erregistratzea errazten dugu. Ekarpen bakoitzak tokiko biodibertsitatearen ikuspegi partekatua eraikitzen laguntzen du.", "Descubrir":"Ezagutu", "Conocer especies y hábitats.":"Espezieak eta habitatak ezagutzea.", "Proteger":"Babestu", "Cuidar el medio natural.":"Ingurune naturala zaintzea.", "Compartir":"Partekatu", "Aportar conocimiento.":"Ezagutza partekatzea.", "Un territorio lleno de vida":"Biziz betetako lurraldea", "Selecciona una zona":"Hautatu eremu bat", "Mapa comarcal de Bizkaia":"Bizkaiko eskualde-mapa", "Las comarcas no constituyen una división administrativa oficial":"Eskualdeak ez dira banaketa administratibo ofiziala.", "Catálogo completo":"Katalogo osoa", "Selecciona una comarca para consultar sus especies.":"Hautatu eskualde bat bertako espezieak kontsultatzeko.", "Pequeño y reconocible por su pecho anaranjado, el petirrojo es frecuente en jardines, setos y bosques. Su presencia nos invita a observar con atención los cambios estacionales y la vida cotidiana de los ecosistemas.":"Bular laranja bereizgarria duen txori txikia da txantxangorria; lorategietan, heskaietan eta basoetan ohikoa da. Haren presentziak urtaro-aldaketak eta ekosistemen eguneroko bizitza arretaz behatzera gonbidatzen gaitu.", "Selección editorial":"Hautaketa editoriala", "Equipo del proyecto":"Proiektu-taldea", "Protagonistas de meses anteriores":"Aurreko hilabeteetako protagonistak",
            "En Etxebarria funciona la comunidad energética Ekiola Lea-Artibai, basada en una instalación solar fotovoltaica de ámbito local y en un modelo cooperativo para generar y consumir energía renovable. La iniciativa permite que la ciudadanía participe en la producción energética de proximidad.":"Bizkaian martxan dago Ekiola Lea-Artibai energia-komunitatea, tokiko eguzki-instalazio fotovoltaiko batean eta energia berriztagarria sortu eta kontsumitzeko eredu kooperatibo batean oinarritua. Ekimenak herritarrei gertuko energia-ekoizpenean parte hartzeko aukera ematen die.", "Un ejemplo cercano: Ekiola Lea-Artibai":"Hurbileko adibidea: Ekiola Lea-Artibai", "En Etxebarria funciona la comunidad energética Ekiola Lea-Artibai, basada en una instalación solar fotovoltaica de ámbito local y en un modelo cooperativo para generar y consumir energía renovable. La iniciativa permite que la ciudadanía participe en la producción energética de proximidad.":"Etxebarrian martxan dago Ekiola Lea-Artibai energia-komunitatea, tokiko eguzki-instalazio fotovoltaiko batean eta energia berriztagarria sortu eta kontsumitzeko eredu kooperatibo batean oinarritua. Ekimenak herritarrei gertuko energia-ekoizpenean parte hartzeko aukera ematen die.", "Qué está promoviendo Bizkaia":"Zer sustatzen ari da Bizkaia", "Una planificación responsable":"Plangintza arduratsua"
        };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
            if (textNode.parentElement?.closest("[data-es][data-eus]")) continue;
            const original = textNode.__originalSpanish || textNode.nodeValue;
            if (!textNode.__originalSpanish) textNode.__originalSpanish = original;
            const trimmed = original.trim();
            if (!trimmed || !translations[trimmed]) {
                if (selected === "es") textNode.nodeValue = original;
                continue;
            }
            const leading = original.match(/^\s*/)?.[0] || "";
            const trailing = original.match(/\s*$/)?.[0] || "";
            textNode.nodeValue = selected === "eus" ? leading + translations[trimmed] + trailing : original;
        }
        const themeButton = document.getElementById("themeToggle");
        if (themeButton) themeButton.setAttribute("aria-label", selected === "eus" ? (document.documentElement.dataset.bsTheme === "dark" ? "Aktibatu gai argia" : "Aktibatu gai iluna") : (document.documentElement.dataset.bsTheme === "dark" ? "Activar tema claro" : "Activar tema oscuro"));
        const audioButton = document.getElementById("audioToggle");
        if (audioButton) audioButton.setAttribute("aria-label", selected === "eus" ? "Soinua aktibatu edo isilarazi" : "Activar o silenciar sonido");
        const topButton = document.getElementById("backToTop");
        if (topButton) { topButton.setAttribute("aria-label", selected === "eus" ? "Itzuli hasierara" : "Volver al principio"); topButton.title = topButton.getAttribute("aria-label"); }
        window.applySiteLanguage = applyLanguage;
        buttons.forEach(button => {
            const active = (button.dataset.language === selected) || (selected === "eus" && button.dataset.language === "eu");
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    };
    buttons.forEach(button => button.addEventListener("click", () => applyLanguage(button.dataset.language)));
    applyLanguage(localStorage.getItem("bizkaia-language") || "es");
}



document.addEventListener('DOMContentLoaded', () => {
  const itemsLista = document.querySelectorAll('.lista-comarcas li');

  itemsLista.forEach(itemLista => {
    const idComarca = itemLista.dataset.comarca;
    //buscar elemento por su ID dentro del SVG
    const elementoMapa = document.getElementById(idComarca);

    if (!elementoMapa) return;

    //activar
    const activar = () => {
      itemLista.classList.add('activo');
      elementoMapa.classList.add('activo');
    };

    //desactivar
    const desactivar = () => {
      itemLista.classList.remove('activo');
      elementoMapa.classList.remove('activo');
    };

    //hover lista
    itemLista.addEventListener('mouseenter', activar);
    itemLista.addEventListener('mouseleave', desactivar);

    //hover mapa
    elementoMapa.addEventListener('mouseenter', activar);
    elementoMapa.addEventListener('mouseleave', desactivar);

    //click en mapa
    elementoMapa.addEventListener('click', (e) => {
      e.preventDefault();
      const enlace = itemLista.querySelector('a');
      if (enlace && enlace.href) {
        window.location.href = enlace.href;
      }
    });
  });
});