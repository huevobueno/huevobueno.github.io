/* =========================================================
   HUEVO BUENO · Landing personalizada
   - Lee parámetros del URL
   - Reemplaza placeholders
   - Calculadora interactiva
   - Tracking de eventos
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
    viviendas:   parseInt(params.get('viviendas') || '9148', 10),
    viviendas_5: parseInt(params.get('viviendas_5') || '457', 10)
  };
  datos.cajas_semanales = Math.floor(datos.viviendas_5 / 12);

  // -------- 2. REEMPLAZAR PLACEHOLDERS EN EL DOM --------
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
   // -------- 3. CALCULADORA --------
  function inicializarCalculadora() {
    var slider = document.getElementById('slider-familias');
    var valor = document.getElementById('slider-value');
    var cajas = document.getElementById('calc-cajas');
    var ganancia = document.getElementById('calc-ganancia');
    var ctaCalc = document.querySelector('.calc__cta');

    if (!slider) return;

    // Configurar min/max de forma adaptativa
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

      // Mostrar CTA solo después del primer movimiento
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
        track('clic_calculadora', {
          familias_seleccionadas: parseInt(slider.value, 10)
        });
      }
    });

    // Registra también cada cambio con debounce ligero
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

  // -------- 5. CTAs A WHATSAPP --------
  function construirUrlWhatsApp() {
    var texto = 'Hola, soy ' + datos.nombre + ' de ' + datos.zona +
                '. Vi la info (ID: ' + datos.id + ') y quiero apartar mi zona.';
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(texto);
  }

  function inicializarCtas() {
    var url = construirUrlWhatsApp();
    var botones = document.querySelectorAll('[data-cta]');
    botones.forEach(function (btn) {
      btn.setAttribute('href', url);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener');
      btn.addEventListener('click', function () {
        track('clic_cta_whatsapp', {
          seccion_origen: btn.getAttribute('data-cta')
        });
      });
    });
  }

  // -------- 6. TRACKING DE SCROLL + TIEMPO --------
  function track(evento, extra) {
    var payload = Object.assign({
      id_registro: datos.id,
      nombre: datos.nombre,
      zona: datos.zona,
      evento: evento,
      timestamp: new Date().toISOString()
    }, extra || {});

    if (DEBUG) console.log('[track]', payload);

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

  function inicializarScrollTracking() {
    var marcados = { 25: false, 50: false, 75: false, 100: false };

    function evaluar() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;
      var pct = Math.min(100, Math.round((window.scrollY / alto) * 100));

      [25, 50, 75, 100].forEach(function (umbral) {
        if (!marcados[umbral] && pct >= umbral) {
          marcados[umbral] = true;
          track('scroll_' + umbral);
          if (umbral === 25) revelarWapp();
        }
      });
    }

    window.addEventListener('scroll', evaluar, { passive: true });
    evaluar();
  }

  function revelarWapp() {
    var wapp = document.querySelector('.wapp');
    if (wapp) wapp.classList.add('is-visible');
  }

  function inicializarTiempoTracking() {
    [15, 30, 60].forEach(function (seg) {
      setTimeout(function () {
        track('tiempo_max', { valor: seg });
      }, seg * 1000);
    });
  }

  // -------- 7. PAGEVIEW --------
  function inicializarPageview() {
    track('pageview', {
      viviendas: datos.viviendas,
      viviendas_5: datos.viviendas_5
    });
  }

  // -------- 8. ARRANQUE --------
  document.addEventListener('DOMContentLoaded', function () {
    reemplazarPlaceholders();
    inicializarCalculadora();
    inicializarFaq();
    inicializarCtas();
    inicializarScrollTracking();
    inicializarTiempoTracking();
    inicializarPageview();
  });
})();