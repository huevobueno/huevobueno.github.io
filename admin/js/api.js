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

  // === ALTA DE COLONIA ===
  crearColonia(data) {
    return this.llamar({
      action: "admin_crear_colonia",
      municipio: data.municipio,
      colonia: data.colonia,
      codigoPostal: data.codigoPostal,
      diaEntrega: data.diaEntrega,
      precioBlanco: data.precioBlanco,
      precioRojo: data.precioRojo
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
  }
};