/**
 * TRIBUNAL ECLESIÁSTICO METROPOLITANO
 * Arquidiócesis de Maracaibo — Script principal v2.0
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

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
                const respuesta = otro.querySelector('.faq-respuesta');
                if (respuesta) respuesta.style.maxHeight = '0';
            });

            // Abrir el seleccionado si estaba cerrado
            if (!estaActivo) {
                item.classList.add('activo');
                const respuesta = item.querySelector('.faq-respuesta');
                if (respuesta) {
                    // Usar un valor generoso para evitar cortes en respuestas largas
                    respuesta.style.maxHeight = '2000px';
                }
            }
        });
    });


    // ============================================================
    // 4. ANIMACIONES DE ENTRADA CON INTERSECTION OBSERVER
    // ============================================================
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

    // Observar elementos con clase .animar, .paso, .miembro-card
    document.querySelectorAll('.animar, .paso, .miembro-card').forEach(el => {
        observador.observe(el);
    });


    // ============================================================
    // 5. SMOOTH SCROLL para anclas internas
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(ancla => {
        ancla.addEventListener('click', (e) => {
            const destino = document.querySelector(ancla.getAttribute('href'));
            if (destino) {
                e.preventDefault();
                const headerAltura = document.querySelector('.site-header')?.offsetHeight || 0;
                const top = destino.getBoundingClientRect().top + window.scrollY - headerAltura - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });


    // ============================================================
    // 6. VALIDACIÓN DEL FORMULARIO DE CONTACTO
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

        // Validar en tiempo real (al salir del campo)
        Object.keys(campos).forEach(id => {
            const el = formulario.querySelector(`[name="${id}"]`);
            if (el) el.addEventListener('blur', () => validarCampo(id));
        });

        // Submit
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            let valido = true;
            Object.keys(campos).forEach(id => {
                if (!validarCampo(id)) valido = false;
            });

            if (valido) {
                // Simulación de envío exitoso (sin backend)
                const btnSubmit = formulario.querySelector('.btn-submit');
                const msgExito = formulario.querySelector('.mensaje-exito');

                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Enviando…';

                setTimeout(() => {
                    formulario.reset();
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Enviar consulta';
                    if (msgExito) {
                        msgExito.style.display = 'block';
                        setTimeout(() => msgExito.style.display = 'none', 6000);
                    }
                }, 1200);
            }
        });
    }


    // ============================================================
    // 7. HEADER: efecto de sombra al hacer scroll
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
