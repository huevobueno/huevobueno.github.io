/**
 * ============================================================================
 * LOGIN
 * ============================================================================
 */

const formLogin     = document.getElementById("form-login");
const inputCorreo   = document.getElementById("input-correo");
const inputPassword = document.getElementById("input-password");
const btnIngresar   = document.getElementById("btn-ingresar");
const mensajeError  = document.getElementById("mensaje-error");

function mostrarError(texto) {
  mensajeError.textContent = texto || "";
}

function guardarSesion(datos) {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(datos));
  } catch (e) {
    console.warn("No se pudo guardar la sesión:", e);
  }
}

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarError("");

  const correo   = inputCorreo.value.trim();
  const password = inputPassword.value;

  if (!correo || !password) {
    mostrarError("Completa todos los campos.");
    return;
  }

  btnIngresar.disabled = true;
  btnIngresar.textContent = "Verificando...";

  try {
    const resultado = await API.login(correo, password);

    if (!resultado.ok) {
      mostrarError(resultado.error || "No se pudo iniciar sesión.");
      return;
    }

    guardarSesion(resultado);
    iniciarApp(resultado);

  } catch (error) {
    console.error(error);
    mostrarError("Error de conexión. Revisa tu internet e intenta de nuevo.");
  } finally {
    btnIngresar.disabled = false;
    btnIngresar.textContent = "Iniciar sesión";
  }
});
