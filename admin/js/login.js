const formLogin     = document.getElementById("form-login");
const inputCorreo   = document.getElementById("input-correo");
const inputPassword = document.getElementById("input-password");
const btnIngresar   = document.getElementById("btn-ingresar");
const mensajeError  = document.getElementById("mensaje-error");

function guardarSesion(datos) {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(datos)); } catch (e) {}
}

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensajeError.textContent = "";

  const correo = inputCorreo.value.trim();
  const password = inputPassword.value;

  if (!correo || !password) {
    mensajeError.textContent = "Completa todos los campos.";
    return;
  }

  btnIngresar.disabled = true;
  btnIngresar.textContent = "Verificando...";

  try {
    const r = await API.loginAdmin(correo, password);

    if (!r.ok) {
      mensajeError.textContent = r.error || "No se pudo iniciar sesión.";
      return;
    }

    guardarSesion(r);
    iniciarAppAdmin(r);

  } catch (err) {
    console.error(err);
    mensajeError.textContent = "Error de conexión.";
  } finally {
    btnIngresar.disabled = false;
    btnIngresar.textContent = "Iniciar sesión";
  }
});