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
let ciudadSeleccionada  = "";

// --- Refs DOM generales ---
const headerTitulo    = document.getElementById("header-titulo");
const headerSubtitulo = document.getElementById("header-subtitulo");
const btnRefrescar    = document.getElementById("btn-refrescar");
const btnSalir        = document.getElementById("btn-salir");
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

// --- Refs DOM Info-box ---
const repInfoIcono = document.getElementById("rep-info-icono");
const repInfoTitulo = document.getElementById("rep-info-titulo");
const repInfoTexto = document.getElementById("rep-info-texto");

// --- Refs DOM Modal ---
const modalColonia      = document.getElementById("modal-colonia");
const btnCerrarModalCol = document.getElementById("btn-cerrar-modal-colonia");
const btnAbrirModalCol  = document.getElementById("btn-abrir-modal-colonia");
const formNuevaColonia  = document.getElementById("form-nueva-colonia");
const btnGuardarColonia = document.getElementById("btn-guardar-colonia");
const msgNuevaColonia   = document.getElementById("msg-nueva-colonia");

// ============================================================================
// CIUDADES
// ============================================================================
const CIUDADES = ["Sayula", "Zacoalco", "Ciudad Guzman"];
const CIUDAD_OTRO = "__OTRO__";

// ============================================================================
// CONFIG DE PANTALLAS
// ============================================================================
const PANTALLAS = {
  dashboard:    { titulo: "Dashboard",    subtitulo: () => "Resumen de tu negocio" },
  repartidores: { titulo: "Repartidores", subtitulo: () => "Tus vendedores y su rendimiento" },
  config:       { titulo: "Configuración", subtitulo: () => "Ajustes del sistema" }
};

// ============================================================================
// HELPERS
// ============================================================================
function formatearMoneda(n) {
  return "$" + (Number(n) || 0).toLocaleString("es-MX");
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
      <div class="rep-card">
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
}

// ============================================================================
// CARGAR COLONIAS
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

// ============================================================================
// VISTA: CIUDADES
// ============================================================================
function renderizarChipsCiudades() {
  if (!chipsCiudades) return;
  const todas = `<button class="chip ${ciudadSeleccionada === "" ? 'activo' : ''}" data-ciudad="">Todas</button>`;
  const chips = CIUDADES.map(c =>
    `<button class="chip ${ciudadSeleccionada === c ? 'activo' : ''}" data-ciudad="${c}">${c}</button>`
  ).join("");
  chipsCiudades.className = "chips";
  chipsCiudades.innerHTML = todas + chips;
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

  listaColonias.innerHTML = filtradas.map(c => `
    <div class="colonia-card">
      <div class="colonia-info">
        <div class="colonia-nombre">${c.colonia}</div>
        <div class="colonia-detalle">${c.municipio} · ${c.diaEntrega || "Sin día"} · ⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</div>
      </div>
      <span class="colonia-rep">${c.repartidorActual || "Sin asignar"}</span>
    </div>
  `).join("");
}

function seleccionarCiudad(ciudad) {
  ciudadSeleccionada = ciudad;
  renderizarChipsCiudades();
  renderizarListaColonias();
}

// ============================================================================
// FORM: NUEVO REPARTIDOR
// ============================================================================
function resetearFormNuevoRep() {
  formNuevoRep.reset();
  document.getElementById("rep-ciudad-otro").value = "";
  document.getElementById("rep-colonia-espera").value = "";
  if (msgNuevoRep) msgNuevoRep.textContent = "";

  repCamposPersonales.classList.add("hidden");
  repCiudadLibre.classList.add("hidden");
  repSeccionColonias.classList.add("hidden");
  repMensajeSinCols.classList.add("hidden");

  btnAccionRep.textContent = "Completa los datos";
  btnAccionRep.classList.add("disabled");
}

// Muestra TODAS las colonias de la ciudad, con etiqueta del dueño actual
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
      <label class="checkbox-item">
        <input type="checkbox" value="${realIdx}">
        <div class="checkbox-item-info">
          <div class="checkbox-item-nombre">${c.colonia}</div>
          <div class="checkbox-item-detalle">${c.diaEntrega || "Sin día"} · ⚪ $${c.precioBlanco} · 🔴 $${c.precioRojo}</div>
        </div>
        ${tagDueño}
      </label>
    `;
  }).join("");
}

async function manejarCambioCiudadRep() {
  const val = selectCiudadRep.value;

  repCamposPersonales.classList.add("hidden");
  repCiudadLibre.classList.add("hidden");
  repSeccionColonias.classList.add("hidden");
  repMensajeSinCols.classList.add("hidden");
  if (msgNuevoRep) msgNuevoRep.textContent = "";

  if (!val) {
    btnAccionRep.textContent = "Completa los datos";
    btnAccionRep.classList.add("disabled");
    return;
  }

  repCamposPersonales.classList.remove("hidden");

  // Caso "Otro"
  if (val === CIUDAD_OTRO) {
    repCiudadLibre.classList.remove("hidden");
    btnAccionRep.textContent = "Guardar en lista de espera";
    btnAccionRep.classList.remove("disabled");
    return;
  }

  // Caso ciudad real: cargar colonias
  await cargarColoniasAdmin();

  const coloniasDeCiudad = coloniasDisponibles.filter(c => c.municipio === val);

  if (coloniasDeCiudad.length > 0) {
    // Hay colonias → mostrar checklist con etiquetas
    repSeccionColonias.classList.remove("hidden");
    repColoniasSub.textContent = `${coloniasDeCiudad.length} colonia(s) en ${val}. Selecciona las que le asignarás.`;
    renderizarCheckboxColonias(val);
    btnAccionRep.textContent = "Asignar colonias al repartidor";
    btnAccionRep.classList.remove("disabled");
    return;
  }

  // Ciudad sin colonias registradas
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

// Submit del form Nuevo Repartidor
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

    // === Caso "Otro" → Lista Espera ===
    if (val === CIUDAD_OTRO) {
      const ciudadLibre = document.getElementById("rep-ciudad-otro").value.trim();
      if (!ciudadLibre) {
        if (msgNuevoRep) msgNuevoRep.textContent = "Escribe el nombre de la ciudad.";
        return;
      }
      await enviarProspecto({ nombre, correo, password, whatsapp, ciudad: ciudadLibre, colonia: "" });
      return;
    }

    // === Caso ciudad sin colonias → Lista Espera ===
    const coloniasDeCiudad = coloniasDisponibles.filter(c => c.municipio === val);

    if (coloniasDeCiudad.length === 0) {
      const coloniaEspera = document.getElementById("rep-colonia-espera").value.trim();
      await enviarProspecto({ nombre, correo, password, whatsapp, ciudad: val, colonia: coloniaEspera });
      return;
    }

    // === Caso normal → Reasignar colonias ===
    const checkboxes = listaCheckboxCols.querySelectorAll("input[type=checkbox]:checked");
    const coloniasSeleccionadas = [];

    checkboxes.forEach(cb => {
      const c = coloniasDisponibles[Number(cb.value)];
      if (c) {
        coloniasSeleccionadas.push({
          municipio: c.municipio,
          colonia: c.colonia,
          codigoPostal: c.codigoPostal,
          diaEntrega: c.diaEntrega,
          precioBlanco: c.precioBlanco,
          precioRojo: c.precioRojo
        });
      }
    });

    if (coloniasSeleccionadas.length === 0) {
      if (msgNuevoRep) msgNuevoRep.textContent = "Selecciona al menos una colonia.";
      return;
    }

    // Confirmación: se van a reasignar colonias
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
// MODAL NUEVA COLONIA
// ============================================================================
function manejarCambioCiudadColonia() {
  const val = selectCiudadColonia.value;
  if (val === CIUDAD_OTRO) {
    colCiudadLibre.classList.remove("hidden");
  } else {
    colCiudadLibre.classList.add("hidden");
  }
}

if (selectCiudadColonia) {
  selectCiudadColonia.addEventListener("change", manejarCambioCiudadColonia);
}

function abrirModalColonia() {
  if (modalColonia) modalColonia.classList.remove("hidden");
}

function cerrarModalColonia() {
  if (modalColonia) modalColonia.classList.add("hidden");
  if (formNuevaColonia) formNuevaColonia.reset();
  if (msgNuevaColonia) msgNuevaColonia.textContent = "";
  document.getElementById("col-precio-blanco").value = "70";
  document.getElementById("col-precio-rojo").value = "95";
  colCiudadLibre.classList.add("hidden");
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

    const val = selectCiudadColonia.value;
    const colonia = document.getElementById("col-nombre").value.trim();
    const cp = document.getElementById("col-cp").value.trim();
    const dia = document.getElementById("col-dia").value.trim();
    const pb = Number(document.getElementById("col-precio-blanco").value);
    const pr = Number(document.getElementById("col-precio-rojo").value);

    if (!colonia) { if (msgNuevaColonia) msgNuevaColonia.textContent = "Falta el nombre."; return; }

    // Caso "Otro" → Lista Espera
    if (val === CIUDAD_OTRO) {
      const ciudadLibre = document.getElementById("col-ciudad-otro").value.trim();
      if (!ciudadLibre) {
        if (msgNuevaColonia) msgNuevaColonia.textContent = "Escribe el nombre de la ciudad.";
        return;
      }

      btnGuardarColonia.disabled = true;
      btnGuardarColonia.textContent = "Guardando...";
      try {
        const r = await API.registrarProspecto({
          nombre: "(Solicitud de colonia)",
          correo: "",
          password: "",
          whatsapp: "",
          ciudad: ciudadLibre,
          colonia: colonia
        });
        if (!r.ok) {
          if (msgNuevaColonia) msgNuevaColonia.textContent = r.error;
          return;
        }
        alert("✅ Solicitud registrada en lista de espera: " + colonia + ", " + ciudadLibre);
        cerrarModalColonia();
      } catch (err) {
        if (msgNuevaColonia) msgNuevaColonia.textContent = "Error de conexión.";
      } finally {
        btnGuardarColonia.disabled = false;
        btnGuardarColonia.textContent = "Guardar colonia";
      }
      return;
    }

    if (!val) { if (msgNuevaColonia) msgNuevaColonia.textContent = "Selecciona una ciudad."; return; }

    // Caso ciudad real → Rutas
    btnGuardarColonia.disabled = true;
    btnGuardarColonia.textContent = "Guardando...";
    try {
      const r = await API.crearColonia({
        municipio: val,
        colonia: colonia,
        codigoPostal: cp,
        diaEntrega: dia,
        precioBlanco: pb,
        precioRojo: pr
      });

      if (!r.ok) {
        if (msgNuevaColonia) msgNuevaColonia.textContent = r.error || "No se pudo crear.";
        return;
      }

      alert("✅ " + r.mensaje);
      await cargarColoniasAdmin();

      if (!configNuevoRep.classList.contains("hidden")) {
        renderizarCheckboxColonias(val);
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
  if (selectCiudadRep) selectCiudadRep.value = "";
  resetearFormNuevoRep();
}

// ============================================================================
// REFRESCAR PANTALLA
// ============================================================================
function refrescarPantallaActual() {
  if (pantallaActual === "dashboard") cargarDashboard();
  else if (pantallaActual === "repartidores") cargarRepartidores();
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

btnSalir.addEventListener("click", () => {
  if (!confirm("¿Cerrar sesión?")) return;
  localStorage.removeItem(CONFIG.STORAGE_KEY);
  location.reload();
});

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

    } else if (tipo === "ciudades") {
      configMenu.classList.add("hidden");
      configNuevoRep.classList.add("hidden");
      configCiudadesVista.classList.remove("hidden");

      ciudadSeleccionada = "";
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