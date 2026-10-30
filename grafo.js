const grafoEstado = {
    seleccion: null,
    busqueda: "",
    soloRama: false,
    escala: 1,
    x: 0,
    y: 0,
    modelo: null,
    posiciones: new Map(),
    inicializado: false,
    firma: "",
    resize: null,
    propagacion: null,
    numeroPropagacion: 0,
    maximizado: false,
    scrollAntesMax: null,
};
const GRAFO = { ancho: 218, alto: 100, pasoX: 480, pasoY: 172, margen: 36 };
const GRAFO_PROPAGACION = {
    espera: 90,
    tramo: 320,
    pausa: 50,
    extension: 180,
    maxTramo: 900,
    maxFrame: 48,
};
const grafoEstados = ["deshabilitada", "habilitada", "aprobada", "exonerada"];
const grafoTextosEstado = [
    "No habilitada",
    "Habilitada",
    "Curso aprobado",
    "Exonerada",
];

function grafoElemento(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
}

function grafoSvg(tag, atributos = {}, texto) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(atributos).forEach(([clave, valor]) =>
        el.setAttribute(clave, valor),
    );
    if (texto !== undefined) el.textContent = texto;
    return el;
}

function grafoLeerRegla(
    regla,
    destino,
    aristas,
    indicadores,
    alternativa = false,
) {
    if (!regla) return;
    if (regla.tipo === "negar") {
        indicadores.restricciones = true;
        return;
    }
    if (regla.tipo === "predicado") {
        const match = /^(aprobada|exonerada):(.+)$/.exec(regla.id);
        if (match) {
            aristas.push({ origen: match[2], destino, tipo: match[1], alternativa });
        } else if (regla.id.startsWith("creditos:")) {
            indicadores.creditos = true;
        }
        return;
    }
    if (regla.tipo === "alguna") indicadores.alternativas = true;
    (regla.reglas || []).forEach((r) =>
        grafoLeerRegla(
            r,
            destino,
            aristas,
            indicadores,
            alternativa || regla.tipo === "alguna",
        ),
    );
}

function grafoConstruirModelo() {
    const materias = Materias.filter(
        (m) => seleccionOpcionales || !materiaEsOpcional(m),
    );
    const ids = new Set(materias.map((m) => m.nombre));
    const indicadores = new Map();
    const referencias = [];
    materias.forEach((m) => {
        const info = {};
        grafoLeerRegla(m.reglaHabilitacion, m.nombre, referencias, info);
        indicadores.set(m.nombre, info);
    });
    const unicas = new Map();
    referencias
        .filter((a) => ids.has(a.origen))
        .forEach((a) => {
            const clave = `${a.origen}:${a.destino}:${a.tipo}`;
            const anterior = unicas.get(clave);
            unicas.set(clave, {
                ...a,
                alternativa: anterior
                    ? anterior.alternativa && a.alternativa
                    : a.alternativa,
            });
        });
    return { materias, ids, aristas: [...unicas.values()], indicadores };
}

function grafoDistancias(nombre, direccion) {
    const distancias = new Map([[nombre, 0]]);
    const pendientes = [nombre];
    for (let indice = 0; indice < pendientes.length; indice++) {
        const actual = pendientes[indice];
        grafoEstado.modelo.aristas.forEach((a) => {
            const desde = direccion === "previas" ? a.destino : a.origen;
            const hacia = direccion === "previas" ? a.origen : a.destino;
            if (desde === actual && !distancias.has(hacia)) {
                distancias.set(hacia, distancias.get(actual) + 1);
                pendientes.push(hacia);
            }
        });
    }
    return distancias;
}

function grafoRecorrido(nombre, direccion) {
    return new Set(grafoDistancias(nombre, direccion).keys());
}

function grafoRama() {
    if (!grafoEstado.seleccion) return new Set();
    return new Set([
        ...grafoRecorrido(grafoEstado.seleccion, "previas"),
        ...grafoRecorrido(grafoEstado.seleccion, "siguientes"),
    ]);
}

function grafoDistribuir(materias, aristas) {
    const niveles = new Map();
    materias.forEach((m) => {
        const nivel = Math.max(0, m.peso - 1);
        if (!niveles.has(nivel)) niveles.set(nivel, []);
        niveles.get(nivel).push(m);
    });
    const ordenNiveles = [...niveles.keys()].sort((a, b) => a - b);
    const orden = new Map();
    niveles.forEach((grupo) => grupo.forEach((m, i) => orden.set(m.nombre, i)));
    for (let vuelta = 0; vuelta < 6; vuelta++) {
        const adelante = vuelta % 2 === 0;
        (adelante ? ordenNiveles : [...ordenNiveles].reverse()).forEach((nivel) => {
            const vecinos = (nombre) =>
                aristas
                    .filter((a) => (adelante ? a.destino : a.origen) === nombre)
                    .map((a) => orden.get(adelante ? a.origen : a.destino))
                    .filter((n) => n !== undefined);
            const centro = (nombre) => {
                const valores = vecinos(nombre);
                return valores.length
                    ? valores.reduce((a, b) => a + b, 0) / valores.length
                    : orden.get(nombre);
            };
            niveles.get(nivel).sort((a, b) => centro(a.nombre) - centro(b.nombre));
            niveles.get(nivel).forEach((m, i) => orden.set(m.nombre, i));
        });
    }
    const posiciones = new Map();
    const maxFilas = Math.max(1, ...[...niveles.values()].map((g) => g.length));
    ordenNiveles.forEach((nivel, columna) => {
        const grupo = niveles.get(nivel);
        const obligatorias = grupo.filter((m) => !materiaEsOpcional(m));
        let ordenCentrado = grupo;
        let primeraFila = Math.floor((maxFilas - grupo.length) / 2);
        if (obligatorias.length) {
            const opcionales = grupo.filter((m) => materiaEsOpcional(m));
            const arriba = Math.floor(opcionales.length / 2);
            ordenCentrado = [
                ...opcionales.slice(0, arriba),
                ...obligatorias,
                ...opcionales.slice(arriba),
            ];
            primeraFila = Math.floor((maxFilas - obligatorias.length) / 2) - arriba;
        }
        ordenCentrado.forEach((m, fila) =>
            posiciones.set(m.nombre, {
                x: GRAFO.margen + columna * GRAFO.pasoX,
                y: GRAFO.margen + 36 + (primeraFila + fila) * GRAFO.pasoY,
            }),
        );
    });
    return {
        posiciones,
        niveles: ordenNiveles,
        filas: maxFilas,
        ancho:
            GRAFO.margen * 2 +
            Math.max(0, niveles.size - 1) * GRAFO.pasoX +
            GRAFO.ancho,
        alto: GRAFO.margen * 2 + 36 + (maxFilas - 1) * GRAFO.pasoY + GRAFO.alto,
    };
}

function grafoClaveArista(arista) {
    return `${arista.origen}:${arista.destino}:${arista.tipo}`;
}

function grafoRedondearRuta(puntos) {
    const ruta = puntos.filter(
        (p, i) => !i || p.x !== puntos[i - 1].x || p.y !== puntos[i - 1].y,
    );
    let d = `M ${ruta[0].x} ${ruta[0].y}`;
    for (let i = 1; i < ruta.length - 1; i++) {
        const anterior = ruta[i - 1],
            actual = ruta[i],
            siguiente = ruta[i + 1];
        const entrada = Math.hypot(actual.x - anterior.x, actual.y - anterior.y);
        const salida = Math.hypot(siguiente.x - actual.x, siguiente.y - actual.y);
        const radio = Math.min(7, entrada / 2, salida / 2);
        const antes = {
            x: actual.x - ((actual.x - anterior.x) / entrada) * radio,
            y: actual.y - ((actual.y - anterior.y) / entrada) * radio,
        };
        const despues = {
            x: actual.x + ((siguiente.x - actual.x) / salida) * radio,
            y: actual.y + ((siguiente.y - actual.y) / salida) * radio,
        };
        d += ` L ${antes.x} ${antes.y} Q ${actual.x} ${actual.y} ${despues.x} ${despues.y}`;
    }
    const ultimo = ruta[ruta.length - 1];
    return `${d} L ${ultimo.x} ${ultimo.y}`;
}

function grafoTrazarConexiones(layout, aristas) {
    const rutas = new Map();
    const salidas = new Map(),
        entradas = new Map();
    const puertosSalida = new Map(),
        puertosEntrada = new Map();
    aristas.forEach((a) => {
        if (!salidas.has(a.origen)) salidas.set(a.origen, []);
        if (!entradas.has(a.destino)) entradas.set(a.destino, []);
        salidas.get(a.origen).push(a);
        entradas.get(a.destino).push(a);
    });
    const asignarPuertos = (grupos, puertos, extremo) =>
        grupos.forEach((grupo) => {
            grupo.sort((a, b) => {
                const pa = layout.posiciones.get(a[extremo]),
                    pb = layout.posiciones.get(b[extremo]);
                return (
                    pa.y - pb.y ||
                    pa.x - pb.x ||
                    grafoClaveArista(a).localeCompare(grafoClaveArista(b))
                );
            });
            const paso = Math.min(14, 60 / Math.max(1, grupo.length - 1));
            grupo.forEach((a, i) =>
                puertos.set(grafoClaveArista(a), (i - (grupo.length - 1) / 2) * paso),
            );
        });
    asignarPuertos(salidas, puertosSalida, "destino");
    asignarPuertos(entradas, puertosEntrada, "origen");

    const inicioY = GRAFO.margen + 36;
    const carrilesY = [inicioY - 20];
    for (let fila = 0; fila < layout.filas - 1; fila++) {
        [18, 30, 42, 54].forEach((offset) =>
            carrilesY.push(inicioY + fila * GRAFO.pasoY + GRAFO.alto + offset),
        );
    }
    carrilesY.push(inicioY + (layout.filas - 1) * GRAFO.pasoY + GRAFO.alto + 20);
    const ocupacionHorizontal = new Map(),
        ocupacionVertical = new Map();
    const solapamientos = (ocupacion, carril, desde, hasta) => {
        const min = Math.min(desde, hasta),
            max = Math.max(desde, hasta);
        return (ocupacion.get(carril) || []).filter(
            (segmento) => min < segmento.max + 12 && max > segmento.min - 12,
        ).length;
    };
    const reservar = (ocupacion, carril, desde, hasta) => {
        if (desde === hasta) return;
        if (!ocupacion.has(carril)) ocupacion.set(carril, []);
        ocupacion
            .get(carril)
            .push({ min: Math.min(desde, hasta), max: Math.max(desde, hasta) });
    };
    const carrilVertical = (columnaX, desdeY, hastaY, preferido) => {
        const min = columnaX + GRAFO.ancho + 24;
        const max = columnaX + GRAFO.pasoX - 24;
        let mejor = min,
            costo = Infinity;
        for (let x = min; x <= max; x += 14) {
            const actual =
                solapamientos(ocupacionVertical, x, desdeY, hastaY) * 240 +
                Math.abs(x - preferido) * 0.2;
            if (actual < costo) {
                mejor = x;
                costo = actual;
            }
        }
        reservar(ocupacionVertical, mejor, desdeY, hastaY);
        return mejor;
    };
    const ordenadas = [...aristas].sort((a, b) => {
        const a1 = layout.posiciones.get(a.origen),
            a2 = layout.posiciones.get(a.destino);
        const b1 = layout.posiciones.get(b.origen),
            b2 = layout.posiciones.get(b.destino);
        return (
            a2.x - a1.x - (b2.x - b1.x) ||
            a1.y - b1.y ||
            a2.y - b2.y ||
            grafoClaveArista(a).localeCompare(grafoClaveArista(b))
        );
    });
    ordenadas.forEach((a) => {
        const clave = grafoClaveArista(a);
        const desde = layout.posiciones.get(a.origen),
            hasta = layout.posiciones.get(a.destino);
        const inicio = {
            x: desde.x + GRAFO.ancho,
            y: desde.y + GRAFO.alto / 2 + puertosSalida.get(clave),
        };
        const fin = {
            x: hasta.x - 4,
            y: hasta.y + GRAFO.alto / 2 + puertosEntrada.get(clave),
        };
        let puntos;
        if (hasta.x - desde.x <= GRAFO.pasoX) {
            const x = carrilVertical(
                desde.x,
                inicio.y,
                fin.y,
                (inicio.x + fin.x) / 2,
            );
            puntos = [inicio, { x, y: inicio.y }, { x, y: fin.y }, fin];
        } else {
            let y = carrilesY[0],
                costo = Infinity;
            carrilesY.forEach((carril) => {
                const actual =
                    Math.abs(carril - inicio.y) +
                    Math.abs(carril - fin.y) +
                    Math.abs(carril - (inicio.y + fin.y) / 2) * 0.15 +
                    solapamientos(ocupacionHorizontal, carril, inicio.x, fin.x) * 320;
                if (actual < costo) {
                    y = carril;
                    costo = actual;
                }
            });
            const salidaX = carrilVertical(desde.x, inicio.y, y, inicio.x + 48);
            const entradaX = carrilVertical(
                hasta.x - GRAFO.pasoX,
                y,
                fin.y,
                fin.x - 48,
            );
            puntos = [
                inicio,
                { x: salidaX, y: inicio.y },
                { x: salidaX, y },
                { x: entradaX, y },
                { x: entradaX, y: fin.y },
                fin,
            ];
            reservar(ocupacionHorizontal, y, salidaX, entradaX);
        }
        rutas.set(clave, { puntos, d: grafoRedondearRuta(puntos) });
    });
    return rutas;
}

function grafoInicializar() {
    const contenedor = document.getElementById("vista-grafo");
    contenedor.innerHTML = `
    <div class="grafo-espacio">
      <div class="grafo-lienzo">
        <div class="grafo-barra-superior">
          <div class="grafo-herramientas">
            <div class="grafo-buscador"><label for="grafo-buscar" class="grafo-solo-lectores">Buscar en el árbol</label>
              <input type="search" id="grafo-buscar" placeholder="Buscar materia" autocomplete="off" aria-controls="grafo-resultados">
              <div id="grafo-resultados" aria-live="polite" hidden></div>
            </div>
            <label class="grafo-rama-control"><input type="checkbox" id="grafo-solo-rama" disabled> Solo su recorrido</label>
            <button type="button" id="grafo-ver-todo">Ver todo el árbol</button>
          </div>
          <div class="grafo-acciones">
            <button type="button" id="grafo-mas-info" hidden>Más info</button>
            <button type="button" id="grafo-maximizar" aria-label="Maximizar mapa" title="Maximizar mapa" aria-pressed="false">
              <svg class="grafo-icono-maximizar" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>
              <svg class="grafo-icono-restaurar" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h5V4M20 9h-5V4M15 20v-5h5M9 20v-5H4"/></svg>
            </button>
          </div>
        </div>
        <svg id="grafo-svg" tabindex="0" role="group" aria-label="Grafo de previas. Usá las flechas para desplazar, más y menos para zoom y Escape para quitar la selección.">
          <defs>
            <marker id="grafo-flecha-aprobada" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="grafo-punta-curso"/></marker>
            <marker id="grafo-flecha-exonerada" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="grafo-punta-exoneracion"/></marker>
          </defs>
          <g id="grafo-escena"></g>
        </svg>
        <div class="grafo-zoom-controles" role="group" aria-label="Controles del mapa">
          <button type="button" id="grafo-alejar" aria-label="Alejar" title="Alejar">−</button>
          <output id="grafo-zoom" aria-label="Nivel de zoom">100%</output>
          <button type="button" id="grafo-acercar" aria-label="Acercar" title="Acercar">+</button>
          <button type="button" id="grafo-ajustar" title="Ajustar todo el mapa a la pantalla">Ajustar</button>
        </div>
        <p id="grafo-vacio" hidden>No hay materias para mostrar con esta configuración.</p>
      </div>
    </div>`;
    document.getElementById("grafo-buscar").addEventListener("input", (event) => {
        grafoEstado.busqueda = event.target.value;
        grafoBuscar();
        if (!grafoEstado.propagacion) grafoResaltar();
    });
    document
        .getElementById("grafo-buscar")
        .addEventListener("keydown", (event) => {
            if (event.key === "Enter")
                document.querySelector("#grafo-resultados button")?.click();
        });
    document
        .getElementById("grafo-solo-rama")
        .addEventListener("change", (event) => {
            grafoEstado.soloRama = event.target.checked;
            grafoDibujar(true);
            grafoActualizarMasInfo();
        });
    document.getElementById("grafo-ver-todo").onclick = grafoLimpiar;
    document.getElementById("grafo-mas-info").onclick = () => {
        if (grafoEstado.modelo.ids.has(grafoEstado.seleccion))
            popUpGeneral(grafoEstado.seleccion, "previas");
    };
    document.getElementById("grafo-maximizar").onclick = () =>
        grafoMaximizar(!grafoEstado.maximizado);
    document.getElementById("grafo-acercar").onclick = () => grafoZoom(1.25);
    document.getElementById("grafo-alejar").onclick = () => grafoZoom(0.8);
    document.getElementById("grafo-ajustar").onclick = () => grafoAjustar();
    grafoConfigurarGestos();
    grafoEstado.resize = new ResizeObserver(() => {
        if (vistaGrafoActiva && grafoEstado.encuadreCompleto) grafoAjustar();
    });
    grafoEstado.resize.observe(document.getElementById("grafo-svg"));
    grafoEstado.resizeMarco = new ResizeObserver(grafoActualizarMaximizado);
    grafoEstado.resizeMarco.observe(document.querySelector("header"));
    grafoEstado.resizeMarco.observe(document.getElementById("secciones"));
    window.addEventListener("resize", grafoActualizarMaximizado);
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !== "Escape" ||
                !vistaGrafoActiva ||
                !grafoEstado.maximizado
            )
                return;
            if (
                getComputedStyle(document.getElementById("popup-container")).display !==
                "none"
            )
                return;
            event.preventDefault();
            event.stopPropagation();
            grafoMaximizar(false);
        },
        true,
    );
    grafoEstado.inicializado = true;
}

function grafoActualizarMaximizado() {
    if (!grafoEstado.maximizado) return;
    const vista = document.getElementById("vista-grafo");
    const encabezado = document.querySelector("header").getBoundingClientRect();
    const secciones = document
        .getElementById("secciones")
        .getBoundingClientRect();
    vista.style.setProperty(
        "--grafo-max-arriba",
        `${Math.max(0, encabezado.bottom)}px`,
    );
    vista.style.setProperty(
        "--grafo-max-izquierda",
        `${Math.max(0, secciones.left)}px`,
    );
}

function grafoMaximizar(activar) {
    if (!grafoEstado.inicializado || activar === grafoEstado.maximizado) return;
    const vista = document.getElementById("vista-grafo");
    const secciones = document.getElementById("secciones");
    if (activar) {
        grafoEstado.scrollAntesMax = {
            x: window.scrollX,
            y: window.scrollY,
            secciones: secciones.scrollTop,
        };
        vista.style.minHeight = `${vista.getBoundingClientRect().height}px`;
    }
    grafoEstado.maximizado = activar;
    vista.classList.toggle("grafo-maximizado", activar);
    document.body.classList.toggle("grafo-mapa-expandido", activar);
    secciones.classList.toggle("grafo-mapa-expandido", activar);
    const boton = document.getElementById("grafo-maximizar");
    boton.setAttribute("aria-pressed", String(activar));
    boton.setAttribute(
        "aria-label",
        activar ? "Restaurar mapa" : "Maximizar mapa",
    );
    boton.title = activar ? "Restaurar mapa" : "Maximizar mapa";
    if (activar) grafoActualizarMaximizado();
    else {
        vista.style.removeProperty("min-height");
        if (grafoEstado.scrollAntesMax) {
            secciones.scrollTop = grafoEstado.scrollAntesMax.secciones;
            window.scrollTo(
                grafoEstado.scrollAntesMax.x,
                grafoEstado.scrollAntesMax.y,
            );
        }
    }
}

function renderizarGrafoSiActivo() {
    if (vistaGrafoActiva) renderizarGrafo();
}

function renderizarGrafo() {
    if (!grafoEstado.inicializado) grafoInicializar();
    grafoEstado.modelo = grafoConstruirModelo();
    if (!grafoEstado.modelo.ids.has(grafoEstado.seleccion)) {
        grafoEstado.seleccion = null;
        grafoEstado.soloRama = false;
    }
    const firma = JSON.stringify([
        grafoEstado.modelo.materias.map((m) => [m.nombre, m.peso, materiaEsOpcional(m)]),
        grafoEstado.modelo.aristas,
    ]);
    const primeraVista = !grafoEstado.firma;
    const ajustar = firma !== grafoEstado.firma;
    grafoEstado.firma = firma;
    grafoDibujar(ajustar);
    if (primeraVista) grafoInicio();
    grafoBuscar();
    grafoActualizarMasInfo();
}

function grafoDibujar(ajustar = false) {
    grafoCancelarPropagacion();
    const modelo = grafoEstado.modelo;
    const rama = grafoRama();
    const materias = modelo.materias.filter(
        (m) => !grafoEstado.soloRama || rama.has(m.nombre),
    );
    const visibles = new Set(materias.map((m) => m.nombre));
    const aristas = modelo.aristas.filter(
        (a) => visibles.has(a.origen) && visibles.has(a.destino),
    );
    const layout = grafoDistribuir(modelo.materias, modelo.aristas);
    const rutas = grafoTrazarConexiones(layout, modelo.aristas);
    if (grafoEstado.soloRama && materias.length) {
        const posiciones = materias.map((m) => layout.posiciones.get(m.nombre));
        const puntos = aristas.flatMap(
            (a) => rutas.get(grafoClaveArista(a)).puntos,
        );
        const minX = Math.min(
            ...posiciones.map((p) => p.x),
            ...puntos.map((p) => p.x),
        );
        const minY = Math.min(
            ...posiciones.map((p) => p.y),
            ...puntos.map((p) => p.y),
        );
        layout.limites = {
            x: minX - GRAFO.margen,
            y: minY - GRAFO.margen,
            ancho:
                Math.max(
                    ...posiciones.map((p) => p.x + GRAFO.ancho),
                    ...puntos.map((p) => p.x),
                ) -
                minX +
                GRAFO.margen * 2,
            alto:
                Math.max(
                    ...posiciones.map((p) => p.y + GRAFO.alto),
                    ...puntos.map((p) => p.y),
                ) -
                minY +
                GRAFO.margen * 2,
        };
    }
    grafoEstado.posiciones = layout.posiciones;
    grafoEstado.layout = layout;
    const escena = document.getElementById("grafo-escena");
    escena.replaceChildren();
    layout.niveles.forEach((nivel, i) => {
        escena.append(
            grafoSvg(
                "text",
                { x: GRAFO.margen + i * GRAFO.pasoX, y: 28, class: "grafo-nivel" },
                `NIVEL ${nivel + 1}`,
            ),
        );
    });
    aristas.forEach((a) => {
        const path = grafoSvg("path", {
            d: rutas.get(grafoClaveArista(a)).d,
            class: `grafo-arista${a.alternativa ? " es-alternativa" : ""}`,
            "data-origen": a.origen,
            "data-destino": a.destino,
            "data-tipo": a.tipo,
            "marker-end": `url(#grafo-flecha-${a.tipo})`,
        });
        path.append(
            grafoSvg(
                "title",
                {},
                `${a.origen} → ${a.destino}: ${a.tipo === "aprobada" ? "curso aprobado" : "exoneración"}${a.alternativa ? " (parte de una alternativa)" : ""}`,
            ),
        );
        escena.append(path);
    });
    materias.forEach((m) => {
        const p = layout.posiciones.get(m.nombre);
        const nodo = grafoSvg("g", {
            transform: `translate(${p.x} ${p.y})`,
            class: "grafo-nodo",
            "data-materia": m.nombre,
            "data-estado": grafoEstados[m.estado],
            role: "button",
            tabindex: "0",
            "aria-label": `${m.nombreCompleto}, ${grafoTextosEstado[m.estado]}. Ver sus previas y siguientes materias.`,
        });
        nodo.append(grafoSvg("title", {}, m.nombreCompleto));
        nodo.append(
            grafoSvg("rect", {
                width: GRAFO.ancho,
                height: GRAFO.alto,
                rx: 10,
                class: "grafo-tarjeta",
            }),
        );
        nodo.append(
            grafoSvg("rect", {
                x: 0,
                y: 13,
                width: 4,
                height: 74,
                rx: 2,
                class: "grafo-estado",
            }),
        );
        const contenido = grafoSvg("foreignObject", {
            x: 14,
            y: 10,
            width: GRAFO.ancho - 28,
            height: GRAFO.alto - 20,
        });
        contenido.append(grafoElemento("div", "grafo-nombre", m.nombreCompleto));
        nodo.append(contenido);
        const seleccionar = () => grafoSeleccionar(m.nombre);
        nodo.addEventListener("click", (event) => {
            if (!grafoEstado.arrastrado) {
                event.stopPropagation();
                seleccionar();
            }
        });
        nodo.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                seleccionar();
            }
        });
        escena.append(nodo);
    });
    document.getElementById("grafo-vacio").hidden = materias.length !== 0;
    const checkbox = document.getElementById("grafo-solo-rama");
    checkbox.disabled = !grafoEstado.seleccion;
    checkbox.checked = grafoEstado.soloRama;
    grafoResaltar();
    if (ajustar) grafoAjustar();
    else grafoTransformar();
}

function grafoResaltar(animar = false) {
    grafoCancelarPropagacion();
    const rama = grafoRama();
    const texto = normalizarTexto(grafoEstado.busqueda.trim());
    document.querySelectorAll(".grafo-nodo").forEach((nodo) => {
        const id = nodo.dataset.materia;
        const m = materiasPorNombre.get(id);
        nodo.classList.remove("propagacion-encendida");
        nodo.classList.toggle("seleccionado", id === grafoEstado.seleccion);
        nodo.setAttribute("aria-pressed", String(id === grafoEstado.seleccion));
        nodo.classList.toggle("atenuado", !!grafoEstado.seleccion && !rama.has(id));
        nodo.classList.toggle(
            "coincidencia",
            !grafoEstado.seleccion &&
            !!texto &&
            normalizarTexto(`${id} ${m.nombreCompleto}`).includes(texto),
        );
    });
    const previas = grafoEstado.seleccion
        ? grafoRecorrido(grafoEstado.seleccion, "previas")
        : new Set();
    const siguientes = grafoEstado.seleccion
        ? grafoRecorrido(grafoEstado.seleccion, "siguientes")
        : new Set();
    document.querySelectorAll(".grafo-arista").forEach((arista) => {
        const { origen, destino } = arista.dataset;
        const relacionada =
            (previas.has(origen) && previas.has(destino)) ||
            (siguientes.has(origen) && siguientes.has(destino));
        arista.classList.toggle(
            "atenuado",
            !!grafoEstado.seleccion && !relacionada,
        );
        arista.classList.toggle(
            "resaltada",
            !!grafoEstado.seleccion && relacionada,
        );
    });
    if (
        animar &&
        grafoEstado.seleccion &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        grafoAnimarPropagacion();
    }
}

function grafoCancelarPropagacion() {
    const animacion = grafoEstado.propagacion;
    if (!animacion) return;
    cancelAnimationFrame(animacion.frame);
    animacion.capa.remove();
    animacion.mascaras.forEach((mascara) => mascara.remove());
    grafoEstado.propagacion = null;
    document.getElementById("grafo-svg")?.removeAttribute("data-propagando");
}

function grafoAnimarPropagacion() {
    const svg = document.getElementById("grafo-svg");
    const escena = document.getElementById("grafo-escena");
    const defs = svg.querySelector("defs");
    const previas = grafoDistancias(grafoEstado.seleccion, "previas");
    const siguientes = grafoDistancias(grafoEstado.seleccion, "siguientes");
    const { espera, tramo, pausa, extension, maxTramo, maxFrame } =
        GRAFO_PROPAGACION;
    const capa = grafoSvg("g", {
        class: "grafo-propagacion",
        "aria-hidden": "true",
    });
    escena.insertBefore(capa, escena.querySelector(".grafo-nodo"));
    const animacion = {
        frame: null,
        ultimoFrame: null,
        transcurrido: 0,
        capa,
        mascaras: [],
        nodos: [],
        aristas: [],
    };
    const numero = ++grafoEstado.numeroPropagacion;
    grafoEstado.propagacion = animacion;
    svg.dataset.propagando = "true";

    escena.querySelectorAll(".grafo-arista").forEach((arista, indice) => {
        const { origen, destino } = arista.dataset;
        const haciaSiguientes = siguientes.has(origen) && siguientes.has(destino);
        const haciaPrevias = previas.has(origen) && previas.has(destino);
        arista.classList.remove("resaltada");
        arista.classList.add("atenuado");
        if (!haciaSiguientes && !haciaPrevias) return;
        const inversa = !haciaSiguientes;
        const longitudRelativa = Math.max(
            1,
            arista.getTotalLength() / (GRAFO.pasoX - GRAFO.ancho),
        );
        const duracion = Math.min(
            maxTramo,
            tramo + extension * (Math.sqrt(longitudRelativa) - 1),
        );
        const caja = arista.getBBox();
        const id = `grafo-propagacion-${numero}-${indice}`;
        const mascara = grafoSvg("mask", {
            id,
            maskUnits: "userSpaceOnUse",
            maskContentUnits: "userSpaceOnUse",
            x: caja.x - 24,
            y: caja.y - 24,
            width: caja.width + 48,
            height: caja.height + 48,
        });
        const revelado = grafoSvg("path", {
            d: arista.getAttribute("d"),
            pathLength: 1,
            fill: "none",
            stroke: "white",
            "stroke-width": 30,
            "stroke-linecap": "butt",
            "stroke-linejoin": "round",
            "stroke-dasharray": "1 1",
            "stroke-dashoffset": inversa ? -1 : 1,
        });
        mascara.append(revelado);
        defs.append(mascara);
        animacion.mascaras.push(mascara);
        const trazo = arista.cloneNode(false);
        trazo.setAttribute(
            "class",
            `grafo-propagacion-trazo${arista.classList.contains("es-alternativa") ? " es-alternativa" : ""}`,
        );
        trazo.setAttribute("mask", `url(#${id})`);
        trazo.style.opacity = "0";
        capa.append(trazo);
        animacion.aristas.push({
            arista,
            trazo,
            mascara,
            revelado,
            inversa,
            duracion,
            terminada: false,
            desde: inversa ? destino : origen,
            hasta: inversa ? origen : destino,
        });
    });

    const llegadas = new Map([[grafoEstado.seleccion, 0]]);
    const pendientes = new Set([grafoEstado.seleccion]);
    while (pendientes.size) {
        const actual = [...pendientes].reduce((a, b) =>
            llegadas.get(a) <= llegadas.get(b) ? a : b,
        );
        pendientes.delete(actual);
        const salida =
            actual === grafoEstado.seleccion ? espera : llegadas.get(actual) + pausa;
        animacion.aristas
            .filter((conexion) => conexion.desde === actual)
            .forEach((conexion) => {
                const llegada = salida + conexion.duracion;
                if (llegada < (llegadas.get(conexion.hasta) ?? Infinity)) {
                    llegadas.set(conexion.hasta, llegada);
                    pendientes.add(conexion.hasta);
                }
            });
    }
    animacion.aristas.forEach((conexion) => {
        conexion.salida =
            conexion.desde === grafoEstado.seleccion
                ? espera
                : llegadas.get(conexion.desde) + pausa;
    });
    escena.querySelectorAll(".grafo-nodo").forEach((nodo) => {
        const nombre = nodo.dataset.materia;
        const central = nombre === grafoEstado.seleccion;
        nodo.classList.toggle("atenuado", !central);
        nodo.classList.toggle("propagacion-encendida", central);
        if (!central && llegadas.has(nombre)) {
            animacion.nodos.push({
                nodo,
                llegada: llegadas.get(nombre),
                encendido: false,
            });
        }
    });

    const avanzar = (tiempo) => {
        if (grafoEstado.propagacion !== animacion) return;
        if (!vistaGrafoActiva) {
            grafoCancelarPropagacion();
            return;
        }
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            grafoResaltar();
            return;
        }
        if (animacion.ultimoFrame !== null) {
            animacion.transcurrido += Math.min(
                maxFrame,
                Math.max(0, tiempo - animacion.ultimoFrame),
            );
        }
        animacion.ultimoFrame = tiempo;
        const transcurrido = animacion.transcurrido;
        animacion.aristas.forEach((conexion) => {
            if (conexion.terminada || transcurrido < conexion.salida) return;
            const progreso = Math.min(
                1,
                (transcurrido - conexion.salida) / conexion.duracion,
            );
            conexion.trazo.style.opacity = "1";
            conexion.revelado.setAttribute(
                "stroke-dashoffset",
                (conexion.inversa ? -1 : 1) * (1 - progreso),
            );
            if (progreso === 1) {
                conexion.arista.classList.remove("atenuado");
                conexion.arista.classList.add("resaltada");
                conexion.trazo.remove();
                conexion.mascara.remove();
                conexion.terminada = true;
            }
        });
        animacion.nodos.forEach((paso) => {
            if (!paso.encendido && transcurrido >= paso.llegada) {
                paso.nodo.classList.remove("atenuado");
                paso.nodo.classList.add("propagacion-encendida");
                paso.encendido = true;
            }
        });
        if (
            animacion.aristas.every((conexion) => conexion.terminada) &&
            animacion.nodos.every((paso) => paso.encendido)
        ) {
            grafoCancelarPropagacion();
            return;
        }
        animacion.frame = requestAnimationFrame(avanzar);
    };
    animacion.frame = requestAnimationFrame(avanzar);
}

function grafoBuscar() {
    const resultados = document.getElementById("grafo-resultados");
    resultados.replaceChildren();
    const texto = normalizarTexto(grafoEstado.busqueda.trim());
    resultados.hidden = !texto;
    if (!texto) return;
    const coincidencias = grafoEstado.modelo.materias.filter((m) =>
        normalizarTexto(`${m.nombre} ${m.nombreCompleto}`).includes(texto),
    );
    if (!coincidencias.length)
        resultados.append(
            grafoElemento(
                "p",
                "",
                "No se encontraron materias. Revisá el nombre o activá las opcionales.",
            ),
        );
    coincidencias.forEach((m) => {
        const boton = grafoElemento(
            "button",
            "grafo-resultado",
            m.nombreCompleto,
        );
        boton.type = "button";
        boton.dataset.materia = m.nombre;
        boton.onclick = () => {
            grafoSeleccionar(m.nombre);
            resultados.hidden = true;
        };
        resultados.append(boton);
    });
}

function grafoSeleccionar(nombre) {
    if (!grafoEstado.modelo.ids.has(nombre)) return;
    grafoEstado.encuadreCompleto = false;
    const deseleccionar = grafoEstado.seleccion === nombre;
    const redibujar = grafoEstado.soloRama;
    grafoEstado.seleccion = deseleccionar ? null : nombre;
    if (deseleccionar) grafoEstado.soloRama = false;
    if (redibujar) grafoDibujar(false);
    grafoResaltar(!deseleccionar);
    const checkbox = document.getElementById("grafo-solo-rama");
    checkbox.disabled = deseleccionar;
    checkbox.checked = grafoEstado.soloRama;
    grafoActualizarMasInfo();
}

function grafoLimpiar() {
    grafoEstado.seleccion = null;
    grafoEstado.busqueda = "";
    grafoEstado.soloRama = false;
    document.getElementById("grafo-buscar").value = "";
    grafoBuscar();
    grafoDibujar(true);
    grafoActualizarMasInfo();
}

function grafoActualizarMasInfo() {
    const boton = document.getElementById("grafo-mas-info");
    const materia = grafoEstado.modelo?.ids.has(grafoEstado.seleccion)
        ? materiasPorNombre.get(grafoEstado.seleccion)
        : null;
    boton.hidden = !materia;
    if (materia) {
        boton.dataset.materia = materia.nombre;
        boton.title = "Más información de " + materia.nombreCompleto;
        boton.setAttribute("aria-label", "Más info de " + materia.nombreCompleto);
    } else {
        delete boton.dataset.materia;
        boton.removeAttribute("title");
        boton.removeAttribute("aria-label");
    }
}

function grafoTransformar() {
    document
        .getElementById("grafo-escena")
        .setAttribute(
            "transform",
            `translate(${grafoEstado.x} ${grafoEstado.y}) scale(${grafoEstado.escala})`,
        );
    document.getElementById("grafo-zoom").textContent =
        `${Math.round(grafoEstado.escala * 100)}%`;
}

function grafoAjustar() {
    const svg = document.getElementById("grafo-svg");
    if (!svg?.clientWidth || !svg.clientHeight || !grafoEstado.layout) return;
    const {
        ancho,
        alto,
        x = 0,
        y = 0,
    } = grafoEstado.layout.limites || grafoEstado.layout;
    grafoEstado.escala = Math.min(
        1,
        (svg.clientWidth - 32) / ancho,
        (svg.clientHeight - 96) / alto,
    );
    grafoEstado.x =
        (svg.clientWidth - ancho * grafoEstado.escala) / 2 - x * grafoEstado.escala;
    grafoEstado.y =
        (svg.clientHeight - alto * grafoEstado.escala) / 2 - y * grafoEstado.escala;
    grafoEstado.encuadreCompleto = true;
    grafoTransformar();
}

function grafoCentrar(nombre) {
    const p = grafoEstado.posiciones.get(nombre);
    if (!p) return;
    const svg = document.getElementById("grafo-svg");
    grafoEstado.x =
        svg.clientWidth / 2 - (p.x + GRAFO.ancho / 2) * grafoEstado.escala;
    grafoEstado.y =
        svg.clientHeight / 2 - (p.y + GRAFO.alto / 2) * grafoEstado.escala;
    grafoEstado.encuadreCompleto = false;
    grafoTransformar();
}

function grafoInicio() {
    const iniciales = grafoEstado.modelo.materias.filter(
        (m) =>
            m.peso ===
            Math.min(...grafoEstado.modelo.materias.map((item) => item.peso)),
    );
    if (!iniciales.length) return;
    const inicio =
        iniciales.find((m) => m.nombre === "P1") ||
        iniciales.find((m) => m.nombre === "PI") ||
        iniciales[0];
    const svg = document.getElementById("grafo-svg");
    grafoEstado.escala = Math.min(
        1,
        Math.max(0.65, (svg.clientWidth - 70) / 700),
    );
    grafoCentrar(inicio.nombre);
    grafoEstado.x =
        30 - grafoEstado.posiciones.get(inicio.nombre).x * grafoEstado.escala;
    grafoTransformar();
}

function grafoZoom(factor, punto) {
    const svg = document.getElementById("grafo-svg");
    const centro = punto || { x: svg.clientWidth / 2, y: svg.clientHeight / 2 };
    const anterior = grafoEstado.escala;
    const escala = Math.max(0.06, Math.min(2.5, anterior * factor));
    grafoEstado.x = centro.x - ((centro.x - grafoEstado.x) * escala) / anterior;
    grafoEstado.y = centro.y - ((centro.y - grafoEstado.y) * escala) / anterior;
    grafoEstado.escala = escala;
    grafoEstado.encuadreCompleto = false;
    grafoTransformar();
}

function grafoConfigurarGestos() {
    const svg = document.getElementById("grafo-svg");
    const punteros = new Map();
    let inicio = null;
    let distancia = null;
    const local = (event) => {
        const rect = svg.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const medir = () => {
        const [a, b] = [...punteros.values()];
        return {
            distancia: Math.hypot(a.x - b.x, a.y - b.y),
            centro: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        };
    };
    svg.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        punteros.set(event.pointerId, local(event));
        grafoEstado.arrastrado = false;
        if (punteros.size === 1)
            inicio = { ...local(event), xMapa: grafoEstado.x, yMapa: grafoEstado.y };
        if (punteros.size === 2) {
            distancia = medir();
            grafoEstado.arrastrado = true;
        }
    });
    svg.addEventListener("pointermove", (event) => {
        if (!punteros.has(event.pointerId)) return;
        const punto = local(event);
        punteros.set(event.pointerId, punto);
        if (punteros.size === 2) {
            const nueva = medir();
            if (distancia?.distancia)
                grafoZoom(nueva.distancia / distancia.distancia, nueva.centro);
            distancia = nueva;
            grafoEstado.arrastrado = true;
            svg.setPointerCapture(event.pointerId);
        } else if (inicio) {
            const dx = punto.x - inicio.x,
                dy = punto.y - inicio.y;
            if (Math.hypot(dx, dy) > 4) grafoEstado.arrastrado = true;
            if (grafoEstado.arrastrado) {
                svg.setPointerCapture(event.pointerId);
                grafoEstado.x = inicio.xMapa + dx;
                grafoEstado.y = inicio.yMapa + dy;
                grafoEstado.encuadreCompleto = false;
                grafoTransformar();
            }
        }
    });
    const soltar = (event) => {
        punteros.delete(event.pointerId);
        distancia = null;
        if (svg.hasPointerCapture(event.pointerId))
            svg.releasePointerCapture(event.pointerId);
        if (punteros.size === 1)
            inicio = {
                ...[...punteros.values()][0],
                xMapa: grafoEstado.x,
                yMapa: grafoEstado.y,
            };
        else inicio = null;
    };
    svg.addEventListener("pointerup", soltar);
    svg.addEventListener("pointercancel", soltar);
    svg.addEventListener("pointerleave", (event) => {
        if (!svg.hasPointerCapture(event.pointerId)) soltar(event);
    });
    svg.addEventListener(
        "wheel",
        (event) => {
            event.preventDefault();
            grafoZoom(Math.exp(-event.deltaY * 0.0015), local(event));
        },
        { passive: false },
    );
    svg.addEventListener("keydown", (event) => {
        const pasos = {
            ArrowLeft: [70, 0],
            ArrowRight: [-70, 0],
            ArrowUp: [0, 70],
            ArrowDown: [0, -70],
        };
        if (pasos[event.key]) {
            event.preventDefault();
            grafoEstado.x += pasos[event.key][0];
            grafoEstado.y += pasos[event.key][1];
            grafoEstado.encuadreCompleto = false;
            grafoTransformar();
        } else if (["+", "=", "-"].includes(event.key)) {
            event.preventDefault();
            grafoZoom(event.key === "-" ? 0.8 : 1.25);
        } else if (event.key === "Escape") grafoLimpiar();
    });
}
