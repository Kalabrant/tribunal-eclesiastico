/**
 * TRIBUNAL ECLESIÁSTICO METROPOLITANO
 * Arquidiócesis de Maracaibo — Script principal v3.0
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================================
    // 1. MENÚ HAMBURGUESA (responsive móvil)
    // ============================================================
    const btnMenu = document.querySelector('.btn-menu');
    const navPrincipal = document.querySelector('.nav-principal');

    if (btnMenu && navPrincipal) {
        btnMenu.addEventListener('click', () => {
            const abierto = navPrincipal.classList.toggle('abierto');
            btnMenu.classList.toggle('abierto', abierto);
            btnMenu.setAttribute('aria-expanded', abierto);
        });

        // Cerrar menú al hacer clic en un enlace
        navPrincipal.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navPrincipal.classList.remove('abierto');
                btnMenu.classList.remove('abierto');
                btnMenu.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!btnMenu.contains(e.target) && !navPrincipal.contains(e.target)) {
                navPrincipal.classList.remove('abierto');
                btnMenu.classList.remove('abierto');
                btnMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ============================================================
    // 2. MARCAR ENLACE ACTIVO EN NAVEGACIÓN
    // ============================================================
    const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-principal a').forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (href === paginaActual || (paginaActual === '' && href === 'index.html')) {
            enlace.classList.add('activo');
        }
    });


    // ============================================================
    // 3. ACORDEÓN DE FAQ
    // ============================================================
    document.querySelectorAll('.faq-pregunta').forEach(pregunta => {
        pregunta.addEventListener('click', () => {
            const item = pregunta.closest('.faq-item');
            const estaActivo = item.classList.contains('activo');

            // Cerrar todos los demás
            document.querySelectorAll('.faq-item').forEach(otro => {
                otro.classList.remove('activo');
                const boton = otro.querySelector('.faq-pregunta');
                if (boton) boton.setAttribute('aria-expanded', 'false');
            });

            // Abrir el seleccionado si estaba cerrado
            if (!estaActivo) {
                item.classList.add('activo');
                pregunta.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // ============================================================
    // 4. BUSCADOR DEL FAQ (filtra preguntas en vivo)
    // ============================================================
    const buscadorFaq = document.getElementById('faq-buscador');

    if (buscadorFaq) {
        const items = Array.from(document.querySelectorAll('.faq-item'));
        const secciones = Array.from(document.querySelectorAll('.seccion-faq'));
        const sinResultados = document.querySelector('.faq-sin-resultados');

        const normalizar = (texto) => texto
            .toLowerCase()
            .normalize('NFD')
            .replace(new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036F) + ']', 'g'), '');

        buscadorFaq.addEventListener('input', () => {
            const consulta = normalizar(buscadorFaq.value.trim());
            let visibles = 0;

            items.forEach(item => {
                const coincide = consulta === '' || normalizar(item.textContent).includes(consulta);
                item.style.display = coincide ? '' : 'none';
                if (coincide) visibles++;
            });

            // Ocultar secciones cuyas preguntas quedaron todas filtradas
            secciones.forEach(seccion => {
                const tieneVisibles = seccion.querySelector('.faq-item:not([style*="display: none"])');
                seccion.style.display = tieneVisibles ? '' : 'none';
            });

            if (sinResultados) {
                sinResultados.style.display = visibles === 0 ? 'block' : 'none';
            }
        });
    }


    // ============================================================
    // 5. ANIMACIONES DE ENTRADA CON INTERSECTION OBSERVER
    // ============================================================
    const animables = document.querySelectorAll('.animar, .paso, .miembro-card');

    if (prefiereMenosMovimiento) {
        animables.forEach(el => el.classList.add('visible'));
    } else {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    observador.unobserve(entrada.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        animables.forEach(el => observador.observe(el));
    }


    // ============================================================
    // 6. SMOOTH SCROLL para anclas internas
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(ancla => {
        ancla.addEventListener('click', (e) => {
            const destino = document.querySelector(ancla.getAttribute('href'));
            if (destino) {
                e.preventDefault();
                const headerAltura = document.querySelector('.site-header')?.offsetHeight || 0;
                const top = destino.getBoundingClientRect().top + window.scrollY - headerAltura - 16;
                window.scrollTo({ top, behavior: prefiereMenosMovimiento ? 'auto' : 'smooth' });
            }
        });
    });


    // ============================================================
    // 7. CHECKLIST DE DOCUMENTOS (proceso.html)
    //    Guarda el avance en este navegador (localStorage).
    // ============================================================
    const checklist = document.querySelectorAll('.doc-check input[type="checkbox"]');

    if (checklist.length > 0) {
        const CLAVE = 'tribunal-checklist-docs';
        let guardado = {};
        try {
            guardado = JSON.parse(localStorage.getItem(CLAVE)) || {};
        } catch (_) { /* almacenamiento no disponible: la lista funciona sin memoria */ }

        const relleno = document.querySelector('.barra-progreso-relleno');
        const contador = document.querySelector('[data-checklist-contador]');

        const actualizar = () => {
            const total = checklist.length;
            const marcados = Array.from(checklist).filter(c => c.checked).length;
            if (relleno) relleno.style.width = `${(marcados / total) * 100}%`;
            if (contador) contador.textContent = `${marcados} de ${total}`;
        };

        checklist.forEach(casilla => {
            const id = casilla.dataset.doc;
            casilla.checked = !!guardado[id];
            casilla.closest('.doc-check').classList.toggle('marcado', casilla.checked);

            casilla.addEventListener('change', () => {
                guardado[id] = casilla.checked;
                casilla.closest('.doc-check').classList.toggle('marcado', casilla.checked);
                try {
                    localStorage.setItem(CLAVE, JSON.stringify(guardado));
                } catch (_) { /* sin almacenamiento */ }
                actualizar();
            });
        });

        actualizar();

        const btnImprimir = document.querySelector('.btn-imprimir');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => window.print());
        }
    }


    // ============================================================
    // 8. FORMULARIO DE CONTACTO — envío real vía FormSubmit
    // ============================================================
    const formulario = document.getElementById('formulario-contacto');

    if (formulario) {
        const campos = {
            nombre:   { requerido: true, minLen: 3,  pattern: null,                          msg: 'Por favor, ingrese su nombre completo (mínimo 3 caracteres).' },
            email:    { requerido: true, minLen: null, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Por favor, ingrese un correo electrónico válido.' },
            telefono: { requerido: false, minLen: null, pattern: /^[\d\s\+\-\(\)]{7,20}$/,   msg: 'Formato de teléfono no válido.' },
            consulta: { requerido: true, minLen: null, pattern: null,                         msg: 'Por favor, seleccione el tipo de consulta.' },
            mensaje:  { requerido: true, minLen: 15,  pattern: null,                          msg: 'El mensaje debe tener al menos 15 caracteres.' },
        };

        function validarCampo(id) {
            const config = campos[id];
            if (!config) return true;
            const el = formulario.querySelector(`[name="${id}"]`);
            if (!el) return true;

            const valor = el.value.trim();
            let error = '';

            if (config.requerido && !valor) {
                error = config.msg;
            } else if (valor && config.minLen && valor.length < config.minLen) {
                error = config.msg;
            } else if (valor && config.pattern && !config.pattern.test(valor)) {
                error = config.msg;
            }

            const spanError = formulario.querySelector(`[data-error="${id}"]`);
            if (spanError) spanError.textContent = error;
            el.classList.toggle('error', !!error);
            return !error;
        }

        // Validar al salir de cada campo
        Object.keys(campos).forEach(id => {
            const el = formulario.querySelector(`[name="${id}"]`);
            if (el) el.addEventListener('blur', () => validarCampo(id));
        });

        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();

            let valido = true;
            Object.keys(campos).forEach(id => {
                if (!validarCampo(id)) valido = false;
            });
            if (!valido) return;

            const btnSubmit = formulario.querySelector('.btn-submit');
            const msgExito = formulario.querySelector('.mensaje-exito');
            const msgError = formulario.querySelector('.mensaje-error');

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando…';
            if (msgExito) msgExito.style.display = 'none';
            if (msgError) msgError.style.display = 'none';

            try {
                const respuesta = await fetch(formulario.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(formulario)
                });

                if (!respuesta.ok) throw new Error('Respuesta no válida del servidor');

                formulario.reset();
                if (msgExito) msgExito.style.display = 'block';
            } catch (_) {
                if (msgError) msgError.style.display = 'block';
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar consulta';
            }
        });
    }


    // ============================================================
    // 9. AÑO ACTUAL EN EL PIE DE PÁGINA
    // ============================================================
    document.querySelectorAll('[data-anio]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });


    // ============================================================
    // 10. HEADER: efecto de sombra al hacer scroll
    // ============================================================
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            siteHeader.style.boxShadow = window.scrollY > 10
                ? '0 4px 20px rgba(0,0,0,0.35)'
                : '0 2px 12px rgba(0,0,0,0.25)';
        }, { passive: true });
    }

}); // fin DOMContentLoaded
