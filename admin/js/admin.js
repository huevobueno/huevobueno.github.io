/**
 * ============================================================================
 * ADMIN - Lógica del panel del administrador
 * ============================================================================
 */

// --- Estado global ---
let sesionAdmin         = null;
let periodoDash         = "hoy";
let dashboardData       = null;
let repartidoresData    = null;
let pantallaActual      = "dashboard";
let coloniasDisponibles = [];
let ciudadesDisponibles = [];
let ciudadSeleccionada  = "";
let emprendedoresAdmin  = [];
let periodoGanancias    = "hoy";
let periodoRendimiento  = "mes";
let correoRendimiento   = "";
let periodoHistorial    = "semana";
let correoHistorial     = "";
let correoDetalleActual = "";
let ciudadPreciosActual = "";

// --- Refs DOM generales ---
const headerTitulo    = document.getElementById("header-titulo");
const headerSubtitulo = document.getElementById("header-subtitulo");
const btnRefrescar    = document.getElementById("btn-refrescar");
const btnMenu         = document.getElementById("btn-menu");
const menuDropdown    = document.getElementById("menu-dropdown");
const chipsDashboard  = document.getElementById("chips-dashboard");
const dashContenido   = document.getElementById("dashboard-contenido");
const repContenido    = document.getElementById("repartidores-contenido");

// --- Refs DOM Config ---
const configMenu          = document.getElementById("config-menu");
const configNuevoRep      = document.getElementById("config-nuevo-repartidor");
const configCiudadesVista = document.getElementById("config-ciudades");
const btnVolverConfig1    = document.getElementById("btn-volver-config-1");
const btnVolverConfig2    = document.getElementById("btn-volver-config-2");
const formNuevoRep        = document.getElementById("form-nuevo-repartidor");
const listaCheckboxCols   = document.getElementById("lista-checkbox-colonias");
const listaColonias       = document.getElementById("lista-colonias");
const ciudadesCount       = document.getElementById("ciudades-count");
const chipsCiudades       = document.getElementById("chips-ciudades");
const msgNuevoRep         = document.getElementById("msg-nuevo-repartidor");
const btnAccionRep        = document.getElementById("btn-accion-repartidor");
const selectCiudadRep     = document.getElementById("rep-ciudad");
const selectCiudadColonia = document.getElementById("col-municipio");
const repCamposPersonales = document.getElementById("rep-campos-personales");
const repCiudadLibre      = document.getElementById("rep-ciudad-libre");
const repSeccionColonias  = document.getElementById("rep-seccion-colonias");
const repMensajeSinCols   = document.getElementById("rep-mensaje-sin-colonias");
const repColoniasSub      = document.getElementById("rep-colonias-sub");
const colCiudadLibre      = document.getElementById("col-ciudad-libre");
const btnRegistrarCiudad  = document.getElementById("btn-registrar-ciudad");

// --- Refs DOM Info-box ---
const repInfoIcono  = document.getElementById("rep-info-icono");
const repInfoTitulo = document.getElementById("rep-info-titulo");
const repInfoTexto  = document.getElementById("rep-info-texto");

// --- Refs DOM Modal Colonia ---
const modalColonia      = document.getElementById("modal-colonia");
const btnCerrarModalCol = document.getElementById("btn-cerrar-modal-colonia");
const btnAbrirModalCol  = document.getElementById("btn-abrir-modal-colonia");
const formNuevaColonia  = document.getElementById("form-nueva-colonia");
const btnGuardarColonia = document.getElementById("btn-guardar-colonia");
const msgNuevaColonia   = document.getElementById("msg-nueva-colonia");

// --- Refs DOM Modal Ciudad ---
const modalCiudad      = document.getElementById("modal-ciudad");
const btnCerrarModalCi = document.getElementById("btn-cerrar-modal-ciudad");
const formNuevaCiudad  = document.getElementById("form-nueva-ciudad");
const btnGuardarCiudad = document.getElementById("btn-guardar-ciudad");
const msgNuevaCiudad   = document.getElementById("msg-nueva-ciudad");

// --- Refs DOM Modal Precios ---
const modalPrecios      = document.getElementById("modal-precios");
const btnCerrarModalPr  = document.getElementById("btn-cerrar-modal-precios");
const formEditarPrecios = document.getElementById("form-editar-precios");
const btnGuardarPrecios = document.getElementById("btn-guardar-precios");
const msgEditarPrecios  = document.getElementById("msg-editar-precios");
const preciosTitulo     = document.getElementById("precios-titulo");
const preciosSub        = document.getElementById("precios-sub");

// --- Refs DOM Modal Detalle Feed ---
const modalDetalle       = document.getElementById("modal-detalle");
const btnCerrarModalDet  = document.getElementById("btn-cerrar-modal-detalle");
const modalDetalleCuerpo = document.getElementById("modal-detalle-cuerpo");

// --- Refs DOM Detalle Emprendedor ---
const btnVolverDetalle  = document.getElementById("btn-volver-detalle");
const detalleContenido  = document.getElementById("detalle-contenido");

// ============================================================================
// CONFIG DE PANTALLAS
// ============================================================================
const PANTALLAS = {
  dashboard:               { titulo: "Dashboard",            subtitulo: () => "Resumen de tu negocio" },
  repartidores:            { titulo: "Repartidores",         subtitulo: () => "Tus vendedores y su rendimiento" },
  "detalle-repartidor":    { titulo: "Emprendedor",          subtitulo: () => "Detalle del emprendedor" },
  config:                  { titulo: "Configuración",        subtitulo: () => "Ajustes del sistema" },
  "compras-emprendedor":   { titulo: "Compras emprendedor",  subtitulo: () => "Registra lo que te compran" },
  "compras-granja":        { titulo: "Compras a granja",     subtitulo: () => "Registra tus compras a la granja" },
  gastos:                  { titulo: "Gastos",               subtitulo: () => "Gastos operativos" },
  ganancias:               { titulo: "Ganancias",            subtitulo: () => "Tu resumen y actividad reciente" },
  rendimiento:             { titulo: "Rendimiento",          subtitulo: () => "Desempeño de tus emprendedores" },
  historial:               { titulo: "Historial de pedidos", subtitulo: () => "Pedidos entregados" }
};

// ============================================================================
// HELPERS
// ============================================================================
function formatearMoneda(n) {
  return "$" + (Number(n) || 0).toLocaleString("es-MX");
}

function formatearMonedaConSigno(n) {
  const num = Number(n) || 0;
  const signo = num >= 0 ? "+" : "−";
  return signo + "$" + Math.abs(num).toLocaleString("es-MX");
}

function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function formatearFechaCorta(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================================================
// NAVEGACIÓN
// ============================================================================
function mostrarPantalla(nombre) {
  pantallaActual = nombre;
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("hidden"));

  const seccion = document.getElementById("pantalla-" + nombre);
  if (seccion) seccion.classList.remove("hidden");

  const cfg = PANTALLAS[nombre];
  if (cfg) {
    headerTitulo.textContent = cfg.titulo;
    headerSubtitulo.textContent = cfg.subtitulo();
  }

  document.querySelectorAll(".footer-btn").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.nav === nombre);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// MENÚ DROPDOWN
// ============================================================================
function toggleMenu() {
  if (!menuDropdown) return;
  menuDropdown.classList.toggle("hidden");
}

function cerrarMenu() {
  if (menuDropdown) menuDropdown.classList.add("hidden");
}

if (btnMenu) {
  btnMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });
}

document.addEventListener("click", (e) => {
  if (!menuDropdown || menuDropdown.classList.contains("hidden")) return;
  if (!e.target.closest(".menu-wrapper")) {
    cerrarMenu();
  }
});

if (menuDropdown) {
  menuDropdown.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-item");
    if (!item) return;

    const accion = item.dataset.menu;
    cerrarMenu();

    if (accion === "compras-emprendedor") abrirComprasEmprendedor();
    else if (accion === "compras-granja") abrirComprasGranja();
    else if (accion === "gastos")         abrirGastos();
    else if (accion === "ganancias")      abrirGanancias();
    else if (accion === "rendimiento")    abrirRendimiento();
    else if (accion === "historial")      abrirHistorial();
    else if (accion === "cerrar-sesion") {
      if (!confirm("¿Cerrar sesión?")) return;
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      location.reload();
    }
  });
}

// ============================================================================
// DASHBOARD
// ============================================================================
async function cargarDashboard() {
  dashContenido.innerHTML = `<p class="cargando">Cargando...</p>`;
  try {
    const r = await API.dashboard();
    if (!r.ok) { dashContenido.innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    dashboardData = r;
    renderizarDashboard();
  } catch (err) {
    console.error(err);
    dashContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarDashboard() {
  if (!dashboardData) return;
  const d = dashboardData[periodoDash];
  if (!d) return;

  let html = `
    <div class="card-metricas">
      <div class="metrica"><span class="metrica-valor">${d.pedidos}</span><span class="metrica-label">Pedidos</span></div>
      <div class="metrica"><span class="metrica-valor">${d.carteras}</span><span class="metrica-label">Carteras</span></div>
      <div class="metrica"><span class="metrica-valor">${formatearMoneda(d.cobrado)}</span><span class="metrica-label">Cobrado</span></div>
    </div>
  `;

  const ranking = dashboardData.rankingRepartidores || [];
  if (ranking.length > 0) {
    const maxCarteras = ranking[0].carteras || 1;
    html += `
      <div class="card">
        <p class="card-titulo">🏆 Ranking repartidores (mes)</p>
        <div class="lista-items">
          ${ranking.map((r, i) => {
            const pct = Math.round((r.carteras / maxCarteras) * 100);
            return `
              <div class="item-row">
                <div class="item-pos ${i === 0 ? 'top' : ''}">${i + 1}</div>
                <div class="item-info">
                  <div class="item-nombre">${r.repartidor}</div>
                  <div class="item-detalle">${r.carteras} carteras · ${r.cajas} cajas</div>
                  <div class="barra-track"><div class="barra-fill" style="width: ${pct}%"></div></div>
                </div>
                <div class="item-valor">${formatearMoneda(r.ingresos)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  const colonias = dashboardData.topColonias || [];
  if (colonias.length > 0) {
    const maxIngreso = colonias[0].ingresos || 1;
    html += `
      <div class="card">
        <p class="card-titulo">📍 Top colonias (mes)</p>
        <div class="lista-items">
          ${colonias.map((c, i) => {
            const pct = Math.round((c.ingresos / maxIngreso) * 100);
            return `
              <div class="item-row">
                <div class="item-pos ${i === 0 ? 'top' : ''}">${i + 1}</div>
                <div class="item-info">
                  <div class="item-nombre">${c.colonia}</div>
                  <div class="item-detalle">${c.carteras} carteras · ${c.pedidos} pedido(s)</div>
                  <div class="barra-track"><div class="barra-fill" style="width: ${pct}%"></div></div>
                </div>
                <div class="item-valor">${formatearMoneda(c.ingresos)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  const f = dashboardData.finanzas;
  if (f) {
    const claseBalance = f.gananciaBruta >= 0 ? "positivo" : "negativo";
    html += `
      <div class="card">
        <p class="card-titulo">💰 Finanzas del mes</p>
        <div class="card-valor">${formatearMoneda(f.ingresos)}</div>
        <p class="card-sub">Ingresos por ventas</p>
        <div class="finanzas-grid">
          <div class="finanzas-row"><span class="label">Compras a granja</span><span class="valor">-${formatearMoneda(f.comprasGranja)}</span></div>
          <div class="finanzas-row"><span class="label">Gastos operativos</span><span class="valor">-${formatearMoneda(f.gastos)}</span></div>
          <div class="finanzas-row ${claseBalance}"><span class="label"><strong>Balance</strong></span><span class="valor"><strong>${formatearMoneda(f.gananciaBruta)}</strong></span></div>
        </div>
      </div>
    `;
  }

  dashContenido.innerHTML = html;
}

function cambiarPeriodoDashboard(periodo) {
  periodoDash = periodo;
  chipsDashboard.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === periodo);
  });
  renderizarDashboard();
}

// ============================================================================
// REPARTIDORES
// ============================================================================
async function cargarRepartidores() {
  repContenido.innerHTML = `<p class="cargando">Cargando...</p>`;
  try {
    const r = await API.repartidores();
    if (!r.ok) { repContenido.innerHTML = `<p class="vacio">Error: ${r.error}</p>`; return; }
    repartidoresData = r;
    renderizarRepartidores();
  } catch (err) {
    console.error(err);
    repContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarRepartidores() {
  const repartidores = (repartidoresData && repartidoresData.repartidores) || [];
  if (!repartidores.length) {
    repContenido.innerHTML = `<p class="vacio">No hay repartidores registrados.</p>`;
    return;
  }

  repContenido.innerHTML = repartidores.map(r => {
    const inicial = (r.nombre || "?").charAt(0).toUpperCase();
    const ciudades = r.ciudades || [r.ciudadPrincipal || "Sin ciudad"];
    return `
      <div class="rep-card rep-card-clickable" data-correo="${r.correo}">
        <div class="rep-header">
          <div class="rep-avatar">${inicial}</div>
          <div class="rep-info">
            <div class="rep-nombre">${r.nombre}</div>
            <div class="rep-correo">${r.correo}</div>
            <div class="rep-ciudades">
              ${ciudades.map(c => `<span class="rep-ciudad-tag">${c}</span>`).join("")}
            </div>
          </div>
          <span class="rep-estado">${r.estado}</span>
        </div>
        <div class="rep-stats">
          <div class="rep-stat"><span class="rep-stat-valor">${r.colonias}</span><span class="rep-stat-label">Colonias</span></div>
          <div class="rep-stat"><span class="rep-stat-valor">${r.cajasMes}</span><span class="rep-stat-label">Cajas mes</span></div>
          <div class="rep-stat"><span class="rep-stat-valor">${formatearMoneda(r.ingresosMes)}</span><span class="rep-stat-label">Ingresos</span></div>
        </div>
      </div>
    `;
  }).join("");

  repContenido.querySelectorAll(".rep-card-clickable").forEach(card => {
    card.addEventListener("click", () => abrirDetalleRepartidor(card.dataset.correo));
  });
}

// ============================================================================
// CARGAR COLONIAS / CIUDADES / EMPRENDEDORES
// ============================================================================
async function cargarColoniasAdmin() {
  try {
    const r = await API.coloniasAdmin();
    coloniasDisponibles = (r.ok && r.colonias) ? r.colonias : [];
  } catch (err) {
    console.error(err);
    coloniasDisponibles = [];
  }
}

async function cargarCiudadesAdmin() {
  try {
    const r = await API.obtenerCiudades();
    ciudadesDisponibles = (r.ok && r.ciudades) ? r.ciudades : [];
  } catch (err) {
    console.error(err);
    ciudadesDisponibles = [];
  }
}

async function cargarEmprendedoresAdmin() {
  try {
    const r = await API.repartidores();
    emprendedoresAdmin = (r.ok && r.repartidores) ? r.repartidores : [];
  } catch (err) {
    console.error(err);
    emprendedoresAdmin = [];
  }
}

function poblarSelectCiudades(selectId, incluirOtra) {
  const select = document.getElementById(selectId);
  if (!select) return;

  let html = `<option value="">Selecciona una ciudad</option>`;
  ciudadesDisponibles.forEach(c => {
    html += `<option value="${c.municipio}">${c.municipio}</option>`;
  });
  if (incluirOtra) {
    html += `<option value="__OTRA__">Otra (escribir ciudad)</option>`;
  }
  select.innerHTML = html;
}

// ============================================================================
// VISTA: CIUDADES
// ============================================================================
function renderizarChipsCiudades() {
  if (!chipsCiudades) return;

  let html = `<button class="chip ${ciudadSeleccionada === "" ? 'activo' : ''}" data-ciudad="">Todas</button>`;
  html += ciudadesDisponibles.map(c =>
    `<button class="chip ${ciudadSeleccionada === c.municipio ? 'activo' : ''}" data-ciudad="${c.municipio}">${c.municipio}</button>`
  ).join("");

  chipsCiudades.className = "chips";
  chipsCiudades.innerHTML = html;
}

function renderizarListaColonias() {
  let filtradas = coloniasDisponibles;
  if (ciudadSeleccionada) {
    filtradas = coloniasDisponibles.filter(c => c.municipio === ciudadSeleccionada);
  }

  const tituloCiudad = ciudadSeleccionada || "Todas las ciudades";
  ciudadesCount.textContent = `${filtradas.length} colonia(s) en ${tituloCiudad}`;

  if (!filtradas.length) {
    listaColonias.innerHTML = `<p class="vacio">No hay colonias registradas${ciudadSeleccionada ? " en " + ciudadSeleccionada : ""}.</p>`;
    return;
  }

  // Botón de engrane solo si hay ciudad seleccionada
  let botonPrecios = "";
  if (ciudadSeleccionada) {
    const ciudadData = ciudadesDisponibles.find(c => c.municipio === ciudadSeleccionada);
    const precios = ciudadData ? ` · ⚪ $${ciudadData.precioBlanco} · 🔴 $${ciudadData.precioRojo}` : "";
    botonPrecios = `
      <div class="ciudad-precios-header">
        <span class="ciudad-precios-texto">Precios de ${ciudadSeleccionada}${precios}</span>
        <button class="btn-engrane" id="btn-editar-precios-ciudad" title="Editar precios">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    `;
  }

  listaColonias.innerHTML = botonPrecios + filtradas.map(c => `
    <div class="colonia-card">
      <div class="colonia-info">
        <div class="colonia-nombre">${c.colonia}</div>
        <div class="colonia-detalle">${c.municipio} · ${c.diaEntrega || "Sin día"} · ⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</div>
      </div>
      <span class="colonia-rep">${c.repartidorActual || "Sin asignar"}</span>
    </div>
  `).join("");

  const btnEngrane = document.getElementById("btn-editar-precios-ciudad");
  if (btnEngrane) {
    btnEngrane.addEventListener("click", () => abrirModalPrecios(ciudadSeleccionada));
  }
}

function seleccionarCiudad(ciudad) {
  ciudadSeleccionada = ciudad;
  renderizarChipsCiudades();
  renderizarListaColonias();
}

// ============================================================================
// MODAL: REGISTRAR CIUDAD
// ============================================================================
function abrirModalCiudad() {
  if (!modalCiudad) return;
  modalCiudad.classList.remove("hidden");
  document.getElementById("ci-municipio").value = "";
  document.getElementById("ci-precio-blanco").value = "70";
  document.getElementById("ci-precio-rojo").value = "95";
  document.getElementById("ci-colonia").value = "";
  document.getElementById("ci-cp").value = "";
  msgNuevaCiudad.textContent = "";
}

function cerrarModalCiudad() {
  if (modalCiudad) modalCiudad.classList.add("hidden");
}

if (btnRegistrarCiudad) btnRegistrarCiudad.addEventListener("click", abrirModalCiudad);
if (btnCerrarModalCi)  btnCerrarModalCi.addEventListener("click", cerrarModalCiudad);

if (modalCiudad) {
  modalCiudad.addEventListener("click", (e) => {
    if (e.target === modalCiudad) cerrarModalCiudad();
  });
}

if (formNuevaCiudad) {
  formNuevaCiudad.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgNuevaCiudad.textContent = "";

    const data = {
      municipio: document.getElementById("ci-municipio").value.trim(),
      precioBlanco: Number(document.getElementById("ci-precio-blanco").value) || 0,
      precioRojo: Number(document.getElementById("ci-precio-rojo").value) || 0,
      colonia: document.getElementById("ci-colonia").value.trim(),
      codigoPostal: document.getElementById("ci-cp").value.trim()
    };

    if (!data.municipio)   { msgNuevaCiudad.textContent = "Escribe el municipio."; return; }
    if (data.precioBlanco <= 0) { msgNuevaCiudad.textContent = "Precio blanco inválido."; return; }
    if (data.precioRojo <= 0)   { msgNuevaCiudad.textContent = "Precio rojo inválido."; return; }
    if (!data.colonia)     { msgNuevaCiudad.textContent = "Escribe la primera colonia."; return; }

    btnGuardarCiudad.disabled = true;
    const txt = btnGuardarCiudad.textContent;
    btnGuardarCiudad.textContent = "Guardando...";

    try {
      const r = await API.registrarCiudad(data);
      if (!r.ok) { msgNuevaCiudad.textContent = r.error || "No se pudo guardar."; return; }

      alert("✅ " + r.mensaje);
      cerrarModalCiudad();

      await cargarCiudadesAdmin();
      await cargarColoniasAdmin();
      renderizarChipsCiudades();
      renderizarListaColonias();
    } catch (err) {
      console.error(err);
      msgNuevaCiudad.textContent = "Error de conexión.";
    } finally {
      btnGuardarCiudad.disabled = false;
      btnGuardarCiudad.textContent = txt;
    }
  });
}

// ============================================================================
// MODAL: EDITAR PRECIOS DE CIUDAD
// ============================================================================
function abrirModalPrecios(municipio) {
  if (!modalPrecios || !municipio) return;

  ciudadPreciosActual = municipio;

  const ciudadData = ciudadesDisponibles.find(c => c.municipio === municipio);
  const precioB = ciudadData ? ciudadData.precioBlanco : 0;
  const precioR = ciudadData ? ciudadData.precioRojo : 0;

  preciosTitulo.textContent = "Editar precios · " + municipio;
  preciosSub.textContent = "Actualiza el precio global de " + municipio + ".";
  document.getElementById("pr-precio-blanco").value = precioB;
  document.getElementById("pr-precio-rojo").value = precioR;
  msgEditarPrecios.textContent = "";

  modalPrecios.classList.remove("hidden");
}

function cerrarModalPrecios() {
  if (modalPrecios) modalPrecios.classList.add("hidden");
  ciudadPreciosActual = "";
}

if (btnCerrarModalPr) btnCerrarModalPr.addEventListener("click", cerrarModalPrecios);

if (modalPrecios) {
  modalPrecios.addEventListener("click", (e) => {
    if (e.target === modalPrecios) cerrarModalPrecios();
  });
}

if (formEditarPrecios) {
  formEditarPrecios.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEditarPrecios.textContent = "";

    const precioBlanco = Number(document.getElementById("pr-precio-blanco").value) || 0;
    const precioRojo   = Number(document.getElementById("pr-precio-rojo").value) || 0;

    if (precioBlanco <= 0 || precioRojo <= 0) {
      msgEditarPrecios.textContent = "Precios inválidos.";
      return;
    }

    btnGuardarPrecios.disabled = true;
    const txt = btnGuardarPrecios.textContent;
    btnGuardarPrecios.textContent = "Guardando...";

    try {
      const r = await API.editarPreciosCiudad(ciudadPreciosActual, { precioBlanco, precioRojo });
      if (!r.ok) { msgEditarPrecios.textContent = r.error || "No se pudo guardar."; return; }

      alert("✅ " + r.mensaje);
      cerrarModalPrecios();

      await cargarCiudadesAdmin();
      await cargarColoniasAdmin();
      renderizarListaColonias();
    } catch (err) {
      console.error(err);
      msgEditarPrecios.textContent = "Error de conexión.";
    } finally {
      btnGuardarPrecios.disabled = false;
      btnGuardarPrecios.textContent = txt;
    }
  });
}

// ============================================================================
// FORM: NUEVO REPARTIDOR
// ============================================================================
function resetearFormNuevoRep() {
  formNuevoRep.reset();
  if (msgNuevoRep) msgNuevoRep.textContent = "";

  repCamposPersonales.classList.add("hidden");
  repSeccionColonias.classList.add("hidden");
  repMensajeSinCols.classList.add("hidden");

  btnAccionRep.textContent = "Completa los datos";
  btnAccionRep.classList.add("disabled");
}

function renderizarCheckboxColonias(ciudad) {
  const todas = coloniasDisponibles.filter(c => c.municipio === ciudad);

  if (!todas.length) {
    listaCheckboxCols.innerHTML = `<p class="vacio" style="padding:16px;text-align:center;font-size:12px;">No hay colonias registradas.</p>`;
    return;
  }

  listaCheckboxCols.innerHTML = todas.map((c) => {
    const realIdx = coloniasDisponibles.indexOf(c);
    const dueño = (c.repartidorActual || "").trim();
    const tagDueño = dueño
      ? `<span class="checkbox-item-actual">🏷️ ${dueño}</span>`
      : `<span class="checkbox-item-actual libre">Libre</span>`;

    return `
      <div class="checkbox-item-wrap">
        <label class="checkbox-item">
          <input type="checkbox" class="checkbox-colonia" value="${realIdx}">
          <div class="checkbox-item-info">
            <div class="checkbox-item-nombre">${c.colonia}</div>
            <div class="checkbox-item-detalle">${c.diaEntrega || "Sin día"} · ⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</div>
          </div>
          ${tagDueño}
        </label>
        <div class="checkbox-item-dia hidden" data-dia-idx="${realIdx}">
          <label class="campo">
            <span>Día de entrega (opcional)</span>
            <input type="text" class="input-dia-colonia" placeholder="Ej. miércoles">
          </label>
        </div>
      </div>
    `;
  }).join("");

  // Listener: mostrar/ocultar input de día al marcar/desmarcar
  listaCheckboxCols.querySelectorAll(".checkbox-colonia").forEach(cb => {
    cb.addEventListener("change", () => {
      const wrap = cb.closest(".checkbox-item-wrap");
      const diaDiv = wrap.querySelector(".checkbox-item-dia");
      if (cb.checked) diaDiv.classList.remove("hidden");
      else diaDiv.classList.add("hidden");
    });
  });
}

async function manejarCambioCiudadRep() {
  const val = selectCiudadRep.value;

  repCamposPersonales.classList.add("hidden");
  repSeccionColonias.classList.add("hidden");
  repMensajeSinCols.classList.add("hidden");
  if (msgNuevoRep) msgNuevoRep.textContent = "";

  if (!val) {
    btnAccionRep.textContent = "Completa los datos";
    btnAccionRep.classList.add("disabled");
    return;
  }

  repCamposPersonales.classList.remove("hidden");

  await cargarColoniasAdmin();

  const coloniasDeCiudad = coloniasDisponibles.filter(c => c.municipio === val);

  if (coloniasDeCiudad.length > 0) {
    repSeccionColonias.classList.remove("hidden");
    repColoniasSub.textContent = `${coloniasDeCiudad.length} colonia(s) en ${val}. Selecciona las que le asignarás.`;
    renderizarCheckboxColonias(val);
    btnAccionRep.textContent = "Asignar colonias al repartidor";
    btnAccionRep.classList.remove("disabled");
    return;
  }

  if (repInfoIcono) repInfoIcono.textContent = "📭";
  if (repInfoTitulo) repInfoTitulo.textContent = "Aún no repartimos en esta ciudad";
  if (repInfoTexto) repInfoTexto.textContent = "Registra los datos del interesado y le avisaremos cuando abramos ruta.";
  repMensajeSinCols.classList.remove("hidden");
  btnAccionRep.textContent = "Guardar en lista de espera";
  btnAccionRep.classList.remove("disabled");
}

if (selectCiudadRep) {
  selectCiudadRep.addEventListener("change", manejarCambioCiudadRep);
}

if (formNuevoRep) {
  formNuevoRep.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msgNuevoRep) msgNuevoRep.textContent = "";

    const val = selectCiudadRep.value;
    const nombre   = document.getElementById("rep-nombre").value.trim();
    const correo   = document.getElementById("rep-correo").value.trim();
    const password = document.getElementById("rep-password").value.trim();
    const whatsapp = document.getElementById("rep-whatsapp").value.trim();

    if (!nombre || !correo || !password || !whatsapp) {
      if (msgNuevoRep) msgNuevoRep.textContent = "Completa todos los datos personales.";
      return;
    }
    if (password.length < 6) {
      if (msgNuevoRep) msgNuevoRep.textContent = "Contraseña: mínimo 6 caracteres.";
      return;
    }

    const coloniasDeCiudad = coloniasDisponibles.filter(c => c.municipio === val);

    if (coloniasDeCiudad.length === 0) {
      const coloniaEspera = document.getElementById("rep-colonia-espera").value.trim();
      await enviarProspecto({ nombre, correo, password, whatsapp, ciudad: val, colonia: coloniaEspera });
      return;
    }

    const checkboxes = listaCheckboxCols.querySelectorAll("input.checkbox-colonia:checked");
    const coloniasSeleccionadas = [];

    checkboxes.forEach(cb => {
      const c = coloniasDisponibles[Number(cb.value)];
      if (c) {
        const wrap = cb.closest(".checkbox-item-wrap");
        const inputDia = wrap.querySelector(".input-dia-colonia");
        const dia = inputDia ? inputDia.value.trim() : "";

        coloniasSeleccionadas.push({
          municipio: c.municipio,
          colonia: c.colonia,
          codigoPostal: c.codigoPostal,
          diaEntrega: dia,
          precioBlanco: c.precioBlanco,
          precioRojo: c.precioRojo
        });
      }
    });

    if (coloniasSeleccionadas.length === 0) {
      if (msgNuevoRep) msgNuevoRep.textContent = "Selecciona al menos una colonia.";
      return;
    }

    const reasignaciones = coloniasSeleccionadas.filter(c => {
      const orig = coloniasDisponibles.find(x => x.municipio === c.municipio && x.colonia === c.colonia);
      return orig && (orig.repartidorActual || "").trim() !== "";
    });

    if (reasignaciones.length > 0) {
      const msgConfirma = "Vas a reasignar " + reasignaciones.length + " colonia(s) que hoy tienen repartidor. ¿Confirmas?";
      if (!confirm(msgConfirma)) return;
    }

    btnAccionRep.disabled = true;
    const textoOriginal = btnAccionRep.textContent;
    btnAccionRep.textContent = "Asignando...";

    try {
      const r = await API.crearRepartidor({
        nombre, correo, password, whatsapp,
        colonias: coloniasSeleccionadas
      });

      if (!r.ok) {
        if (msgNuevoRep) msgNuevoRep.textContent = r.error || "No se pudo crear.";
        return;
      }

      alert("✅ " + r.mensaje);
      resetearFormNuevoRep();
      volverMenuConfig();
    } catch (err) {
      console.error(err);
      if (msgNuevoRep) msgNuevoRep.textContent = "Error de conexión.";
    } finally {
      btnAccionRep.disabled = false;
      btnAccionRep.textContent = textoOriginal;
    }
  });
}

async function enviarProspecto(data) {
  btnAccionRep.disabled = true;
  const textoOriginal = btnAccionRep.textContent;
  btnAccionRep.textContent = "Guardando...";

  try {
    const r = await API.registrarProspecto(data);

    if (!r.ok) {
      if (msgNuevoRep) msgNuevoRep.textContent = r.error || "No se pudo guardar.";
      return;
    }

    alert("✅ " + r.mensaje);
    resetearFormNuevoRep();
    volverMenuConfig();
  } catch (err) {
    console.error(err);
    if (msgNuevoRep) msgNuevoRep.textContent = "Error de conexión.";
  } finally {
    btnAccionRep.disabled = false;
    btnAccionRep.textContent = textoOriginal;
  }
}

// ============================================================================
// MODAL NUEVA COLONIA (agregar colonia a ciudad existente)
// ============================================================================
function abrirModalColonia() {
  if (!modalColonia) return;
  poblarSelectCiudades("col-municipio", false);
  document.getElementById("col-nombre").value = "";
  document.getElementById("col-cp").value = "";
  document.getElementById("col-dia").value = "";
  msgNuevaColonia.textContent = "";
  modalColonia.classList.remove("hidden");
}

function cerrarModalColonia() {
  if (modalColonia) modalColonia.classList.add("hidden");
}

if (btnAbrirModalCol) btnAbrirModalCol.addEventListener("click", abrirModalColonia);
if (btnCerrarModalCol) btnCerrarModalCol.addEventListener("click", cerrarModalColonia);

if (modalColonia) {
  modalColonia.addEventListener("click", (e) => {
    if (e.target === modalColonia) cerrarModalColonia();
  });
}

if (formNuevaColonia) {
  formNuevaColonia.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msgNuevaColonia) msgNuevaColonia.textContent = "";

    const municipio = selectCiudadColonia.value;
    const colonia   = document.getElementById("col-nombre").value.trim();
    const cp        = document.getElementById("col-cp").value.trim();
    const dia       = document.getElementById("col-dia").value.trim();

    if (!municipio) { if (msgNuevaColonia) msgNuevaColonia.textContent = "Selecciona una ciudad."; return; }
    if (!colonia)   { if (msgNuevaColonia) msgNuevaColonia.textContent = "Falta el nombre."; return; }

    btnGuardarColonia.disabled = true;
    btnGuardarColonia.textContent = "Guardando...";
    try {
      const r = await API.crearColonia({
        municipio: municipio,
        colonia: colonia,
        codigoPostal: cp,
        diaEntrega: dia
      });

      if (!r.ok) {
        if (msgNuevaColonia) msgNuevaColonia.textContent = r.error || "No se pudo crear.";
        return;
      }

      alert("✅ " + r.mensaje);
      await cargarColoniasAdmin();

      if (!configNuevoRep.classList.contains("hidden") && selectCiudadRep.value) {
        renderizarCheckboxColonias(selectCiudadRep.value);
      }
      if (!configCiudadesVista.classList.contains("hidden")) {
        renderizarChipsCiudades();
        renderizarListaColonias();
      }
      cerrarModalColonia();
    } catch (err) {
      if (msgNuevaColonia) msgNuevaColonia.textContent = "Error de conexión.";
    } finally {
      btnGuardarColonia.disabled = false;
      btnGuardarColonia.textContent = "Guardar colonia";
    }
  });
}

// ============================================================================
// MENÚ CONFIG
// ============================================================================
function volverMenuConfig() {
  configMenu.classList.remove("hidden");
  configNuevoRep.classList.add("hidden");
  configCiudadesVista.classList.add("hidden");
  if (msgNuevoRep) msgNuevoRep.textContent = "";
  resetearFormNuevoRep();
}

// ============================================================================
// DETALLE EMPRENDEDOR
// ============================================================================
async function abrirDetalleRepartidor(correo) {
  correoDetalleActual = correo;
  mostrarPantalla("detalle-repartidor");
  detalleContenido.innerHTML = `<p class="cargando">Cargando...</p>`;

  try {
    const r = await API.obtenerDetalleRepartidor(correo);
    if (!r.ok) { detalleContenido.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }
    renderizarDetalle(r);
  } catch (err) {
    console.error(err);
    detalleContenido.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderizarDetalle(r) {
  const rep = r.repartidor || {};
  const inicial = (rep.nombre || "?").charAt(0).toUpperCase();
  const colonias = r.colonias || [];
  const compras = r.compras || [];

  let html = `
    <div class="detalle-header">
      <div class="detalle-avatar">${inicial}</div>
      <div class="detalle-header-info">
        <div class="detalle-nombre">${rep.nombre}</div>
        <div class="detalle-correo">${rep.correo}</div>
        <div class="detalle-ciudad">${rep.ciudadPrincipal || "—"} · ${rep.estado}</div>
      </div>
    </div>

    <div class="config-form">
      <div class="config-seccion-titulo">Datos</div>

      <label class="campo">
        <span>Nombre completo</span>
        <input type="text" id="det-nombre" value="${rep.nombre || ""}">
      </label>

      <label class="campo">
        <span>Correo electrónico (no editable)</span>
        <input type="email" value="${rep.correo || ""}" disabled style="background:#F3F4F6;color:#6B7280;">
      </label>

      <label class="campo">
        <span>Contraseña</span>
        <input type="text" id="det-password" value="${rep.password || ""}">
      </label>

      <label class="campo">
        <span>WhatsApp</span>
        <input type="tel" id="det-whatsapp" value="${rep.whatsapp || ""}">
      </label>

      <label class="campo">
        <span>Estado</span>
        <select id="det-estado">
          <option value="Activado" ${rep.estado === "Activado" ? "selected" : ""}>Activado</option>
          <option value="Pausado" ${rep.estado === "Pausado" ? "selected" : ""}>Pausado</option>
        </select>
      </label>

      <button type="button" id="btn-guardar-datos" class="btn-primario">Guardar cambios</button>
      <p id="msg-guardar-datos" class="login-error"></p>
    </div>

    <div class="config-form">
      <div class="config-seccion-titulo">Colonias asignadas (${colonias.length})</div>
      <div class="lista-colonias-detalle">
        ${colonias.length === 0 ? `<p class="vacio">Sin colonias asignadas.</p>` :
          colonias.map(c => `
            <div class="colonia-detalle-card" data-municipio="${c.municipio}" data-colonia="${c.colonia}">
              <div class="colonia-detalle-info">
                <div class="colonia-detalle-nombre">${c.colonia}</div>
                <div class="colonia-detalle-meta">${c.municipio} · ${c.diaEntrega || "Sin día"} · ⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</div>
              </div>
              <div class="colonia-detalle-acciones">
                <button class="btn-mini btn-mini-dia" data-accion="dia">Día</button>
                <button class="btn-mini btn-mini-quitar" data-accion="quitar">Quitar</button>
              </div>
            </div>
          `).join("")
        }
      </div>
      <button type="button" id="btn-agregar-colonia-detalle" class="btn-secundario-config">+ Agregar colonia</button>
    </div>

    <div class="config-form">
      <div class="config-seccion-titulo">Últimas compras</div>
      ${compras.length === 0 ? `<p class="vacio">Sin compras registradas.</p>` :
        compras.map(c => `
          <div class="compra-card">
            <div class="compra-card-info">
              <div class="compra-card-titulo">${formatearFechaCorta(c.fecha)}</div>
              <div class="compra-card-detalle">${c.cajasBlancas} blanca(s) · ${c.cajasRojas} roja(s)</div>
              ${c.notas ? `<div class="compra-card-notas">"${c.notas}"</div>` : ""}
            </div>
            <div class="compra-card-montos">
              <div class="compra-card-total">${formatearMoneda(c.total)}</div>
              ${c.saldo > 0 ? `<div class="compra-card-saldo">Debe ${formatearMoneda(c.saldo)}</div>` : `<div class="compra-card-pagado">Pagado</div>`}
            </div>
          </div>
        `).join("")
      }
    </div>
  `;

  detalleContenido.innerHTML = html;

  // Guardar cambios
  const btnGuardarDatos = document.getElementById("btn-guardar-datos");
  if (btnGuardarDatos) {
    btnGuardarDatos.addEventListener("click", guardarDatosDetalle);
  }

  // Agregar colonia
  const btnAgregarColonia = document.getElementById("btn-agregar-colonia-detalle");
  if (btnAgregarColonia) {
    btnAgregarColonia.addEventListener("click", mostrarFormAgregarColonia);
  }

  // Botones de cada colonia
  detalleContenido.querySelectorAll(".colonia-detalle-card").forEach(card => {
    const municipio = card.dataset.municipio;
    const colonia = card.dataset.colonia;

    card.querySelectorAll(".btn-mini").forEach(btn => {
      btn.addEventListener("click", () => {
        const accion = btn.dataset.accion;
        if (accion === "quitar") quitarColoniaDetalle(municipio, colonia);
        else if (accion === "dia") editarDiaColoniaDetalle(municipio, colonia);
      });
    });
  });
}

async function guardarDatosDetalle() {
  const msg = document.getElementById("msg-guardar-datos");
  msg.textContent = "";

  const cambios = {
    nombre: document.getElementById("det-nombre").value.trim(),
    password: document.getElementById("det-password").value.trim(),
    whatsapp: document.getElementById("det-whatsapp").value.trim(),
    estado: document.getElementById("det-estado").value
  };

  if (!cambios.nombre)   { msg.textContent = "El nombre es obligatorio."; return; }
  if (!cambios.password) { msg.textContent = "La contraseña es obligatoria."; return; }
  if (!cambios.whatsapp) { msg.textContent = "El WhatsApp es obligatorio."; return; }

  const btn = document.getElementById("btn-guardar-datos");
  btn.disabled = true;
  const txt = btn.textContent;
  btn.textContent = "Guardando...";

  try {
    const r = await API.editarRepartidor(correoDetalleActual, cambios);
    if (!r.ok) { msg.textContent = r.error || "No se pudo guardar."; return; }
    alert("✅ Cambios guardados.");
  } catch (err) {
    console.error(err);
    msg.textContent = "Error de conexión.";
  } finally {
    btn.disabled = false;
    btn.textContent = txt;
  }
}

async function quitarColoniaDetalle(municipio, colonia) {
  if (!confirm(`¿Quitar "${colonia}" de ${municipio}? Quedará libre para otro emprendedor.`)) return;

  try {
    const r = await API.quitarColonia(correoDetalleActual, { municipio, colonia });
    if (!r.ok) { alert(r.error || "No se pudo quitar."); return; }
    alert("✅ Colonia liberada.");
    abrirDetalleRepartidor(correoDetalleActual);
  } catch (err) {
    console.error(err);
    alert("Error de conexión.");
  }
}

async function editarDiaColoniaDetalle(municipio, colonia) {
  const nuevoDia = prompt(`Día de entrega para "${colonia}" (deja vacío para quitarlo):`);
  if (nuevoDia === null) return;

  try {
    const r = await API.actualizarDiaColonia(correoDetalleActual, { municipio, colonia }, nuevoDia.trim());
    if (!r.ok) { alert(r.error || "No se pudo actualizar."); return; }
    abrirDetalleRepartidor(correoDetalleActual);
  } catch (err) {
    console.error(err);
    alert("Error de conexión.");
  }
}

async function mostrarFormAgregarColonia() {
  await cargarColoniasAdmin();
  const rep = (repartidoresData && repartidoresData.repartidores || []).find(r => r.correo === correoDetalleActual);
  const ciudadRep = rep ? rep.ciudadPrincipal : "";

  const libres = coloniasDisponibles.filter(c =>
    c.municipio === ciudadRep && !(c.repartidorActual || "").trim()
  );

  if (libres.length === 0) {
    alert("No hay colonias libres en " + ciudadRep + " para asignar.");
    return;
  }

  const lista = libres.map(c => `${c.colonia} (${c.municipio})`).join("\n");
  const seleccion = prompt("Colonias libres en " + ciudadRep + ":\n\n" + lista + "\n\nEscribe el nombre EXACTO de la colonia que quieres asignar:");

  if (!seleccion) return;

  const elegida = libres.find(c => c.colonia.toLowerCase() === seleccion.trim().toLowerCase());
  if (!elegida) { alert("No se encontró esa colonia."); return; }

  try {
    const r = await API.asignarColonia(correoDetalleActual, { municipio: elegida.municipio, colonia: elegida.colonia });
    if (!r.ok) { alert(r.error || "No se pudo asignar."); return; }
    alert("✅ Colonia asignada.");
    abrirDetalleRepartidor(correoDetalleActual);
  } catch (err) {
    console.error(err);
    alert("Error de conexión.");
  }
}

if (btnVolverDetalle) {
  btnVolverDetalle.addEventListener("click", () => {
    mostrarPantalla("repartidores");
    cargarRepartidores();
  });
}

// ============================================================================
// COMPRAS EMPRENDEDOR
// ============================================================================
async function abrirComprasEmprendedor() {
  mostrarPantalla("compras-emprendedor");

  const fFecha = document.getElementById("ce-fecha");
  if (fFecha) fFecha.value = hoyISO();

  document.getElementById("ce-cajas-blancas").value = 0;
  document.getElementById("ce-cajas-rojas").value = 0;
  document.getElementById("ce-precio-blanco").value = 0;
  document.getElementById("ce-precio-rojo").value = 0;
  document.getElementById("ce-monto-pagado").value = 0;
  document.getElementById("ce-notas").value = "";
  document.getElementById("msg-compra-emprendedor").textContent = "";

  await cargarEmprendedoresAdmin();
  const select = document.getElementById("ce-emprendedor");
  if (select) {
    select.innerHTML = `<option value="">Selecciona un emprendedor</option>` +
      emprendedoresAdmin.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join("");
  }

  actualizarResumenCompraEmprendedor();
  cargarListaComprasEmprendedor();
}

function actualizarResumenCompraEmprendedor() {
  const cb = Number(document.getElementById("ce-cajas-blancas").value) || 0;
  const cr = Number(document.getElementById("ce-cajas-rojas").value) || 0;
  const pb = Number(document.getElementById("ce-precio-blanco").value) || 0;
  const pr = Number(document.getElementById("ce-precio-rojo").value) || 0;
  const mp = Number(document.getElementById("ce-monto-pagado").value) || 0;

  const total = (cb * pb) + (cr * pr);
  const saldo = total - mp;

  document.getElementById("ce-total").textContent = formatearMoneda(total);
  document.getElementById("ce-saldo").textContent = formatearMoneda(saldo);
}

["ce-cajas-blancas", "ce-cajas-rojas", "ce-precio-blanco", "ce-precio-rojo", "ce-monto-pagado"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", actualizarResumenCompraEmprendedor);
});

const formCompraEmp = document.getElementById("form-compra-emprendedor");
if (formCompraEmp) {
  formCompraEmp.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg-compra-emprendedor");
    msg.textContent = "";

    const data = {
      fecha: document.getElementById("ce-fecha").value,
      emprendedor: document.getElementById("ce-emprendedor").value,
      cajasBlancas: Number(document.getElementById("ce-cajas-blancas").value) || 0,
      cajasRojas: Number(document.getElementById("ce-cajas-rojas").value) || 0,
      precioVentaBlanco: Number(document.getElementById("ce-precio-blanco").value) || 0,
      precioVentaRojo: Number(document.getElementById("ce-precio-rojo").value) || 0,
      montoPagado: Number(document.getElementById("ce-monto-pagado").value) || 0,
      notas: document.getElementById("ce-notas").value.trim()
    };

    if (!data.fecha)      { msg.textContent = "Selecciona una fecha."; return; }
    if (!data.emprendedor){ msg.textContent = "Selecciona un emprendedor."; return; }
    if (data.cajasBlancas <= 0 && data.cajasRojas <= 0) {
      msg.textContent = "Registra al menos una caja."; return;
    }

    const btn = document.getElementById("btn-guardar-compra-emprendedor");
    btn.disabled = true;
    const txtOriginal = btn.textContent;
    btn.textContent = "Guardando...";

    try {
      const r = await API.guardarCompraEmprendedor(data);
      if (!r.ok) { msg.textContent = r.error || "No se pudo guardar."; return; }

      alert("✅ Compra registrada. Total: " + formatearMoneda(r.total) + " · Saldo: " + formatearMoneda(r.saldo));
      abrirComprasEmprendedor();
    } catch (err) {
      console.error(err);
      msg.textContent = "Error de conexión.";
    } finally {
      btn.disabled = false;
      btn.textContent = txtOriginal;
    }
  });
}

async function cargarListaComprasEmprendedor() {
  const cont = document.getElementById("lista-compras-emprendedor");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando compras...</p>`;

  try {
    const r = await API.listarComprasEmprendedor(20);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const compras = r.compras || [];
    if (!compras.length) { cont.innerHTML = `<p class="vacio">Aún no hay compras.</p>`; return; }

    cont.innerHTML = compras.map(c => `
      <div class="compra-card">
        <div class="compra-card-info">
          <div class="compra-card-titulo">${c.emprendedor}</div>
          <div class="compra-card-detalle">
            ${formatearFechaCorta(c.fecha)} · ${c.cajasBlancas} blanca(s) · ${c.cajasRojas} roja(s)
          </div>
          ${c.notas ? `<div class="compra-card-notas">"${c.notas}"</div>` : ""}
        </div>
        <div class="compra-card-montos">
          <div class="compra-card-total">${formatearMoneda(c.total)}</div>
          ${c.saldo > 0 ? `<div class="compra-card-saldo">Debe ${formatearMoneda(c.saldo)}</div>` : `<div class="compra-card-pagado">Pagado</div>`}
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

const btnVolverCE = document.getElementById("btn-volver-compras-emprendedor");
if (btnVolverCE) btnVolverCE.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// COMPRAS GRANJA
// ============================================================================
function abrirComprasGranja() {
  mostrarPantalla("compras-granja");

  const fFecha = document.getElementById("cg-fecha");
  if (fFecha) fFecha.value = hoyISO();

  document.getElementById("cg-proveedor").value = "";
  document.getElementById("cg-cajas-blancas").value = 0;
  document.getElementById("cg-cajas-rojas").value = 0;
  document.getElementById("cg-precio-blanco").value = 0;
  document.getElementById("cg-precio-rojo").value = 0;
  document.getElementById("cg-monto-pagado").value = 0;
  document.getElementById("cg-notas").value = "";
  document.getElementById("msg-compra-granja").textContent = "";

  actualizarResumenCompraGranja();
  cargarListaComprasGranja();
}

function actualizarResumenCompraGranja() {
  const cb = Number(document.getElementById("cg-cajas-blancas").value) || 0;
  const cr = Number(document.getElementById("cg-cajas-rojas").value) || 0;
  const pb = Number(document.getElementById("cg-precio-blanco").value) || 0;
  const pr = Number(document.getElementById("cg-precio-rojo").value) || 0;
  const mp = Number(document.getElementById("cg-monto-pagado").value) || 0;

  const total = (cb * pb) + (cr * pr);
  const saldo = total - mp;

  document.getElementById("cg-total").textContent = formatearMoneda(total);
  document.getElementById("cg-saldo").textContent = formatearMoneda(saldo);
}

["cg-cajas-blancas", "cg-cajas-rojas", "cg-precio-blanco", "cg-precio-rojo", "cg-monto-pagado"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", actualizarResumenCompraGranja);
});

const formCompraGra = document.getElementById("form-compra-granja");
if (formCompraGra) {
  formCompraGra.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg-compra-granja");
    msg.textContent = "";

    const data = {
      fecha: document.getElementById("cg-fecha").value,
      proveedor: document.getElementById("cg-proveedor").value.trim(),
      cajasBlancas: Number(document.getElementById("cg-cajas-blancas").value) || 0,
      cajasRojas: Number(document.getElementById("cg-cajas-rojas").value) || 0,
      precioCompraBlanco: Number(document.getElementById("cg-precio-blanco").value) || 0,
      precioCompraRojo: Number(document.getElementById("cg-precio-rojo").value) || 0,
      montoPagado: Number(document.getElementById("cg-monto-pagado").value) || 0,
      notas: document.getElementById("cg-notas").value.trim()
    };

    if (!data.fecha)     { msg.textContent = "Selecciona una fecha."; return; }
    if (!data.proveedor) { msg.textContent = "Escribe el proveedor."; return; }
    if (data.cajasBlancas <= 0 && data.cajasRojas <= 0) {
      msg.textContent = "Registra al menos una caja."; return;
    }

    const btn = document.getElementById("btn-guardar-compra-granja");
    btn.disabled = true;
    const txtOriginal = btn.textContent;
    btn.textContent = "Guardando...";

    try {
      const r = await API.guardarCompraGranja(data);
      if (!r.ok) { msg.textContent = r.error || "No se pudo guardar."; return; }

      alert("✅ Compra registrada. Total: " + formatearMoneda(r.total) + " · Saldo: " + formatearMoneda(r.saldo));
      abrirComprasGranja();
    } catch (err) {
      console.error(err);
      msg.textContent = "Error de conexión.";
    } finally {
      btn.disabled = false;
      btn.textContent = txtOriginal;
    }
  });
}

async function cargarListaComprasGranja() {
  const cont = document.getElementById("lista-compras-granja");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando compras...</p>`;

  try {
    const r = await API.listarComprasGranja(20);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const compras = r.compras || [];
    if (!compras.length) { cont.innerHTML = `<p class="vacio">Aún no hay compras.</p>`; return; }

    cont.innerHTML = compras.map(c => `
      <div class="compra-card">
        <div class="compra-card-info">
          <div class="compra-card-titulo">${c.proveedor}</div>
          <div class="compra-card-detalle">
            ${formatearFechaCorta(c.fecha)} · ${c.cajasBlancas} blanca(s) · ${c.cajasRojas} roja(s)
          </div>
          ${c.notas ? `<div class="compra-card-notas">"${c.notas}"</div>` : ""}
        </div>
        <div class="compra-card-montos">
          <div class="compra-card-total">${formatearMoneda(c.total)}</div>
          ${c.saldo > 0 ? `<div class="compra-card-saldo">Debe ${formatearMoneda(c.saldo)}</div>` : `<div class="compra-card-pagado">Pagado</div>`}
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

const btnVolverCG = document.getElementById("btn-volver-compras-granja");
if (btnVolverCG) btnVolverCG.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// GASTOS
// ============================================================================
function abrirGastos() {
  mostrarPantalla("gastos");

  const fFecha = document.getElementById("g-fecha");
  if (fFecha) fFecha.value = hoyISO();

  document.getElementById("g-categoria").value = "";
  document.getElementById("g-concepto").value = "";
  document.getElementById("g-monto").value = "";
  document.getElementById("g-notas").value = "";
  document.getElementById("msg-gasto").textContent = "";

  cargarListaGastos();
}

const formGasto = document.getElementById("form-gasto");
if (formGasto) {
  formGasto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg-gasto");
    msg.textContent = "";

    const data = {
      fecha: document.getElementById("g-fecha").value,
      categoria: document.getElementById("g-categoria").value.trim(),
      concepto: document.getElementById("g-concepto").value.trim(),
      monto: Number(document.getElementById("g-monto").value) || 0,
      notas: document.getElementById("g-notas").value.trim()
    };

    if (!data.fecha)      { msg.textContent = "Selecciona una fecha."; return; }
    if (!data.categoria)  { msg.textContent = "Escribe la categoría."; return; }
    if (data.monto <= 0)  { msg.textContent = "El monto debe ser mayor a 0."; return; }

    const btn = document.getElementById("btn-guardar-gasto");
    btn.disabled = true;
    const txtOriginal = btn.textContent;
    btn.textContent = "Guardando...";

    try {
      const r = await API.guardarGasto(data);
      if (!r.ok) { msg.textContent = r.error || "No se pudo guardar."; return; }

      alert("✅ Gasto registrado: " + formatearMoneda(r.monto));
      abrirGastos();
    } catch (err) {
      console.error(err);
      msg.textContent = "Error de conexión.";
    } finally {
      btn.disabled = false;
      btn.textContent = txtOriginal;
    }
  });
}

async function cargarListaGastos() {
  const cont = document.getElementById("lista-gastos");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando gastos...</p>`;

  try {
    const r = await API.listarGastos(20);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const gastos = r.gastos || [];
    if (!gastos.length) { cont.innerHTML = `<p class="vacio">Aún no hay gastos.</p>`; return; }

    cont.innerHTML = gastos.map(g => `
      <div class="compra-card">
        <div class="compra-card-info">
          <div class="compra-card-titulo">${g.categoria}</div>
          <div class="compra-card-detalle">
            ${formatearFechaCorta(g.fecha)}${g.concepto ? " · " + g.concepto : ""}
          </div>
          ${g.notas ? `<div class="compra-card-notas">"${g.notas}"</div>` : ""}
        </div>
        <div class="compra-card-montos">
          <div class="compra-card-total negativo">−${formatearMoneda(g.monto)}</div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

const btnVolverG = document.getElementById("btn-volver-gastos");
if (btnVolverG) btnVolverG.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// GANANCIAS
// ============================================================================
async function abrirGanancias() {
  mostrarPantalla("ganancias");
  periodoGanancias = "hoy";
  document.querySelectorAll("#chips-ganancias .chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === "hoy");
  });

  await cargarGananciasResumen();
  cargarFeed();
}

async function cargarGananciasResumen() {
  const cont = document.getElementById("ganancias-resumen");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando...</p>`;

  try {
    const r = await API.obtenerGanancias();
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const d = r[periodoGanancias];
    if (!d) { cont.innerHTML = `<p class="vacio">Sin datos.</p>`; return; }

    const claseGanancia = d.gananciaNeta >= 0 ? "positivo" : "negativo";

    cont.innerHTML = `
      <div class="card-metricas">
        <div class="metrica"><span class="metrica-valor">${formatearMoneda(d.ingresos)}</span><span class="metrica-label">Ingresos</span></div>
        <div class="metrica"><span class="metrica-valor">${formatearMoneda(d.gastos)}</span><span class="metrica-label">Gastos</span></div>
        <div class="metrica"><span class="metrica-valor">${formatearMoneda(d.comprasGranja)}</span><span class="metrica-label">Granja</span></div>
      </div>
      <div class="card cierre-card-ganancia ${claseGanancia}">
        <p class="card-titulo">GANANCIA NETA</p>
        <div class="card-valor">${formatearMonedaConSigno(d.gananciaNeta)}</div>
        <p class="card-sub">Ingresos − Granja − Gastos</p>
      </div>
    `;

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

async function cargarFeed() {
  const cont = document.getElementById("ganancias-feed");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando actividad...</p>`;

  try {
    const r = await API.obtenerFeed(30);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const items = r.items || [];
    if (!items.length) { cont.innerHTML = `<p class="vacio">Sin actividad.</p>`; return; }

    const grupos = {};
    items.forEach(it => {
      const fecha = it.fecha ? it.fecha.substring(0, 10) : "sin-fecha";
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(it);
    });

    let html = "";
    Object.keys(grupos).sort((a, b) => b.localeCompare(a)).forEach(fecha => {
      const fechaTxt = formatearFechaCorta(fecha);
      html += `<div class="feed-grupo-titulo">${fechaTxt}</div>`;

      grupos[fecha].forEach((it, idx) => {
        const icono = it.tipo === "compra_emprendedor" ? "🛒"
                    : it.tipo === "compra_granja" ? "🏭"
                    : "💸";
        html += `
          <div class="feed-item" data-fecha="${fecha}" data-idx="${idx}">
            <div class="feed-item-icono">${icono}</div>
            <div class="feed-item-info">
              <div class="feed-item-titulo">${it.titulo || "—"}</div>
              <div class="feed-item-sub">${it.subtitulo || ""}</div>
            </div>
            <div class="feed-item-monto ${it.signo === '+' ? 'positivo' : 'negativo'}">
              ${it.signo}${formatearMoneda(it.monto)}
            </div>
          </div>
        `;
      });
    });

    cont.innerHTML = html;

    window.__feedItems = grupos;

    cont.querySelectorAll(".feed-item").forEach(el => {
      el.addEventListener("click", () => {
        const fecha = el.dataset.fecha;
        const idx = Number(el.dataset.idx);
        abrirDetalleFeed(window.__feedItems[fecha][idx]);
      });
    });

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function abrirDetalleFeed(item) {
  if (!item || !modalDetalle) return;

  const icono = item.tipo === "compra_emprendedor" ? "🛒 Compras emprendedor"
              : item.tipo === "compra_granja" ? "🏭 Compras a granja"
              : "💸 Gasto";

  let detalleHtml = "";

  if (item.tipo === "compra_emprendedor" || item.tipo === "compra_granja") {
    const d = item.detalle;
    detalleHtml = `
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label">${item.tipo === "compra_emprendedor" ? "Emprendedor" : "Proveedor"}</span><span class="valor">${item.titulo}</span></div>
        <div class="modal-fila"><span class="label">Fecha</span><span class="valor">${formatearFechaCorta(item.fecha)}</span></div>
      </div>
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label">Cajas blancas</span><span class="valor">${d.cajasBlancas}</span></div>
        <div class="modal-fila"><span class="label">Precio blanco</span><span class="valor">${formatearMoneda(d.precioBlanco)}</span></div>
        <div class="modal-fila"><span class="label">Cajas rojas</span><span class="valor">${d.cajasRojas}</span></div>
        <div class="modal-fila"><span class="label">Precio rojo</span><span class="valor">${formatearMoneda(d.precioRojo)}</span></div>
      </div>
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label"><strong>Total</strong></span><span class="valor"><strong>${formatearMoneda(item.monto)}</strong></span></div>
        <div class="modal-fila"><span class="label">Monto pagado</span><span class="valor">${formatearMoneda(d.montoPagado)}</span></div>
        <div class="modal-fila"><span class="label">Saldo pendiente</span><span class="valor">${formatearMoneda(d.saldo)}</span></div>
      </div>
      ${d.notas ? `<div class="modal-seccion"><div class="modal-fila"><span class="label">Notas</span><span class="valor">${d.notas}</span></div></div>` : ""}
    `;
  } else {
    detalleHtml = `
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label">Categoría</span><span class="valor">${item.titulo}</span></div>
        <div class="modal-fila"><span class="label">Concepto</span><span class="valor">${item.subtitulo || "—"}</span></div>
        <div class="modal-fila"><span class="label">Fecha</span><span class="valor">${formatearFechaCorta(item.fecha)}</span></div>
      </div>
      <div class="modal-seccion">
        <div class="modal-fila"><span class="label"><strong>Monto</strong></span><span class="valor"><strong>${formatearMoneda(item.monto)}</strong></span></div>
      </div>
      ${item.detalle.notas ? `<div class="modal-seccion"><div class="modal-fila"><span class="label">Notas</span><span class="valor">${item.detalle.notas}</span></div></div>` : ""}
    `;
  }

  modalDetalleCuerpo.innerHTML = `
    <h3 class="modal-titulo">${icono}</h3>
    <p class="modal-sub">${formatearFechaCorta(item.fecha)}</p>
    ${detalleHtml}
  `;

  modalDetalle.classList.remove("hidden");
}

function cerrarModalDetalle() {
  if (modalDetalle) modalDetalle.classList.add("hidden");
}

if (btnCerrarModalDet) btnCerrarModalDet.addEventListener("click", cerrarModalDetalle);
if (modalDetalle) {
  modalDetalle.addEventListener("click", (e) => {
    if (e.target === modalDetalle) cerrarModalDetalle();
  });
}

const chipsGanancias = document.getElementById("chips-ganancias");
if (chipsGanancias) {
  chipsGanancias.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    periodoGanancias = chip.dataset.periodo;
    chipsGanancias.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c === chip));
    cargarGananciasResumen();
  });
}

const btnVolverGan = document.getElementById("btn-volver-ganancias");
if (btnVolverGan) btnVolverGan.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// RENDIMIENTO
// ============================================================================
async function abrirRendimiento() {
  mostrarPantalla("rendimiento");

  correoRendimiento = "";
  periodoRendimiento = "mes";

  document.querySelectorAll("#chips-rendimiento-periodo .chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === "mes");
  });

  await cargarChipsEmprendedores("chips-rendimiento-emprendedor");
  cargarRendimiento();
}

async function cargarChipsEmprendedores(contenedorId) {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;

  await cargarEmprendedoresAdmin();

  let html = `<button class="chip activo" data-correo="">Todos</button>`;
  html += emprendedoresAdmin.map(e =>
    `<button class="chip" data-correo="${e.correo}">${e.nombre}</button>`
  ).join("");

  cont.className = "chips";
  cont.innerHTML = html;
}

async function cargarRendimiento() {
  const cont = document.getElementById("rendimiento-contenido");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando rendimiento...</p>`;

  try {
    const r = await API.obtenerRendimiento(correoRendimiento, periodoRendimiento);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    if (r.modo === "global") {
      cont.innerHTML = renderRendimientoGlobal(r);
    } else {
      cont.innerHTML = renderRendimientoIndividual(r);
    }

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

function renderRendimientoGlobal(r) {
  const c = r.cardPrincipal || {};
  const ranking = r.rankingEmprendedores || [];
  const tipo = r.tipoHuevo || { blanco: {}, rojo: {} };
  const colonias = r.topColonias || [];

  let html = `
    <div class="card">
      <p class="card-titulo">TOTAL COBRADO</p>
      <div class="card-valor">${formatearMoneda(c.totalCobrado)}</div>
      <p class="card-sub">${c.totalEntregas} entrega(s) · ${c.totalCarteras} cartera(s) · Promedio ${formatearMoneda(c.promedioEntrega)}</p>
    </div>
  `;

  if (ranking.length) {
    html += `
      <div class="card">
        <p class="card-titulo">🏆 Ranking emprendedores</p>
        <div class="lista-items">
          ${ranking.map((e, i) => `
            <div class="item-row">
              <div class="item-pos ${i === 0 ? 'top' : ''}">${i + 1}</div>
              <div class="item-info">
                <div class="item-nombre">${e.nombre}</div>
                <div class="item-detalle">${e.carteras} carteras · ${e.pedidos} pedido(s)</div>
              </div>
              <div class="item-valor">${formatearMoneda(e.ingresos)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `
    <div class="card">
      <p class="card-titulo">🥚 Tipo de huevo</p>
      <div class="rend-barra-h">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">Blanco</span>
          <span class="rend-barra-h-valor">${formatearMoneda(tipo.blanco.ingresos || 0)}</span>
        </div>
        <div class="rend-barra-h-track"><div class="rend-barra-h-fill blanco" style="width:100%"></div></div>
        <div class="rend-barra-h-sub">${tipo.blanco.carteras || 0} cartera(s)</div>
      </div>
      <div class="rend-barra-h" style="margin-top:10px;">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">Rojo</span>
          <span class="rend-barra-h-valor">${formatearMoneda(tipo.rojo.ingresos || 0)}</span>
        </div>
        <div class="rend-barra-h-track"><div class="rend-barra-h-fill rojo" style="width:100%"></div></div>
        <div class="rend-barra-h-sub">${tipo.rojo.carteras || 0} cartera(s)</div>
      </div>
    </div>
  `;

  if (colonias.length) {
    html += `
      <div class="card">
        <p class="card-titulo">📍 Top colonias</p>
        <div class="lista-items">
          ${colonias.map((col, i) => `
            <div class="item-row">
              <div class="item-pos ${i === 0 ? 'top' : ''}">${i + 1}</div>
              <div class="item-info">
                <div class="item-nombre">${col.colonia}</div>
                <div class="item-detalle">${col.carteras} cartera(s)</div>
              </div>
              <div class="item-valor">${formatearMoneda(col.ingresos)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  return html;
}

function renderRendimientoIndividual(r) {
  const c = r.cardPrincipal || {};
  const tipo = r.tipoHuevo || { blanco: {}, rojo: {} };
  const colonias = r.topColonias || [];
  const muertas = r.coloniasMuertas || { total: 0, ejemplos: [] };
  const mejorDia = r.mejorDia || {};

  let html = `
    <div class="card">
      <p class="card-titulo">${r.repartidor} · TOTAL COBRADO</p>
      <div class="card-valor">${formatearMoneda(c.totalCobrado)}</div>
      <p class="card-sub">${c.totalEntregas} entrega(s) · ${c.totalCarteras} cartera(s) · Promedio ${formatearMoneda(c.promedioEntrega)}</p>
    </div>
  `;

  html += `
    <div class="card">
      <p class="card-titulo">🥚 Tipo de huevo</p>
      <div class="rend-barra-h">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">Blanco</span>
          <span class="rend-barra-h-valor">${formatearMoneda(tipo.blanco.ingresos || 0)}</span>
        </div>
        <div class="rend-barra-h-track"><div class="rend-barra-h-fill blanco" style="width:100%"></div></div>
        <div class="rend-barra-h-sub">${tipo.blanco.carteras || 0} cartera(s)</div>
      </div>
      <div class="rend-barra-h" style="margin-top:10px;">
        <div class="rend-barra-h-header">
          <span class="rend-barra-h-label">Rojo</span>
          <span class="rend-barra-h-valor">${formatearMoneda(tipo.rojo.ingresos || 0)}</span>
        </div>
        <div class="rend-barra-h-track"><div class="rend-barra-h-fill rojo" style="width:100%"></div></div>
        <div class="rend-barra-h-sub">${tipo.rojo.carteras || 0} cartera(s)</div>
      </div>
    </div>
  `;

  if (colonias.length) {
    html += `
      <div class="card">
        <p class="card-titulo">📍 Mejores colonias</p>
        <div class="lista-items">
          ${colonias.map((col, i) => `
            <div class="item-row">
              <div class="item-pos ${i === 0 ? 'top' : ''}">${i + 1}</div>
              <div class="item-info"><div class="item-nombre">${col.colonia}</div><div class="item-detalle">${col.carteras} cartera(s)</div></div>
              <div class="item-valor">${formatearMoneda(col.ingresos)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (mejorDia.dia) {
    html += `
      <div class="card">
        <p class="card-titulo">🏅 Mejor día</p>
        <div class="rend-mejor-dia">
          <div class="rend-mejor-dia-trofeo">🏆</div>
          <div class="rend-mejor-dia-textos">
            <div class="rend-mejor-dia-dia">${mejorDia.dia}</div>
            <div class="rend-mejor-dia-prom">Promedio <strong>${formatearMoneda(mejorDia.promedio)}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  if (muertas.total > 0 && muertas.ejemplos.length) {
    html += `
      <div class="card">
        <p class="card-titulo">⚠️ Colonias sin ventas</p>
        <div class="rend-muertas">
          ${muertas.ejemplos.map(m => `
            <div class="rend-muerta-item">
              <div><div class="rend-muerta-nombre">${m.colonia}</div><div class="rend-muerta-motivo">${m.motivo}</div></div>
              <div>${formatearMoneda(m.ingresos)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  return html;
}

const chipsRendPeriodo = document.getElementById("chips-rendimiento-periodo");
if (chipsRendPeriodo) {
  chipsRendPeriodo.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    periodoRendimiento = chip.dataset.periodo;
    chipsRendPeriodo.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c === chip));
    cargarRendimiento();
  });
}

const chipsRendEmp = document.getElementById("chips-rendimiento-emprendedor");
if (chipsRendEmp) {
  chipsRendEmp.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    correoRendimiento = chip.dataset.correo || "";
    chipsRendEmp.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c === chip));
    cargarRendimiento();
  });
}

const btnVolverRend = document.getElementById("btn-volver-rendimiento");
if (btnVolverRend) btnVolverRend.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// HISTORIAL
// ============================================================================
async function abrirHistorial() {
  mostrarPantalla("historial");

  correoHistorial = "";
  periodoHistorial = "semana";

  document.querySelectorAll("#chips-historial-periodo .chip").forEach(c => {
    c.classList.toggle("activo", c.dataset.periodo === "semana");
  });

  await cargarChipsEmprendedores("chips-historial-emprendedor");
  cargarHistorial();
}

async function cargarHistorial() {
  const cont = document.getElementById("historial-contenido");
  if (!cont) return;
  cont.innerHTML = `<p class="cargando">Cargando historial...</p>`;

  if (!correoHistorial) {
    cont.innerHTML = `<p class="vacio">Selecciona un emprendedor para ver su historial.</p>`;
    return;
  }

  try {
    const r = await API.obtenerHistorial(correoHistorial, periodoHistorial);
    if (!r.ok) { cont.innerHTML = `<p class="vacio">${r.error || "Error"}</p>`; return; }

    const grupos = r.grupos || [];
    const resumen = r.resumen || {};

    let html = `
      <div class="historial-resumen">
        <div class="historial-resumen-icono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><polyline points="12 7 12 12 15 15"/>
          </svg>
        </div>
        <div class="historial-resumen-textos">
          <div class="historial-resumen-titulo">${formatearMoneda(resumen.totalCobrado || 0)}</div>
          <div class="historial-resumen-sub">${resumen.totalPedidos || 0} pedido(s) · ${resumen.totalCarteras || 0} cartera(s)</div>
        </div>
      </div>
    `;

    if (!grupos.length) {
      html += `<p class="vacio">Sin pedidos en este período.</p>`;
    } else {
      grupos.forEach(g => {
        html += `
          <div class="historial-grupo">
            <div class="historial-grupo-header">
              <span class="historial-grupo-fecha">${g.etiqueta}</span>
              <span class="historial-grupo-total">${formatearMoneda(g.totalCobrado)}</span>
            </div>
            ${g.pedidos.map(p => `
              <div class="historial-card">
                <div class="historial-card-icono">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="7" width="14" height="10" rx="1"/>
                    <path d="M15 10h4l3 3v4h-7z"/>
                  </svg>
                </div>
                <div class="historial-card-info">
                  <div class="historial-card-id">${p.id}</div>
                  <div class="historial-card-nombre">${p.nombre}</div>
                  <div class="historial-card-detalle">${p.colonia} · ${p.cantidad} cartera(s)</div>
                </div>
                <div class="historial-card-derecha">
                  <div class="historial-card-total">${formatearMoneda(p.precioTotal)}</div>
                  <div class="historial-card-metodo ${(p.metodoPago || "").toLowerCase()}">${p.metodoPago || "—"}</div>
                </div>
              </div>
            `).join("")}
          </div>
        `;
      });
    }

    cont.innerHTML = html;

  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p class="vacio">Error de conexión.</p>`;
  }
}

const chipsHistPeriodo = document.getElementById("chips-historial-periodo");
if (chipsHistPeriodo) {
  chipsHistPeriodo.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    periodoHistorial = chip.dataset.periodo;
    chipsHistPeriodo.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c === chip));
    cargarHistorial();
  });
}

const chipsHistEmp = document.getElementById("chips-historial-emprendedor");
if (chipsHistEmp) {
  chipsHistEmp.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    correoHistorial = chip.dataset.correo || "";
    chipsHistEmp.querySelectorAll(".chip").forEach(c => c.classList.toggle("activo", c === chip));
    cargarHistorial();
  });
}

const btnVolverHist = document.getElementById("btn-volver-historial");
if (btnVolverHist) btnVolverHist.addEventListener("click", () => {
  mostrarPantalla("config");
  volverMenuConfig();
});

// ============================================================================
// REFRESCAR PANTALLA
// ============================================================================
function refrescarPantallaActual() {
  if (pantallaActual === "dashboard") cargarDashboard();
  else if (pantallaActual === "repartidores") cargarRepartidores();
  else if (pantallaActual === "detalle-repartidor") abrirDetalleRepartidor(correoDetalleActual);
  else if (pantallaActual === "compras-emprendedor") abrirComprasEmprendedor();
  else if (pantallaActual === "compras-granja") abrirComprasGranja();
  else if (pantallaActual === "gastos") abrirGastos();
  else if (pantallaActual === "ganancias") { cargarGananciasResumen(); cargarFeed(); }
  else if (pantallaActual === "rendimiento") cargarRendimiento();
  else if (pantallaActual === "historial") cargarHistorial();
}

// ============================================================================
// EVENTOS
// ============================================================================
chipsDashboard.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  cambiarPeriodoDashboard(chip.dataset.periodo);
});

btnRefrescar.addEventListener("click", refrescarPantallaActual);

document.querySelectorAll(".footer-nav").forEach(nav => {
  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-nav]");
    if (!btn) return;
    const destino = btn.dataset.nav;

    if (destino === "dashboard") {
      mostrarPantalla("dashboard");
      cargarDashboard();
    } else if (destino === "repartidores") {
      mostrarPantalla("repartidores");
      cargarRepartidores();
    } else if (destino === "config") {
      mostrarPantalla("config");
      volverMenuConfig();
    }
  });
});

if (btnVolverConfig1) btnVolverConfig1.addEventListener("click", volverMenuConfig);
if (btnVolverConfig2) btnVolverConfig2.addEventListener("click", volverMenuConfig);

document.querySelectorAll(".config-opcion").forEach(btn => {
  btn.addEventListener("click", async () => {
    const tipo = btn.dataset.config;

    if (tipo === "nuevo-repartidor") {
      configMenu.classList.add("hidden");
      configNuevoRep.classList.remove("hidden");
      configCiudadesVista.classList.add("hidden");
      resetearFormNuevoRep();

      // Cargar ciudades dinámicamente
      await cargarCiudadesAdmin();
      poblarSelectCiudades("rep-ciudad", false);

    } else if (tipo === "ciudades") {
      configMenu.classList.add("hidden");
      configNuevoRep.classList.add("hidden");
      configCiudadesVista.classList.remove("hidden");

      ciudadSeleccionada = "";
      await cargarCiudadesAdmin();
      await cargarColoniasAdmin();
      renderizarChipsCiudades();
      renderizarListaColonias();
    }
  });
});

if (chipsCiudades) {
  chipsCiudades.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    seleccionarCiudad(chip.dataset.ciudad || "");
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
function iniciarAppAdmin(sesion) {
  sesionAdmin = sesion;
  document.getElementById("pantalla-login").classList.add("hidden");
  document.getElementById("app-principal").classList.remove("hidden");
  mostrarPantalla("dashboard");
  cargarDashboard();
}

(function autoLogin() {
  try {
    const guardada = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!guardada) return;
    const datos = JSON.parse(guardada);
    if (datos && datos.ok && datos.esAdmin) {
      iniciarAppAdmin(datos);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
  } catch (e) {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }
})();