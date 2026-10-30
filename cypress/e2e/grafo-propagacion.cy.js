const nodo = (nombre) => `.grafo-nodo[data-materia="${nombre}"]`;
const conexion = (clase, origen, destino, tipo = "aprobada") => (
    `.${clase}[data-origen="${origen}"][data-destino="${destino}"][data-tipo="${tipo}"]`
);

const recorridoCDIVV = [
    "AA", "ADA", "AE", "ALN", "CC", "CCE", "CDIV", "CDIVV", "CV", "ED",
    "FAARP", "FDPE", "FO", "FVC", "IIO", "IOGR", "IPLN", "ITI", "MERC",
    "MESECR", "MMC", "MN", "MO", "OBI", "OCA", "OCM", "PCI", "PG", "PYE",
    "RNLN", "SED", "TAA", "TAAGL", "TACCE", "TAR", "TDPM", "TEP",
].sort();

const visitarGrafo = (movimientoReducido = false) => {
    cy.viewport(1280, 900);
    cy.visit("/", {
        onBeforeLoad(win) {
            win.localStorage.clear();
            const pendientes = new Map();
            let ahora = 0;
            let siguienteId = 0;
            win.requestAnimationFrame = (callback) => {
                const id = ++siguienteId;
                pendientes.set(id, callback);
                return id;
            };
            win.cancelAnimationFrame = (id) => pendientes.delete(id);
            const emitirFrame = (milisegundos) => {
                ahora += milisegundos;
                const callbacks = Array.from(pendientes.values());
                pendientes.clear();
                callbacks.forEach((callback) => callback(ahora));
            };
            win.__relojPropagacion = {
                avanzar(milisegundos = 0) {
                    if (!milisegundos) emitirFrame(0);
                    for (let restante = milisegundos; restante > 0; restante -= 16) {
                        emitirFrame(Math.min(16, restante));
                    }
                },
                saltoFrame: emitirFrame,
                get pendientes() { return pendientes.size; },
            };
            const matchMediaOriginal = win.matchMedia.bind(win);
            win.matchMedia = (query) => query === "(prefers-reduced-motion: reduce)"
                ? {
                    matches: movimientoReducido, media: query, onchange: null,
                    addEventListener() {}, removeEventListener() {},
                    addListener() {}, removeListener() {}, dispatchEvent() { return true; },
                }
                : matchMediaOriginal(query);
        },
    });
    cy.get("#CDIV").should("exist");
    cy.get("#grafo").click();
    cy.get("#grafo-svg").should("be.visible");
};

const avanzarFrame = (milisegundos = 0) => {
    cy.window().then((win) => win.__relojPropagacion.avanzar(milisegundos));
};

const saltoFrame = (milisegundos) => {
    cy.window().then((win) => win.__relojPropagacion.saltoFrame(milisegundos));
};

const avanzarHasta = (condicion, mensaje) => {
    cy.window().then((win) => {
        let frames = 0;
        while (!condicion(win.document) && frames++ < 2000) win.__relojPropagacion.avanzar(16);
        expect(condicion(win.document), mensaje).to.equal(true);
    });
};

const offsetDe = (doc, selector) => {
    const trazo = doc.querySelector(selector);
    if (!trazo) return null;
    const id = /#([^\)]+)/.exec(trazo.getAttribute("mask"))?.[1];
    return parseFloat(doc.getElementById(id).querySelector("path").getAttribute("stroke-dashoffset"));
};

const avanzarHastaMitad = (selector) => avanzarHasta((doc) => {
    const valor = offsetDe(doc, selector);
    return valor !== null && Math.abs(valor) > 0.3 && Math.abs(valor) < 0.7;
}, "el tramo muestra un avance parcial");

const avanzarHastaLlegada = (selector, materia) => {
    cy.window().then((win) => {
        const arista = win.document.querySelector(selector);
        const destino = win.document.querySelector(nodo(materia));
        let frames = 0;
        let encendidaAntes = false;
        while (!arista.classList.contains("resaltada") && frames++ < 2000) {
            if (!destino.classList.contains("atenuado")) encendidaAntes = true;
            win.__relojPropagacion.avanzar(16);
        }
        expect(encendidaAntes, `${materia} espera a que termine su conexión`).to.equal(false);
        expect(arista.classList.contains("resaltada"), "conexión terminada").to.equal(true);
        expect(destino.classList.contains("atenuado"), `${materia} se enciende en el frame de llegada`).to.equal(false);
    });
};

const seleccionar = (nombre) => {
    cy.get(nodo(nombre)).trigger("keydown", { key: "Enter", force: true });
};

const comprobarEncendidas = (nombres) => {
    cy.get(".grafo-nodo:not(.atenuado)").should(($nodos) => {
        expect(Array.from($nodos, (elemento) => elemento.dataset.materia).sort())
            .to.deep.equal([...nombres].sort());
    });
};

const mascaraDe = (trazo) => {
    const id = /#([^\)]+)/.exec(trazo.getAttribute("mask"))?.[1];
    expect(id, "identificador de la máscara de revelado").to.be.a("string");
    const mascara = trazo.ownerDocument.getElementById(id);
    expect(mascara, "máscara presente en el SVG").not.to.equal(null);
    return mascara.querySelector("path");
};

const estadoGeometrico = (doc) => ({
    camara: doc.getElementById("grafo-escena").getAttribute("transform"),
    zoom: doc.getElementById("grafo-zoom").textContent,
    nodos: Array.from(doc.querySelectorAll(".grafo-nodo"), (elemento) => [elemento.dataset.materia, elemento.getAttribute("transform")]),
    rutas: Array.from(doc.querySelectorAll(".grafo-arista"), (elemento) => [
        `${elemento.dataset.origen}:${elemento.dataset.destino}:${elemento.dataset.tipo}`,
        elemento.getAttribute("d"),
    ]),
});

const capturar = (nombre) => {
    cy.env(["grafoCapturas"]).then(({ grafoCapturas }) => {
        if (grafoCapturas) cy.screenshot(nombre);
    });
};

const acercarVistaAMateria = (nombre) => {
    cy.document().then((doc) => {
        const lienzo = doc.getElementById("grafo-svg").getBoundingClientRect();
        const materia = doc.querySelector(nodo(nombre)).getBoundingClientRect();
        const x = lienzo.left + 100, y = lienzo.top + 150;
        const dx = lienzo.left + lienzo.width * 0.35 - (materia.left + materia.width / 2);
        const dy = lienzo.top + lienzo.height / 2 - (materia.top + materia.height / 2);
        const opciones = { eventConstructor: "PointerEvent", pointerId: 1, pointerType: "mouse", button: 0, force: true };
        cy.get("#grafo-svg")
            .trigger("pointerdown", { ...opciones, clientX: x, clientY: y, buttons: 1 })
            .trigger("pointermove", { ...opciones, clientX: x + dx, clientY: y + dy, buttons: 1 })
            .trigger("pointerup", { ...opciones, clientX: x + dx, clientY: y + dy, buttons: 0 });
    });
};

describe("Propagación del árbol de materias", () => {
    beforeEach(() => visitarGrafo());

    it("revela los tramos en orden y enciende cada materia al llegar, sin mover el mapa", () => {
        acercarVistaAMateria("CDIVV");
        let geometria;
        cy.document().then((doc) => { geometria = estadoGeometrico(doc); });
        seleccionar("CDIVV");
        cy.get("#grafo-svg").should("have.attr", "data-propagando", "true");
        comprobarEncendidas(["CDIVV"]);
        cy.get(".grafo-arista:not(.atenuado)").should("not.exist");
        avanzarFrame();
        avanzarFrame(60);
        comprobarEncendidas(["CDIVV"]);
        cy.get(conexion("grafo-propagacion-trazo", "CDIVV", "PYE")).should("have.css", "opacity", "0");
        avanzarHastaMitad(conexion("grafo-propagacion-trazo", "CDIVV", "PYE"));
        cy.get(conexion("grafo-propagacion-trazo", "CDIVV", "PYE")).should(($trazo) => {
            expect(parseFloat($trazo[0].style.opacity)).to.equal(1);
            expect(parseFloat(mascaraDe($trazo[0]).getAttribute("stroke-dashoffset"))).to.be.within(0.3, 0.7);
        });
        cy.get(conexion("grafo-arista", "CDIVV", "PYE")).should("have.class", "atenuado");
        cy.get(nodo("PYE")).should("have.class", "atenuado");
        cy.document().then((doc) => expect(estadoGeometrico(doc)).to.deep.equal(geometria));
        capturar("propagacion-primer-tramo-mitad");
        avanzarHastaLlegada(conexion("grafo-arista", "CDIVV", "PYE"), "PYE");
        cy.get(nodo("PYE")).should("not.have.class", "atenuado");
        cy.get(nodo("AA")).should("have.class", "atenuado");
        cy.get(conexion("grafo-arista", "CDIVV", "PYE")).should("have.class", "resaltada");
        cy.get(conexion("grafo-propagacion-trazo", "CDIVV", "PYE")).should("not.exist");
        cy.get(nodo("PYE")).should(($nodo) => {
            const estilo = $nodo[0].ownerDocument.defaultView.getComputedStyle($nodo[0]);
            expect(estilo.animationName, "entrada suave del nodo").not.to.equal("none");
            expect(parseFloat(estilo.animationDuration)).to.be.greaterThan(0);
        });
        capturar("propagacion-primera-llegada");
        cy.get(conexion("grafo-propagacion-trazo", "PYE", "AA", "exonerada")).should("have.css", "opacity", "0");
        avanzarFrame(16);
        cy.get(conexion("grafo-propagacion-trazo", "PYE", "AA", "exonerada")).should("have.css", "opacity", "0");
        cy.get(nodo("AA")).should("have.class", "atenuado");
        avanzarHastaMitad(conexion("grafo-propagacion-trazo", "PYE", "AA", "exonerada"));
        capturar("propagacion-cola-segundo-tramo");
        avanzarHastaLlegada(conexion("grafo-arista", "PYE", "AA", "exonerada"), "AA");
        cy.get(nodo("AA")).should("not.have.class", "atenuado");
        cy.get(nodo("TAA")).should("have.class", "atenuado");
        avanzarHastaLlegada(conexion("grafo-arista", "AA", "TAA"), "TAA");
        cy.get(nodo("TAA")).should("not.have.class", "atenuado");
        avanzarFrame(10000);
        comprobarEncendidas(recorridoCDIVV);
        cy.get(nodo("P4")).should("have.class", "atenuado");
        cy.get(nodo("GAL1")).should("have.class", "atenuado");
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.document().then((doc) => expect(estadoGeometrico(doc)).to.deep.equal(geometria));
    });

    it("buscar durante el efecto no reinicia el reloj ni enciende una coincidencia antes de llegar", () => {
        seleccionar("CDIVV");
        avanzarFrame();
        const trazo = conexion("grafo-propagacion-trazo", "CDIVV", "PYE");
        avanzarHastaMitad(trazo);
        let offset;
        let encendidas;
        cy.document().then((doc) => {
            offset = offsetDe(doc, trazo);
            encendidas = Array.from(doc.querySelectorAll(".grafo-nodo:not(.atenuado)"), (elemento) => elemento.dataset.materia).sort();
        });
        cy.get("#grafo-buscar").type("PYE");
        cy.get(".grafo-nodo:not(.atenuado)").should(($nodos) => {
            expect(Array.from($nodos, (elemento) => elemento.dataset.materia).sort()).to.deep.equal(encendidas);
        });
        cy.get(nodo("PYE")).should(($nodo) => {
            expect(parseFloat($nodo[0].ownerDocument.defaultView.getComputedStyle($nodo[0]).opacity)).to.be.lessThan(1);
        });
        cy.get(conexion("grafo-propagacion-trazo", "CDIVV", "PYE")).should(($trazo) => {
            expect(parseFloat(mascaraDe($trazo[0]).getAttribute("stroke-dashoffset"))).to.equal(offset);
        });
        avanzarHastaLlegada(conexion("grafo-arista", "CDIVV", "PYE"), "PYE");
        cy.get(nodo("PYE")).should("not.have.class", "atenuado");
        cy.get(nodo("AA")).should("have.class", "atenuado");
    });

    it("cancela la selección anterior y limpiar impide que reaparezcan trazos o nodos encendidos", () => {
        seleccionar("CDIVV");
        avanzarFrame();
        avanzarFrame(250);
        cy.get("#grafo-svg defs mask").then(($mascaras) => {
            const anteriores = Array.from($mascaras, (mascara) => mascara.id);
            seleccionar("P2");
            comprobarEncendidas(["P2"]);
            cy.document().then((doc) => anteriores.forEach((id) => expect(doc.getElementById(id)).to.equal(null)));
        });
        avanzarFrame();
        avanzarHastaLlegada(conexion("grafo-arista", "P1", "P2"), "P1");
        cy.get(nodo("P1")).should("not.have.class", "atenuado");
        cy.get(nodo("CDIVV")).should("have.class", "atenuado");
        cy.get("#grafo-ver-todo").click();
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask, .grafo-nodo.atenuado").should("not.exist");
        avanzarFrame(10000);
        cy.get(".grafo-nodo[aria-pressed='true'], .grafo-propagacion-trazo, #grafo-svg defs mask, .grafo-nodo.atenuado").should("not.exist");
        cy.window().then((win) => expect(win.__relojPropagacion.pendientes).to.equal(0));
    });

    it("redibujar el grafo cancela las máscaras y los frames pendientes", () => {
        seleccionar("CDIVV");
        avanzarFrame();
        avanzarFrame(250);
        cy.get("#grafo-solo-rama").check();
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.get(".grafo-nodo").should("have.length", recorridoCDIVV.length);
        avanzarFrame(10000);
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.window().then((win) => expect(win.__relojPropagacion.pendientes).to.equal(0));
    });

    it("revela hacia las previas sin perder el punteado de las alternativas", () => {
        seleccionar("P2");
        avanzarFrame();
        avanzarHastaMitad(conexion("grafo-propagacion-trazo", "P1", "P2"));
        const real = conexion("grafo-arista", "P1", "P2");
        cy.get(real).should("have.class", "es-alternativa").then(($real) => {
            cy.get(conexion("grafo-propagacion-trazo", "P1", "P2"))
                .should("have.class", "es-alternativa")
                .and(($trazo) => {
                    const win = $trazo[0].ownerDocument.defaultView;
                    expect($trazo[0].getAttribute("d")).to.equal($real[0].getAttribute("d"));
                    expect(win.getComputedStyle($trazo[0]).strokeDasharray).to.equal(win.getComputedStyle($real[0]).strokeDasharray);
                    expect(win.getComputedStyle($trazo[0]).strokeDasharray).not.to.equal("none");
                    expect(parseFloat(mascaraDe($trazo[0]).getAttribute("stroke-dashoffset"))).to.be.within(-0.7, -0.3);
                });
        });
        cy.get(nodo("P1")).should("have.class", "atenuado");
        avanzarHastaLlegada(real, "P1");
        cy.get(nodo("P1")).should("not.have.class", "atenuado");
        cy.get(real).should("have.class", "resaltada").and("have.class", "es-alternativa");
    });

    it("una conexión larga tarda más que una corta que sale de la misma materia", () => {
        seleccionar("CDIV");
        avanzarFrame();
        cy.get('.grafo-arista[data-origen="CDIV"]').then(($aristas) => {
            const ordenadas = Array.from($aristas).sort((a, b) => a.getTotalLength() - b.getTotalLength());
            const corta = ordenadas[0], larga = ordenadas[ordenadas.length - 1];
            expect(larga.getTotalLength(), "longitudes suficientemente distintas").to.be.greaterThan(corta.getTotalLength() * 1.25);
            avanzarHasta(() => corta.classList.contains("resaltada"), "la conexión corta termina");
            cy.then(() => {
                expect(larga.classList.contains("atenuado"), "la conexión larga sigue en curso").to.equal(true);
            });
            const selectorLarga = conexion("grafo-propagacion-trazo", larga.dataset.origen, larga.dataset.destino, larga.dataset.tipo);
            cy.get(selectorLarga).should(($trazo) => {
                const offset = Math.abs(parseFloat(mascaraDe($trazo[0]).getAttribute("stroke-dashoffset")));
                expect(offset).to.be.greaterThan(0).and.lessThan(1);
            });
            avanzarHasta(() => larga.classList.contains("resaltada"), "la conexión larga también termina");
        });
    });

    it("un frame retrasado no salta de golpe al final de la propagación", () => {
        seleccionar("CDIVV");
        avanzarFrame();
        saltoFrame(10000);
        saltoFrame(10000);
        comprobarEncendidas(["CDIVV"]);
        cy.get("#grafo-svg").should("have.attr", "data-propagando", "true");
        cy.get(nodo("TAA")).should("have.class", "atenuado");
        cy.get(".grafo-arista.resaltada").should("not.exist");
        avanzarFrame(10000);
        comprobarEncendidas(recorridoCDIVV);
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
    });

    it("un segundo clic en la materia cancela la animación y deselecciona sin mover el mapa", () => {
        let geometria;
        cy.document().then((doc) => { geometria = estadoGeometrico(doc); });
        cy.get(nodo("P1")).click().should("have.attr", "aria-pressed", "true");
        avanzarFrame();
        avanzarFrame(160);
        cy.get("#grafo-svg").should("have.attr", "data-propagando", "true");
        cy.get(nodo("P1")).click().should("have.attr", "aria-pressed", "false");
        cy.get("#grafo-mas-info").should("not.be.visible");
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-nodo.atenuado, .grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.document().then((doc) => expect(estadoGeometrico(doc)).to.deep.equal(geometria));
        avanzarFrame(10000);
        cy.get(".grafo-nodo[aria-pressed='true'], .grafo-propagacion-trazo").should("not.exist");
    });

    it("deseleccionar con teclado conserva la búsqueda y restaura todas las materias de una rama", () => {
        let geometriaCompleta;
        cy.document().then((doc) => { geometriaCompleta = estadoGeometrico(doc); });
        cy.get("#grafo-buscar").type("CDIVV");
        cy.get('#grafo-resultados button[data-materia="CDIVV"]').click();
        cy.get("#grafo-solo-rama").check();
        cy.get(".grafo-nodo").should("have.length", recorridoCDIVV.length);
        cy.document().then((doc) => {
            geometriaCompleta.camara = doc.getElementById("grafo-escena").getAttribute("transform");
            geometriaCompleta.zoom = doc.getElementById("grafo-zoom").textContent;
        });
        cy.get(nodo("CDIVV")).trigger("keydown", { key: " ", force: true });
        cy.get("#grafo-buscar").should("have.value", "CDIVV");
        cy.get("#grafo-solo-rama").should("not.be.checked").and("be.disabled");
        cy.get("#grafo-mas-info").should("not.be.visible");
        cy.get(".grafo-nodo").should("have.length", 103);
        cy.get(".grafo-nodo[aria-pressed='true'], .grafo-nodo.atenuado").should("not.exist");
        cy.document().then((doc) => expect(estadoGeometrico(doc)).to.deep.equal(geometriaCompleta));
    });

    it("respeta movimiento reducido con el recorrido completo inmediato y sin mover la cámara", () => {
        visitarGrafo(true);
        let geometria;
        cy.document().then((doc) => { geometria = estadoGeometrico(doc); });
        seleccionar("CDIVV");
        comprobarEncendidas(recorridoCDIVV);
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.window().then((win) => expect(win.__relojPropagacion.pendientes).to.equal(0));
        cy.document().then((doc) => expect(estadoGeometrico(doc)).to.deep.equal(geometria));
    });
});
