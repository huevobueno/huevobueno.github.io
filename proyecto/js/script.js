/* =========================================================
   HUEVO BUENO · Landing personalizada v3
   - Formulario siempre visible en sección dorada
   - Página de gracias con 3 botones
   - Tracking completo
   ========================================================= */

(function () {
  'use strict';

  // -------- CONFIGURACIÓN --------
  var WHATSAPP_NUMERO = '523325110628';
  var WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz-lqQ1iTUXf6e0o7nrByiz8q5S7xOJBZhey7H4ktrsDX7NtFAjNycyO6CU-917sNmg/exec';
  var DEBUG = true;

  // -------- 1. LEER PARÁMETROS DEL URL --------
  var params = new URLSearchParams(window.location.search);
  var datos = {
    id:          params.get('id')          || 'TEST-000',
    nombre:      params.get('nombre')      || 'Saul',
    zona:        params.get('zona')        || 'Sayula',
    telefono:    params.get('telefono')    || '',
    viviendas:   parseInt(params.get('viviendas') || '9148', 10),
    viviendas_5: parseInt(params.get('viviendas_5') || '457', 10)
  };
  datos.cajas_semanales = Math.floor(datos.viviendas_5 / 12);

  // -------- 2. REEMPLAZAR PLACEHOLDERS --------
  function formatearNumero(n) {
    return n.toLocaleString('es-MX');
  }

  function reemplazarPlaceholders() {
    var campos = document.querySelectorAll('[data-field]');
    campos.forEach(function (el) {
      var key = el.getAttribute('data-field');
      if (datos[key] !== undefined) {
        var valor = datos[key];
        if (typeof valor === 'number' && key !== 'id') {
          valor = formatearNumero(valor);
        }
        el.textContent = valor;
      }
    });
  }

  // -------- 3. CALCULADORA --------
  function inicializarCalculadora() {
    var slider = document.getElementById('slider-familias');
    var valor = document.getElementById('slider-value');
    var cajas = document.getElementById('calc-cajas');
    var ganancia = document.getElementById('calc-ganancia');
    var ctaCalc = document.querySelector('.calc__cta');

    if (!slider) return;

    var maxFamilias = Math.max(datos.viviendas_5, 100);
    slider.min = 10;
    slider.max = maxFamilias;
    slider.value = maxFamilias;

    var yaMovio = false;

    function calcular() {
      var familias = parseInt(slider.value, 10);
      var cajasSem = Math.floor(familias / 12);
      var ganMin = cajasSem * 120;
      var ganMax = cajasSem * 240;

      valor.textContent = familias + ' familias';
      cajas.textContent = cajasSem;
      ganancia.textContent = '$' + formatearNumero(ganMin) + ' – $' + formatearNumero(ganMax);

      if (!yaMovio && ctaCalc) {
        ctaCalc.removeAttribute('hidden');
        void ctaCalc.offsetWidth;
        ctaCalc.classList.add('is-visible');
      }
    }

    slider.addEventListener('input', function () {
      calcular();
      if (!yaMovio) {
        yaMovio = true;
        track('clic_calculadora', { familias_seleccionadas: parseInt(slider.value, 10) });
      }
    });

    var timer = null;
    slider.addEventListener('change', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var familias = parseInt(slider.value, 10);
        var cajasSem = Math.floor(familias / 12);
        track('clic_calculadora', {
          familias_seleccionadas: familias,
          cajas_calculadas: cajasSem,
          ganancia_min: cajasSem * 120,
          ganancia_max: cajasSem * 240
        });
      }, 500);
    });

    calcular();
  }

  // -------- 4. FAQ TRACKING --------
  function inicializarFaq() {
    var items = document.querySelectorAll('.faq__item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          track('faq_abierto', { pregunta: item.getAttribute('data-faq') });
        }
      });
    });
  }

  // -------- 5. CTA CALCULADORA (scroll al formulario) --------
  function inicializarCtas() {
    var botones = document.querySelectorAll('[data-cta="calculadora"]');
    botones.forEach(function (btn) {
      btn.setAttribute('href', '#formulario');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var form = document.getElementById('formulario');
        if (!form) return;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        track('clic_cta_whatsapp', { seccion_origen: 'calculadora' });
      });
    });
  }

  // -------- 6. FORMULARIO --------
  function inicializarFormulario() {
    var form = document.getElementById('form-calificado');
    if (!form) return;

    var inputNombre = document.getElementById('f-nombre');
    var inputWa = document.getElementById('f-whatsapp');
    var inputCiudad = document.getElementById('f-ciudad');

    if (inputNombre) inputNombre.value = datos.nombre;
    if (inputCiudad) inputCiudad.value = datos.zona;
    if (inputWa && datos.telefono) inputWa.value = datos.telefono;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.dataset.enviando === '1') return;
      form.dataset.enviando = '1';

      var errEl = document.getElementById('form-error');
      errEl.hidden = true;

      var nombre = (inputNombre.value || '').trim();
      var whatsapp = (inputWa.value || '').replace(/\D/g, '');
      var ciudad = (inputCiudad.value || '').trim();
      var colonia = (document.getElementById('f-colonia').value || '').trim();
      var cajas = form.querySelector('input[name="cajas"]:checked');
      var cuando = form.querySelector('input[name="cuando"]:checked');

      function falloValidacion(msg) {
        form.dataset.enviando = '';
        errEl.textContent = msg;
        errEl.hidden = false;
      }

      if (!nombre || nombre.length < 2) return falloValidacion('Escribe tu nombre completo.');
      if (!whatsapp || whatsapp.length < 10) return falloValidacion('Escribe un WhatsApp válido (10 dígitos).');
      if (!ciudad) return falloValidacion('Escribe tu ciudad.');
      if (!colonia) return falloValidacion('Escribe tu colonia.');
      if (!cajas) return falloValidacion('Selecciona cuántas cajas quieres.');
      if (!cuando) return falloValidacion('Selecciona cuándo puedes iniciar.');

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }

      var payload = {
        id_registro: datos.id,
        evento: 'formulario_enviado',
        nombre: nombre,
        whatsapp: whatsapp,
        ciudad: ciudad,
        colonia: colonia,
        cajas: cajas.value,
        cuando_inicia: cuando.value,
        timestamp: new Date().toISOString()
      };

      if (DEBUG) console.log('[form]', payload);
      enviarWebhook(payload);

      window.__leadCalificado = payload;

      setTimeout(function () {
        var bloqueForm = document.getElementById('bloque-form');
        if (bloqueForm) bloqueForm.hidden = true;

        var gracias = document.getElementById('gracias');
        gracias.hidden = false;
        gracias.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }

  // -------- 7. BOTONES DE GRACIAS --------
  function inicializarGracias() {
    var botones = document.querySelectorAll('.gracias__btn');
    botones.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var metodo = btn.getAttribute('data-metodo');
        var lead = window.__leadCalificado || {};

        var nombre = lead.nombre || datos.nombre;
        var ciudad = lead.ciudad || datos.zona;
        var id = datos.id;

        var mensajes = {
          'WhatsApp': 'Hola, soy ' + nombre + ' de ' + ciudad + '. Acabo de llenar el formulario (ID: ' + id + ') y quiero hablar contigo por WhatsApp para coordinar mi ruta.',
          'Videollamada': 'Hola, soy ' + nombre + ' de ' + ciudad + '. Quiero AGENDAR UNA VIDEOLAMADA para ver los detalles de mi ruta (ID: ' + id + ').',
          'Visita': 'Hola, soy ' + nombre + ' de ' + ciudad + '. Quiero AGENDAR UNA VISITA A MI DOMICILIO para ver los detalles de mi ruta (ID: ' + id + ').'
        };

        var texto = mensajes[metodo] || mensajes['WhatsApp'];
        var url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(texto);

        track('clic_metodo_' + metodo.toLowerCase(), { metodo: metodo });

        enviarWebhook({
          id_registro: datos.id,
          evento: 'metodo_elegido',
          metodo: metodo,
          nombre: nombre,
          ciudad: ciudad,
          colonia: lead.colonia || '',
          cajas: lead.cajas || '',
          cuando_inicia: lead.cuando_inicia || '',
          timestamp: new Date().toISOString()
        });

        setTimeout(function () {
          window.open(url, '_blank');
        }, 300);
      });
    });
  }

  // -------- 8. TRACKING --------
  function track(evento, extra) {
    var payload = Object.assign({
      id_registro: datos.id,
      nombre: datos.nombre,
      zona: datos.zona,
      evento: evento,
      timestamp: new Date().toISOString()
    }, extra || {});

    if (DEBUG) console.log('[track]', payload);
    enviarWebhook(payload);
  }

  function enviarWebhook(payload) {
    if (!WEBHOOK_URL) return;
    try {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) { /* noop */ }
  }

  // -------- 9. SCROLL --------
  function inicializarScrollTracking() {
    var umbrales = { 25: false, 50: false, 75: false, 100: false };

    function evaluar() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;
      var pct = Math.min(100, Math.round((window.scrollY / alto) * 100));

      [25, 50, 75, 100].forEach(function (u) {
        if (!umbrales[u] && pct >= u) {
          umbrales[u] = true;
          track('scroll_max', { valor: u });
        }
      });
    }

    window.addEventListener('scroll', evaluar, { passive: true });
    evaluar();
  }

  // -------- 10. TIEMPO --------
  function inicializarTiempoTracking() {
    [15, 30, 60].forEach(function (seg) {
      setTimeout(function () {
        track('tiempo_max', { valor: seg });
      }, seg * 1000);
    });
  }

  // -------- 11. PAGEVIEW --------
  function inicializarPageview() {
    track('pageview', {
      viviendas: datos.viviendas,
      viviendas_5: datos.viviendas_5
    });
  }

  // -------- 12. ARRANQUE --------
  document.addEventListener('DOMContentLoaded', function () {
    reemplazarPlaceholders();
    inicializarCalculadora();
    inicializarFaq();
    inicializarCtas();
    inicializarFormulario();
    inicializarGracias();
    inicializarScrollTracking();
    inicializarTiempoTracking();
    inicializarPageview();
  });
})();