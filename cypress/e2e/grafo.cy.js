const nodo = (nombre) => `.grafo-nodo[data-materia="${nombre}"]`;
const arista = (origen, destino, tipo) => (
    `.grafo-arista[data-origen="${origen}"][data-destino="${destino}"]${tipo ? `[data-tipo="${tipo}"]` : ""}`
);

const abrirGrafo = () => {
    cy.get("#grafo").click();
    cy.get("#vista-grafo").should("be.visible");
    cy.get("#grafo-svg").should("be.visible");
};

const seleccionarMateria = (busqueda, nombre) => {
    cy.get("#grafo-buscar").clear().type(busqueda);
    cy.get(`#grafo-resultados button[data-materia="${nombre}"]`).click();
};

const abrirInformacionMateria = (nombreCompleto) => {
    cy.get("#grafo-mas-info").should("be.visible").click();
    cy.get("#popup-container").should("be.visible");
    cy.get("#previas").should("have.class", "activo");
    cy.get("#popup-materia-contenido").should("contain.text", nombreCompleto);
};

const cerrarInformacionMateria = () => {
    cy.get("#cerrar-popup").click();
    cy.get("#popup-container").should("not.be.visible");
};

const comprobarLimitesMaximizado = () => {
    cy.get("#vista-grafo").should("have.class", "grafo-maximizado");
    cy.get("#grafo-maximizar").should("have.attr", "aria-pressed", "true");
    cy.get("header").should("be.visible");
    cy.get("#navbar").should("be.visible");
    cy.document().should((doc) => {
        const win = doc.defaultView;
        const mapa = doc.querySelector("#vista-grafo .grafo-espacio").getBoundingClientRect();
        const header = doc.querySelector("header");
        const encabezado = header.getBoundingClientRect();
        const nav = doc.getElementById("navbar").getBoundingClientRect();
        expect(mapa.top, "inicio debajo del encabezado").to.be.closeTo(encabezado.bottom, 2);
        expect(mapa.left, "inicio junto a la navegación").to.be.closeTo(nav.right, 2);
        expect(mapa.right, "borde derecho del mapa").to.be.closeTo(win.innerWidth, 2);
        expect(mapa.bottom, "borde inferior del mapa").to.be.closeTo(win.innerHeight, 2);
        expect(doc.fullscreenElement, "sin Fullscreen API").to.equal(null);
        expect(doc.documentElement.scrollWidth, "sin desbordamiento horizontal del documento").to.be.at.most(win.innerWidth);
        [doc.body, doc.getElementById("secciones")].forEach((elemento) => {
            const estilo = win.getComputedStyle(elemento);
            expect(estilo.overflowX, `${elemento.id || "body"}: desplazamiento horizontal bloqueado`).to.equal("hidden");
            expect(estilo.overflowY, `${elemento.id || "body"}: desplazamiento vertical bloqueado`).to.equal("hidden");
        });
        expect(header.contains(doc.elementFromPoint(encabezado.left + 20, encabezado.top + encabezado.height / 2)))
            .to.equal(true);
        const boton = doc.getElementById("materias").getBoundingClientRect();
        expect(doc.getElementById("navbar").contains(doc.elementFromPoint(boton.left + boton.width / 2, boton.top + boton.height / 2)))
            .to.equal(true);
    });
};

const capturarGrafo = (nombre, opciones = {}) => {
    cy.env(["grafoCapturas"]).then(({ grafoCapturas }) => {
        if (grafoCapturas) cy.screenshot(nombre, opciones);
    });
};

const capturarOrdenObligatorias = () => {
    cy.env(["grafoCapturas"]).then(({ grafoCapturas }) => {
        if (!grafoCapturas) return;
        cy.viewport(1280, 720);
        cy.get("#grafo-maximizar").click();
        cy.get("#grafo-ajustar").click();
        cy.screenshot("grafo-obligatorias-global", { capture: "viewport" });
        for (let i = 0; i < 10; i++) cy.get("#grafo-acercar").click();
        cy.document().then((doc) => {
            const mapa = doc.getElementById("grafo-svg").getBoundingClientRect();
            const materia = doc.querySelector(nodo("PIS")).getBoundingClientRect();
            const x = mapa.left + 100, y = mapa.top + 170;
            const dx = mapa.left + mapa.width / 2 - (materia.left + materia.width / 2);
            const dy = mapa.top + mapa.height / 2 - (materia.top + materia.height / 2);
            const opciones = { eventConstructor: "PointerEvent", pointerId: 1, pointerType: "mouse", button: 0, force: true };
            cy.get("#grafo-svg")
                .trigger("pointerdown", { ...opciones, clientX: x, clientY: y, buttons: 1 })
                .trigger("pointermove", { ...opciones, clientX: x + dx, clientY: y + dy, buttons: 1 })
                .trigger("pointerup", { ...opciones, clientX: x + dx, clientY: y + dy, buttons: 0 });
        });
        cy.screenshot("grafo-obligatorias-cerca-PIS", { capture: "viewport" });
        cy.get("#grafo-maximizar").click();
    });
};

const claveArista = (elemento) => (
    `${elemento.dataset.origen}:${elemento.dataset.destino}:${elemento.dataset.tipo}`
);

const comprobarRutasEstables = (rutasAnteriores) => {
    cy.get(".grafo-arista").should(($aristas) => {
        const comunes = Array.from($aristas).filter((elemento) => rutasAnteriores.has(claveArista(elemento)));
        expect(comunes.length, "aristas comunes entre ambas vistas").to.be.greaterThan(0);
        comunes.forEach((elemento) => {
            expect(elemento.getAttribute("d"), `ruta de ${claveArista(elemento)}`)
                .to.equal(rutasAnteriores.get(claveArista(elemento)));
        });
    });
};

const comprobarGeometriaGrafo = (configuracion) => {
    cy.document().then((doc) => {
        const tarjetas = Array.from(doc.querySelectorAll(".grafo-nodo"), (elemento) => {
            const caja = elemento.querySelector(".grafo-tarjeta").getBBox();
            const matriz = elemento.transform.baseVal.consolidate().matrix;
            return {
                nombre: elemento.dataset.materia,
                izquierda: matriz.e + caja.x,
                derecha: matriz.e + caja.x + caja.width,
                arriba: matriz.f + caja.y,
                abajo: matriz.f + caja.y + caja.height,
            };
        });
        const aristas = Array.from(doc.querySelectorAll(".grafo-arista"));
        expect(tarjetas.length, `${configuracion}: tarjetas auditadas`).to.be.greaterThan(0);
        expect(aristas.length, `${configuracion}: conexiones auditadas`).to.be.greaterThan(0);

        const tolerancia = 0.1;
        const solapamientos = [];
        tarjetas.forEach((a, indice) => {
            tarjetas.slice(indice + 1).forEach((b) => {
                if (a.izquierda < b.derecha - tolerancia && a.derecha > b.izquierda + tolerancia
                    && a.arriba < b.abajo - tolerancia && a.abajo > b.arriba + tolerancia) {
                    solapamientos.push(`${a.nombre} / ${b.nombre}`);
                }
            });
        });
        expect(solapamientos.length, `${configuracion}: tarjetas superpuestas: ${solapamientos.slice(0, 5).join(", ")}`)
            .to.equal(0);

        const choques = [];
        const rutasInvalidas = [];
        const dobles = new Map();
        aristas.forEach((elemento) => {
            const longitud = elemento.getTotalLength();
            if (!Number.isFinite(longitud) || longitud <= 0) {
                rutasInvalidas.push(claveArista(elemento));
                return;
            }
            const par = `${elemento.dataset.origen}:${elemento.dataset.destino}`;
            if (!dobles.has(par)) dobles.set(par, new Map());
            dobles.get(par).set(elemento.dataset.tipo, elemento.getAttribute("d"));

            const cajaRuta = elemento.getBBox();
            const candidatas = tarjetas.filter((tarjeta) => (
                tarjeta.derecha >= cajaRuta.x && tarjeta.izquierda <= cajaRuta.x + cajaRuta.width
                && tarjeta.abajo >= cajaRuta.y && tarjeta.arriba <= cajaRuta.y + cajaRuta.height
            ));
            const pasos = Math.ceil(longitud / 3);
            for (let i = 0; i <= pasos; i++) {
                const punto = elemento.getPointAtLength(longitud * i / pasos);
                const tarjeta = candidatas.find((candidata) => (
                    punto.x > candidata.izquierda + tolerancia && punto.x < candidata.derecha - tolerancia
                    && punto.y > candidata.arriba + tolerancia && punto.y < candidata.abajo - tolerancia
                ));
                if (tarjeta) {
                    choques.push(`${claveArista(elemento)} atraviesa ${tarjeta.nombre} en (${punto.x.toFixed(1)}, ${punto.y.toFixed(1)})`);
                    break;
                }
            }
        });
        expect(rutasInvalidas.length, `${configuracion}: rutas sin geometría: ${rutasInvalidas.slice(0, 5).join(", ")}`)
            .to.equal(0);
        expect(choques.length, `${configuracion}: conexiones que atraviesan tarjetas: ${choques.slice(0, 5).join("; ")}`)
            .to.equal(0);

        const paresDobles = Array.from(dobles).filter(([, tipos]) => tipos.has("aprobada") && tipos.has("exonerada"));
        expect(paresDobles.length, `${configuracion}: pares de curso y exoneración auditados`).to.be.greaterThan(0);
        paresDobles.forEach(([par, tipos]) => {
            expect(tipos.get("aprobada"), `${configuracion}: rutas diferentes para curso y exoneración de ${par}`)
                .not.to.equal(tipos.get("exonerada"));
        });
    });
};

describe("Árbol de materias", () => {
    beforeEach(() => {
        cy.viewport(1280, 900);
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.clear();
            },
        });
        cy.get("#CDIV").should("exist");
        abrirGrafo();
    });

    it("muestra las materias del plan y distingue curso de exoneración sin crear previas falsas", () => {
        cy.get(".grafo-nodo").should("have.length", 103);
        cy.get(arista("CDIV", "CDIVV", "aprobada")).should("exist");
        cy.get(arista("CDIV", "P4", "exonerada")).should("exist");
        cy.get(arista("P1", "P2", "aprobada")).should("exist");
        cy.get(arista("PI", "P2", "aprobada")).should("exist");
        cy.get(arista("P1", "PI")).should("not.exist");
        cy.get(arista("PI", "P1")).should("not.exist");
        cy.get(arista("LG", "HMA")).should("not.exist");
        cy.get(nodo("CDIV")).should("have.attr", "data-estado", "habilitada");
        cy.get(nodo("CDIVV")).should("have.attr", "data-estado", "deshabilitada");
        cy.get("#seccion-filtros").should("not.be.visible");
        cy.get("#vista-planificacion").should("not.be.visible");
        capturarGrafo("grafo-desktop-inicial");
    });

    it("ubica los controles dentro del mapa y deja las leyendas en una sección separada", () => {
        cy.get("#grafo-detalle, #grafo-plan, #grafo-contador, #vista-grafo h2").should("not.exist");
        ["#grafo-buscar", "#grafo-solo-rama", "#grafo-ver-todo", "#grafo-mas-info", "#grafo-maximizar"].forEach((selector) => {
            cy.get(selector).parents(".grafo-lienzo").should("have.length", 1);
        });
        cy.get("#grafo-mas-info").should("not.be.visible");
        cy.get("#grafo-maximizar").should("have.attr", "aria-pressed", "false");
        cy.get("#grafo-informacion").should("be.visible").and("contain.text", "Curso aprobado");
        cy.get("#grafo-informacion").parents("#vista-grafo").should("have.length", 0);
        cy.document().then((doc) => {
            const mapa = doc.querySelector(".grafo-lienzo").getBoundingClientRect();
            const buscador = doc.getElementById("grafo-buscar").getBoundingClientRect();
            expect(buscador.left).to.be.at.least(mapa.left);
            expect(buscador.left - mapa.left).to.be.lessThan(40);
            expect(buscador.top - mapa.top).to.be.lessThan(100);
            expect(buscador.right).to.be.at.most(mapa.right);
        });
    });

    it("busca por nombre sin acentos y permite inspeccionar sin cambiar el progreso", () => {
        let progreso;
        cy.window().then((win) => {
            progreso = ["materiasAprobadas", "materiasExoneradas"].map((clave) => win.localStorage.getItem(clave));
        });
        seleccionarMateria("calculo div", "CDIV");
        abrirInformacionMateria("Cálculo DIV");
        cerrarInformacionMateria();
        cy.get(".grafo-nodo").should("have.length", 103);
        cy.window().then((win) => {
            expect(["materiasAprobadas", "materiasExoneradas"].map((clave) => win.localStorage.getItem(clave)))
                .to.deep.equal(progreso);
        });
        cy.get("#grafo-buscar").clear().type("materia inexistente xyz");
        cy.get("#grafo-resultados").should("contain.text", "No");
        cy.get("#grafo-ver-todo").click();
        cy.get("#grafo-buscar").should("have.value", "");
        cy.get("#grafo-mas-info").should("not.be.visible");
    });

    it("Más info muestra las previas, alternativas y créditos de la selección actual y reutiliza sus pestañas", () => {
        seleccionarMateria("P3", "P3");
        abrirInformacionMateria("Programación 3");
        cy.get("#popup-materia-contenido")
            .should("contain.text", "Debe cumplir todo lo siguiente")
            .and("contain.text", "Debe cumplir alguna de las siguientes opciones")
            .and("contain.text", "Programación 1")
            .and("contain.text", "Programación Imperativa");
        cy.get("#previaDe").click().should("have.class", "activo");
        cy.get("#popup-materia-contenido").should("contain.text", "Programación 3");
        cy.get("#informacion").click().should("have.class", "activo");
        cy.get("#popup-materia-contenido").should("contain.text", "Información de Programación 3");
        cerrarInformacionMateria();
        seleccionarMateria("AGI", "AGI");
        cy.get("#grafo-mas-info").click();
        cy.get("#previas").should("have.class", "activo");
        cy.get("#popup-materia-contenido").should("contain.text", "140").and("contain.text", "créditos");
        cerrarInformacionMateria();
        seleccionarMateria("HMA", "HMA");
        cy.get("#grafo-mas-info").click();
        cy.get("#popup-materia-contenido").should("contain.text", "Lógica").and("contain.text", "No cumplir lo siguiente");
        cerrarInformacionMateria();
    });

    it("permite aislar una rama y volver al árbol completo", () => {
        seleccionarMateria("P2", "P2");
        cy.get(".grafo-arista").then(($aristas) => {
            const rutas = new Map(Array.from($aristas, (elemento) => [claveArista(elemento), elemento.getAttribute("d")]));
            cy.get("#grafo-solo-rama").check();
            comprobarRutasEstables(rutas);
        });
        cy.get(nodo("P1")).should("exist");
        cy.get(nodo("PI")).should("exist");
        cy.get(nodo("P2")).should("exist");
        cy.get(nodo("P3")).should("exist");
        cy.get(nodo("F1")).should("not.exist");
        cy.get(".grafo-nodo").its("length").should("be.lessThan", 103);
        capturarGrafo("grafo-desktop-rama");
        cy.get("#grafo-ver-todo").click();
        cy.get("#grafo-solo-rama").should("not.be.checked");
        cy.get(".grafo-nodo").should("have.length", 103);
    });

    it("acerca, aleja y ajusta el grafo", () => {
        cy.get("#grafo-zoom").invoke("text").then((inicial) => {
            cy.get("#grafo-acercar").click();
            cy.get("#grafo-zoom").invoke("text").should((actual) => {
                expect(parseInt(actual, 10)).to.be.greaterThan(parseInt(inicial, 10));
            });
            cy.get("#grafo-alejar").click();
            cy.get("#grafo-zoom").invoke("text").should((actual) => {
                expect(parseInt(actual, 10)).to.equal(parseInt(inicial, 10));
            });
        });
        cy.get("#grafo-ajustar").click();
        cy.get("#grafo-escena").should("have.attr", "transform").and("include", "scale");
        cy.get("#grafo-svg").should("be.visible");
    });

    it("selecciona nodos con clic y teclado y permite desplazar el mapa", () => {
        cy.get("#grafo-escena").invoke("attr", "transform").then((antes) => {
            cy.get(nodo("P1")).click().should("have.attr", "aria-pressed", "true");
            cy.get("#grafo-escena").should("have.attr", "transform", antes);
        });
        cy.get("#grafo-mas-info").should("be.visible");
        cy.get("#grafo-ajustar").click();
        cy.get("#grafo-escena").invoke("attr", "transform").then((antes) => {
            cy.get(nodo("P2"))
                .should("have.attr", "role", "button")
                .focus()
                .trigger("keydown", { key: "Enter" })
                .should("have.attr", "aria-pressed", "true");
            cy.get("#grafo-escena").should("have.attr", "transform", antes);
        });
        cy.get(nodo("P1")).should("have.attr", "aria-pressed", "false");
        cy.get("#grafo-mas-info").should("be.visible");
        cy.get("#grafo-solo-rama").check();
        cy.document().then((doc) => {
            const camara = doc.getElementById("grafo-escena").getAttribute("transform");
            const zoom = doc.getElementById("grafo-zoom").textContent;
            const posiciones = new Map(Array.from(doc.querySelectorAll(".grafo-nodo"), (elemento) => (
                [elemento.dataset.materia, elemento.getAttribute("transform")]
            )));
            const rutas = new Map(Array.from(doc.querySelectorAll(".grafo-arista"), (elemento) => (
                [claveArista(elemento), elemento.getAttribute("d")]
            )));
            cy.get(nodo("P3")).click();
            cy.get(nodo("P3")).should("have.attr", "aria-pressed", "true");
            cy.get("#grafo-escena").should("have.attr", "transform", camara);
            cy.get("#grafo-zoom").should("have.text", zoom);
            comprobarRutasEstables(rutas);
            cy.get(".grafo-nodo").should(($nodos) => {
                const comunes = Array.from($nodos).filter((elemento) => posiciones.has(elemento.dataset.materia));
                expect(comunes.length).to.be.greaterThan(2);
                comunes.forEach((elemento) => {
                    expect(elemento.getAttribute("transform"), `posición de ${elemento.dataset.materia}`)
                        .to.equal(posiciones.get(elemento.dataset.materia));
                });
            });
        });
        cy.get("#grafo-escena").invoke("attr", "transform").then((antes) => {
            cy.get("#grafo-svg").focus().trigger("keydown", { key: "ArrowRight" });
            cy.get("#grafo-escena").should("not.have.attr", "transform", antes);
        });
        cy.get("#grafo-escena").invoke("attr", "transform").then((antes) => {
            const puntero = { eventConstructor: "PointerEvent", pointerId: 1, pointerType: "mouse", button: 0 };
            cy.get("#grafo-svg")
                .trigger("pointerdown", 100, 150, { ...puntero, buttons: 1 })
                .trigger("pointermove", 180, 190, { ...puntero, buttons: 1 })
                .trigger("pointerup", 180, 190, { ...puntero, buttons: 0 });
            cy.get("#grafo-escena").should("not.have.attr", "transform", antes);
        });
        cy.get(nodo("P3")).should("have.attr", "aria-pressed", "true");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasAprobadas"))).to.deep.equal([]);
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.deep.equal([]);
        });
        cy.get("#grafo-svg").trigger("keydown", { key: "Escape" });
        cy.get(".grafo-nodo[aria-pressed='true']").should("not.exist");
    });

    it("adapta el mapa al modo oscuro de la configuración general", () => {
        cy.get("#seccion-configuracion").scrollIntoView();
        cy.get("#seccion-configuracion").should("have.attr", "open");
        cy.get("#mi-toggle-modo-oscuro").check({ force: true });
        cy.get("body").should("have.class", "modo-oscuro");
        cy.get("#vista-grafo").scrollIntoView();
        cy.get(`${nodo("P1")} .grafo-tarjeta`).should("have.css", "fill", "rgb(32, 35, 38)");
        cy.get(arista("CDIV", "CDIVV", "aprobada")).should("have.css", "stroke", "rgb(98, 184, 237)");
        capturarGrafo("grafo-desktop-oscuro");
    });

    it("maximiza debajo del encabezado y junto al menú, mantiene el popup encima y permite restaurar", () => {
        seleccionarMateria("P2", "P2");
        cy.get("#grafo-maximizar").click();
        comprobarLimitesMaximizado();
        cy.get("#grafo-informacion").should("not.be.visible");
        cy.document().then((doc) => {
            const info = doc.getElementById("grafo-mas-info").getBoundingClientRect();
            const maximizar = doc.getElementById("grafo-maximizar").getBoundingClientRect();
            expect(maximizar.left).to.be.at.least(info.right);
        });
        abrirInformacionMateria("Programación 2");
        cy.document().then((doc) => {
            const popup = doc.getElementById("popup");
            const caja = popup.getBoundingClientRect();
            expect(popup.contains(doc.elementFromPoint(caja.left + caja.width / 2, caja.top + caja.height / 2)))
                .to.equal(true);
        });
        cerrarInformacionMateria();
        comprobarLimitesMaximizado();
        capturarGrafo("grafo-desktop-maximizado", { capture: "viewport" });
        cy.get("#grafo-svg").trigger("keydown", { key: "Escape" });
        cy.get("#vista-grafo").should("not.have.class", "grafo-maximizado");
        cy.get("#grafo-maximizar").should("have.attr", "aria-pressed", "false");
        cy.get("#grafo-informacion").should("be.visible");
        cy.get(nodo("P2")).should("have.attr", "aria-pressed", "true");
        cy.get("#grafo-svg").trigger("keydown", { key: "Escape" });
        cy.get("#grafo-mas-info").should("not.be.visible");
        cy.get("#grafo-maximizar").click().click().should("have.attr", "aria-pressed", "false");
        cy.get("#vista-grafo").should("not.have.class", "grafo-maximizado");
    });

    it("salir del árbol restaura el tamaño y oculta su información en las otras vistas", () => {
        ["#materias", "#planificacion", "#avance"].forEach((destino) => {
            cy.get("#grafo-maximizar").click();
            cy.get("#vista-grafo").should("have.class", "grafo-maximizado");
            cy.get(destino).click();
            cy.get("#vista-grafo").should("not.be.visible").and("not.have.class", "grafo-maximizado");
            cy.get("#grafo-informacion").should("not.be.visible");
            abrirGrafo();
            cy.get("#grafo-maximizar").should("have.attr", "aria-pressed", "false");
            cy.get("#grafo-informacion").should("be.visible");
        });
    });

    it("evita que las conexiones atraviesen tarjetas o que las materias se superpongan en ambos planes", () => {
        comprobarGeometriaGrafo("Plan 1997 con opcionales");
        cy.get("#mi-toggle-MI").check({ force: true });
        cy.get(nodo("MI")).should("exist");
        comprobarGeometriaGrafo("Plan 1997 con Matemática Inicial y opcionales");
        cy.get("#mi-toggle-plan").check({ force: true });
        cy.get(nodo("IC")).should("exist");
        cy.get(nodo("MD1")).should("not.exist");
        comprobarGeometriaGrafo("Plan 2025 con Matemática Inicial y opcionales");
        cy.get("#mi-toggle-opcionales").uncheck({ force: true });
        cy.get(nodo("AGI")).should("not.exist");
        cy.get(nodo("MI")).should("exist");
        comprobarGeometriaGrafo("Plan 2025 con Matemática Inicial sin opcionales");
    });

    it("centra las obligatorias de cada nivel según el plan y el título, incluyendo PIS en Ingeniería", () => {
        let materias;
        cy.request("materias.json").then(({ body }) => {
            materias = new Map(body.map((materia) => [materia.id, materia]));
        });
        const comprobarBloques = (campoObligatoria) => {
            cy.document().then((doc) => {
                const posiciones = Array.from(doc.querySelectorAll(".grafo-nodo"), (elemento) => {
                    const transformacion = elemento.transform.baseVal.consolidate().matrix;
                    const tarjeta = elemento.querySelector(".grafo-tarjeta").getBBox();
                    return {
                        id: elemento.dataset.materia,
                        x: transformacion.e,
                        y: transformacion.f,
                        alto: tarjeta.height,
                        obligatoria: elemento.dataset.materia === "MI" || materias.get(elemento.dataset.materia)[campoObligatoria],
                    };
                });
                const filas = [...new Set(posiciones.map((p) => p.y))].sort((a, b) => a - b);
                const pasoFila = Math.min(...filas.slice(1).map((fila, indice) => fila - filas[indice]));
                const centroGlobal = (Math.min(...posiciones.map((p) => p.y)) + Math.max(...posiciones.map((p) => p.y + p.alto))) / 2;
                const columnas = new Map();
                posiciones.forEach((p) => {
                    if (!columnas.has(p.x)) columnas.set(p.x, []);
                    columnas.get(p.x).push(p);
                });
                let bloquesComprobados = 0;
                columnas.forEach((columna, x) => {
                    columna.sort((a, b) => a.y - b.y);
                    const obligatorias = columna.filter((p) => p.obligatoria);
                    if (!obligatorias.length) return;
                    bloquesComprobados++;
                    const primera = columna.findIndex((p) => p.obligatoria);
                    const bloque = columna.slice(primera, primera + obligatorias.length);
                    expect(bloque.every((p) => p.obligatoria), `${campoObligatoria}: bloque continuo en x=${x}`).to.equal(true);
                    const centroBloque = (obligatorias[0].y + obligatorias[obligatorias.length - 1].y + obligatorias[obligatorias.length - 1].alto) / 2;
                    expect(Math.abs(centroBloque - centroGlobal), `${campoObligatoria}: bloque centrado en x=${x}`).to.be.at.most(pasoFila / 2 + 1);
                });
                expect(bloquesComprobados).to.be.greaterThan(0);
                const pis = posiciones.find((p) => p.id === "PIS");
                if (materias.get("PIS")[campoObligatoria]) {
                    expect(Math.abs(pis.y + pis.alto / 2 - centroGlobal), "PIS cerca del centro del árbol").to.be.at.most(pasoFila);
                }
            });
        };
        comprobarBloques("obligatoriaIngenieria1997");
        capturarOrdenObligatorias();
        cy.get("#mi-toggle-MI").check({ force: true });
        comprobarBloques("obligatoriaIngenieria1997");
        cy.get("#mi-toggle-plan").check({ force: true });
        comprobarBloques("obligatoriaIngenieria2025");
        cy.get("#mi-toggle-plan").uncheck({ force: true });
        cy.get("#toggle-titulo-avance").check({ force: true });
        comprobarBloques("obligatoriaAnalista1997");
        cy.get("#mi-toggle-opcionales").uncheck({ force: true });
        cy.get(nodo("PIS")).should("not.exist");
        cy.get(nodo("MI")).should("exist");
        cy.get("#toggle-titulo-avance").uncheck({ force: true });
        cy.get(nodo("PIS")).should("exist");
        cy.get(nodo("MI")).should("exist");
    });

    it("respeta el plan, Matemática Inicial y las materias opcionales", () => {
        cy.get(nodo("MI")).should("not.exist");
        cy.get("#mi-toggle-MI").check({ force: true });
        cy.get(nodo("MI")).should("exist");
        cy.get(arista("MI", "CDIV", "exonerada")).should("exist");
        cy.get("#mi-toggle-plan").check({ force: true });
        cy.get(nodo("IC")).should("exist");
        cy.get(nodo("MD1")).should("not.exist");
        cy.get("#mi-toggle-plan").uncheck({ force: true });
        cy.get(nodo("MD1")).should("exist");
        cy.get(nodo("IC")).should("not.exist");
        cy.get("#mi-toggle-opcionales").uncheck({ force: true });
        cy.get(nodo("AGI")).should("not.exist");
        cy.get(nodo("P2")).should("exist");
        cy.get(nodo("MI")).should("exist");
        cy.get("#toggle-titulo-avance").check({ force: true });
        cy.get(nodo("MI")).should("exist");
        cy.get("#mi-toggle-plan").check({ force: true });
        cy.get(nodo("MI")).should("exist");
        cy.reload();
        cy.get("#mi-toggle-MI").should("be.checked");
        cy.get("#mi-toggle-opcionales").should("not.be.checked");
        cy.get(nodo("MI")).should("exist");
        cy.get("#mi-toggle-opcionales").check({ force: true });
        cy.get(nodo("AGI")).should("exist");
        cy.get("#mi-toggle-MI").uncheck({ force: true });
        cy.get(nodo("MI")).should("not.exist");
        cy.get(arista("MI", "CDIV")).should("not.exist");
        cy.get("#vista-grafo").should("be.visible");
        cy.get("#CDIV").should("not.be.visible");
    });

    it("conserva la pestaña al recargar y actualiza el estado al volver de Materias", () => {
        cy.reload();
        cy.get("#grafo").should("have.class", "activo");
        cy.get("#vista-grafo").should("be.visible");
        cy.get("#materias").click();
        cy.get("#vista-grafo").should("not.be.visible");
        cy.get("#CDIV").click();
        abrirGrafo();
        cy.get(nodo("CDIV")).should("have.attr", "data-estado", "aprobada");
        cy.get(nodo("CDIVV")).should("have.attr", "data-estado", "habilitada");
        cy.get("#planificacion").click();
        cy.get("#vista-grafo").should("not.be.visible");
        cy.get("#vista-planificacion").should("be.visible");
        abrirGrafo();
        cy.get("#avance").click();
        cy.get("#vista-grafo").should("not.be.visible");
        cy.get("#vista-avance").should("be.visible");
    });

    it("en móvil oculta Árbol y restaura Materias si la vista guardada era el grafo sin inicializarlo", () => {
        cy.viewport(390, 844);
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.clear();
                win.localStorage.setItem("vistaSeleccionada", "grafo");
                win.localStorage.setItem("materiasAprobadas", JSON.stringify(["CDIV"]));
                win.localStorage.setItem("materiasExoneradas", JSON.stringify(["CDIV"]));
                win.localStorage.setItem("seleccionOpcionales", "false");
            },
        });
        cy.get("#materias").should("have.class", "activo");
        cy.get("#CDIV").should("be.visible").and("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#grafo, #vista-grafo, #grafo-informacion").should("not.be.visible");
        cy.get("#grafo-svg").should("not.exist");
        cy.get("#label-ham").click();
        cy.get("#navbar").should("be.visible");
        cy.get("#navbar .navbar-boton:visible").should("not.contain.text", "Árbol");
        capturarGrafo("menu-mobile-sin-arbol", { capture: "viewport" });
        cy.get("#materias").click();
        cy.get("#P2").scrollIntoView().click();
        cy.get("#popup-container").should("be.visible");
        cy.get("#popup-materia-contenido").should("contain.text", "Programación 2");
        cerrarInformacionMateria();
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasAprobadas"))).to.deep.equal(["CDIV"]);
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.deep.equal(["CDIV"]);
            expect(win.localStorage.getItem("seleccionOpcionales")).to.equal("false");
            expect(win.localStorage.getItem("vistaSeleccionada")).to.equal("materias");
        });
    });

    it("al pasar un grafo maximizado y animado a móvil libera el scroll y conserva progreso y formularios", () => {
        cy.get("#materias").click();
        cy.get("#CDIV").click();
        abrirGrafo();
        let progreso;
        cy.window().then((win) => {
            progreso = ["materiasAprobadas", "materiasExoneradas", "planificacionSemestres"].map((clave) => win.localStorage.getItem(clave));
            cy.stub(win, "requestAnimationFrame").returns(987654);
        });
        cy.get("#grafo-maximizar").click();
        seleccionarMateria("P1", "P1");
        cy.get("#grafo-svg").should("have.attr", "data-propagando", "true");
        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").type("texto sin enviar");
        cy.viewport(390, 844);
        cy.get("#materias").should("have.class", "activo");
        cy.get("#grafo, #vista-grafo, #grafo-informacion").should("not.be.visible");
        cy.get("#vista-grafo").should("not.have.class", "grafo-maximizado");
        cy.get("#grafo-svg").should("not.have.attr", "data-propagando");
        cy.get(".grafo-propagacion-trazo, #grafo-svg defs mask").should("not.exist");
        cy.get("body, #secciones").should("not.have.class", "grafo-mapa-expandido");
        cy.document().then((doc) => {
            [doc.body, doc.getElementById("secciones")].forEach((elemento) => {
                expect(doc.defaultView.getComputedStyle(elemento).overflowY).not.to.equal("hidden");
            });
        });
        cy.get("#popup-importar-datos").should("be.visible");
        cy.get("#textarea-importar-datos").should("have.value", "texto sin enviar");
        cy.get("#cerrar-popup").click();
        cy.get("#PG").scrollIntoView().should("be.visible");
        cy.get("#CDIV").scrollIntoView().should("be.visible").and("have.css", "background-color", "rgb(173, 216, 230)");
        cy.viewport(1280, 900);
        abrirGrafo();
        cy.get("#vista-grafo").should("not.have.class", "grafo-maximizado");
        cy.get("#grafo-maximizar").should("have.attr", "aria-pressed", "false");
        cy.window().then((win) => {
            expect(["materiasAprobadas", "materiasExoneradas", "planificacionSemestres"].map((clave) => win.localStorage.getItem(clave)))
                .to.deep.equal(progreso);
        });
    });

    it("oculta Árbol a 675 px y permite abrirlo nuevamente desde 676 px", () => {
        cy.viewport(675, 844);
        cy.get("#materias").should("have.class", "activo");
        cy.get("#grafo, #vista-grafo, #grafo-informacion").should("not.be.visible");
        cy.get("#CDIV").should("be.visible");
        cy.viewport(676, 844);
        cy.get("#grafo").should("be.visible");
        abrirGrafo();
        cy.get("#grafo-informacion").should("be.visible");
        cy.viewport(675, 844);
        cy.get("#materias").should("have.class", "activo");
        cy.get("#grafo").should("not.be.visible");
    });
});
