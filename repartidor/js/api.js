/**
 * ============================================================================
 * API - Capa de comunicación con Apps Script
 * ============================================================================
 */

const API = {

  async llamar(payload) {
    const respuesta = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    if (!respuesta.ok) {
      throw new Error("Error HTTP " + respuesta.status);
    }

    return await respuesta.json();
  },

  login(correo, password) {
    return this.llamar({ action: "login", correo, password });
  },

  misRutas(correo) {
    return this.llamar({ action: "mis_rutas", correo });
  },

  pedidos(repartidor) {
    return this.llamar({ action: "pedidos", repartidor });
  },

  caja(correo) {
    return this.llamar({ action: "caja", correo });
  },

  historial(correo, periodo) {
    return this.llamar({ action: "historial", correo, periodo });
  },

  rendimiento(correo, periodo) {
    return this.llamar({ action: "rendimiento", correo, periodo });
  },

  actualizar(idPedido, cambios) {
    return this.llamar({ action: "actualizar", idPedido, cambios });
  },

  enviarTicket(idPedido) {
    return this.llamar({ action: "enviar_ticket", idPedido });
  },

  contactarCliente(idPedido) {
    return this.llamar({ action: "contactar_cliente", idPedido });
  },

  ping() {
    return this.llamar({ action: "ping" });
  }
};
