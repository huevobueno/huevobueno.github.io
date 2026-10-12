/**
 * ============================================================================
 * ADMIN - Capa de comunicación con el backend
 * ============================================================================
 */

const API = {

  async llamar(payload) {
    const r = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  },

  // === AUTENTICACIÓN ===
  loginAdmin(correo, password) {
    return this.llamar({ action: "login_admin", correo, password });
  },

  // === DASHBOARD ===
  dashboard() {
    return this.llamar({ action: "admin_dashboard" });
  },

  // === REPARTIDORES ===
  repartidores() {
    return this.llamar({ action: "admin_repartidores" });
  },

  // === COLONIAS ===
  coloniasAdmin() {
    return this.llamar({ action: "admin_colonias" });
  },

  // === CIUDADES ===
  obtenerCiudades() {
    return this.llamar({ action: "admin_obtener_ciudades" });
  },

  registrarCiudad(data) {
    return this.llamar({
      action: "admin_registrar_ciudad",
      municipio: data.municipio,
      precioBlanco: data.precioBlanco,
      precioRojo: data.precioRojo,
      colonia: data.colonia,
      codigoPostal: data.codigoPostal
    });
  },

  editarPreciosCiudad(municipio, precios) {
    return this.llamar({
      action: "admin_editar_precios_ciudad",
      municipio: municipio,
      precios: {
        precioBlanco: precios.precioBlanco,
        precioRojo: precios.precioRojo
      }
    });
  },

  // === ALTA DE REPARTIDOR ===
  crearRepartidor(data) {
    return this.llamar({
      action: "admin_crear_repartidor",
      nombre: data.nombre,
      correo: data.correo,
      password: data.password,
      whatsapp: data.whatsapp,
      colonias: data.colonias
    });
  },

  // === DETALLE / EDICIÓN DE EMPRENDEDOR ===
  obtenerDetalleRepartidor(correo) {
    return this.llamar({
      action: "admin_detalle_repartidor",
      correo: correo
    });
  },

  editarRepartidor(correo, cambios) {
    return this.llamar({
      action: "admin_editar_repartidor",
      correo: correo,
      cambios: cambios
    });
  },

  asignarColonia(correo, colonia) {
    return this.llamar({
      action: "admin_asignar_colonia",
      correo: correo,
      colonia: colonia
    });
  },

  quitarColonia(correo, colonia) {
    return this.llamar({
      action: "admin_quitar_colonia",
      correo: correo,
      colonia: colonia
    });
  },

  actualizarDiaColonia(correo, colonia, dia) {
    return this.llamar({
      action: "admin_actualizar_dia_colonia",
      correo: correo,
      colonia: colonia,
      dia: dia
    });
  },

  // === ALTA DE COLONIA ===
  crearColonia(data) {
    return this.llamar({
      action: "admin_crear_colonia",
      municipio: data.municipio,
      colonia: data.colonia,
      codigoPostal: data.codigoPostal,
      diaEntrega: data.diaEntrega
    });
  },

  // === REGISTRAR PROSPECTO ===
  registrarProspecto(data) {
    return this.llamar({
      action: "admin_registrar_prospecto",
      nombre: data.nombre,
      correo: data.correo,
      password: data.password,
      whatsapp: data.whatsapp,
      ciudad: data.ciudad,
      colonia: data.colonia
    });
  },

  // === COMPRAS EMPRENDEDOR ===
  guardarCompraEmprendedor(data) {
    return this.llamar({
      action: "admin_guardar_compra_emprendedor",
      fecha: data.fecha,
      emprendedor: data.emprendedor,
      cajasBlancas: data.cajasBlancas,
      cajasRojas: data.cajasRojas,
      precioVentaBlanco: data.precioVentaBlanco,
      precioVentaRojo: data.precioVentaRojo,
      montoPagado: data.montoPagado,
      notas: data.notas
    });
  },

  listarComprasEmprendedor(limite) {
    return this.llamar({
      action: "admin_listar_compras",
      tipo: "emprendedor",
      limite: limite || 20
    });
  },

  // === COMPRAS GRANJA ===
  guardarCompraGranja(data) {
    return this.llamar({
      action: "admin_guardar_compra_granja",
      fecha: data.fecha,
      proveedor: data.proveedor,
      cajasBlancas: data.cajasBlancas,
      cajasRojas: data.cajasRojas,
      precioCompraBlanco: data.precioCompraBlanco,
      precioCompraRojo: data.precioCompraRojo,
      montoPagado: data.montoPagado,
      notas: data.notas
    });
  },

  listarComprasGranja(limite) {
    return this.llamar({
      action: "admin_listar_compras",
      tipo: "granja",
      limite: limite || 20
    });
  },

  // === GASTOS ===
  guardarGasto(data) {
    return this.llamar({
      action: "admin_guardar_gasto",
      fecha: data.fecha,
      categoria: data.categoria,
      concepto: data.concepto,
      monto: data.monto,
      notas: data.notas
    });
  },

  listarGastos(limite) {
    return this.llamar({
      action: "admin_listar_gastos",
      limite: limite || 20
    });
  },

  // === GANANCIAS + FEED ===
  obtenerGanancias() {
    return this.llamar({ action: "admin_obtener_ganancias" });
  },

  obtenerFeed(limite) {
    return this.llamar({
      action: "admin_obtener_feed",
      limite: limite || 30
    });
  },

  // === RENDIMIENTO ===
  obtenerRendimiento(correo, periodo) {
    return this.llamar({
      action: "admin_obtener_rendimiento",
      correo: correo || "",
      periodo: periodo || "mes"
    });
  },

  // === HISTORIAL ===
  obtenerHistorial(correo, periodo) {
    return this.llamar({
      action: "historial",
      correo: correo || "",
      periodo: periodo || "semana"
    });
  }
};