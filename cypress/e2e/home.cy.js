const COLOR = {
    habilitada: "rgb(240, 128, 128)",
    aprobada: "rgb(173, 216, 230)",
    exonerada: "rgb(144, 238, 144)",
    deshabilitada: "rgb(128, 128, 128)",
};

const ejemploMaterias = [
    "GAL1",
    "MD1",
    "MI",
    "P1",
    "Ec",
    "F1",
    "CDIV",
    "GAL2",
    "LG",
    "MD2",
    "P2",
    "AC",
    "CDIVV",
    "P3",
    "P4",
    "AGI",
    "FBD",
    "PYE",
    "SO",
    "TP",
    "TL",
    "PAI",
    "IIO",
    "RC",
    "CCE",
    "ITI",
    "TACCE",
];

const estadoInicial = (datos = {}) => {
    const exoneradas = datos.exoneradas ?? [];
    const aprobadas = datos.aprobadas ?? exoneradas;
    const storage = {
        materiasAprobadas: JSON.stringify(aprobadas),
        materiasExoneradas: JSON.stringify(exoneradas),
        planificacionSemestres: JSON.stringify(datos.planificacion ?? []),
        planificacionUsaEstadoActual: JSON.stringify(datos.usaEstadoActual ?? true),
        planificacionExoneradasBase: JSON.stringify(datos.exoneradasBase ?? []),
        ...(datos.storage ?? {}),
    };

    cy.visit("/", {
        onBeforeLoad(win) {
            win.localStorage.clear();
            Object.entries(storage).forEach(([clave, valor]) => {
                win.localStorage.setItem(clave, valor);
            });
        },
    });
};

const colorMateria = (id, color) => {
    cy.get(`#${id}`).should("have.css", "background-color", color);
};

const materiaVisible = (id) => {
    cy.get(`#${id}`).scrollIntoView().should("be.visible");
};

const aprobarMateria = (id) => {
    cy.get(`#${id}`).click();
};

const exonerarMateria = (id) => {
    cy.get(`#${id}`).click();
    cy.get(`#${id}`).click();
};

const exonerarMaterias = (ids) => {
    ids.forEach(exonerarMateria);
};

const irAPlanificacion = () => {
    cy.get("#planificacion").click();
    cy.get("#vista-planificacion").should("be.visible");
};

const agregarPeriodo = () => {
    cy.contains("#vista-planificacion button", /Agregar per.odo/).click();
};

const primerPeriodo = () => cy.get("#vista-planificacion .planificador-semestre").first();

const periodo = (indice) => cy.get("#vista-planificacion .planificador-semestre").eq(indice);

const abrirElegirMaterias = () => {
    primerPeriodo().contains("summary", "Elegir materias").click();
};

const materiasParaElegir = () => primerPeriodo().find(".planificador-elegir-materias");

const materiasSeleccionadas = () => {
    return primerPeriodo().contains("Seleccionadas").next(".planificador-lista-botones");
};

const materiasSeleccionadasPeriodo = (indice) => {
    return periodo(indice).contains("Seleccionadas").next(".planificador-lista-botones");
};

const abrirMateriasExoneradasPlanificador = () => {
    cy.contains("#vista-planificacion summary", "Materias exoneradas").click();
};

const materiasExoneradasPlanificador = () => {
    return cy.contains("#vista-planificacion summary", "Materias exoneradas")
        .parent()
        .find(".planificador-lista-botones");
};

const requisitoCurriculo = (patron) => {
    return cy.get(".avance-curriculo-item").filter((_, item) => {
        const texto = item.querySelector(".avance-curriculo-contenido")?.textContent.trim() ?? "";
        return typeof patron === "string" ? texto === patron : patron.test(texto);
    });
};

const leerStorageCompleto = (win) => {
    const claves = Array.from({ length: win.localStorage.length }, (_, indice) => (
        win.localStorage.key(indice)
    )).filter(Boolean).sort();

    return Object.fromEntries(claves.map((clave) => [clave, win.localStorage.getItem(clave)]));
};

describe("Materias", () => {
    beforeEach(() => {
        estadoInicial();
    });

    it("carga la pagina en la vista de materias", () => {
        cy.get("body").should("be.visible");
        cy.get("#materias").should("have.class", "activo");
        cy.get("#vista-planificacion").should("not.be.visible");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
        cy.get("#seccion-filtros").should("be.visible");
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("muestra Proyecto de Grado solo en la ultima seccion", () => {
        materiaVisible("PG");
        cy.get("#secciones > .container-seccion").last().within(() => {
            cy.get(".boton-materia").should("have.length", 1).and("have.id", "PG");
        });
        cy.get("#secciones > .container-seccion").not(":last").find("#PG").should("not.exist");
    });

    it("activa y persiste el modo oscuro", () => {
        cy.get("#config-modo-oscuro").should("be.visible");
        cy.get("#mi-toggle-modo-oscuro").should("not.be.checked");

        cy.get('label[for="mi-toggle-modo-oscuro"]').click();

        cy.get("body").should("have.class", "modo-oscuro");
        cy.get("#mi-toggle-modo-oscuro").should("be.checked");
        cy.window().then((win) => {
            expect(win.localStorage.getItem("modoOscuro")).to.equal("true");
        });

        cy.reload();

        cy.get("body").should("have.class", "modo-oscuro");
        cy.get("#mi-toggle-modo-oscuro").should("be.checked");

        cy.get("#planificacion").click();
        cy.get("#config-modo-oscuro").should("be.visible");

        cy.get("#avance").click();
        cy.get("#config-modo-oscuro").should("be.visible");
    });

    it("vuelve desde avance a materias y restaura filtros y configuracion", () => {
        cy.get("#avance").click();
        cy.get("#vista-avance").should("be.visible");
        cy.get("#seccion-aviso-avance").should("be.visible");

        cy.get("#materias").click();

        cy.get("#materias").should("have.class", "activo");
        cy.get("#avance").should("not.have.class", "activo");
        cy.get("#vista-avance").should("not.be.visible");
        cy.get("#seccion-aviso-avance").should("not.be.visible");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
        cy.get("#seccion-filtros").should("be.visible");
        cy.get("#config-opcionales").should("be.visible");
        cy.get("#config-matematica-inicial").should("be.visible");
    });

    it("permite minimizar informacion, configuracion y filtros", () => {
        cy.get("#seccion-informacion summary").click();
        cy.get("#seccion-configuracion summary").click();
        cy.get("#seccion-filtros summary").click();

        cy.get("#seccion-informacion").should("not.have.attr", "open");
        cy.get("#seccion-configuracion").should("not.have.attr", "open");
        cy.get("#seccion-filtros").should("not.have.attr", "open");
    });

    it("cambia una materia habilitada entre aprobada, exonerada y habilitada", () => {
        colorMateria("GAL1", COLOR.habilitada);

        aprobarMateria("GAL1");
        colorMateria("GAL1", COLOR.aprobada);

        aprobarMateria("GAL1");
        colorMateria("GAL1", COLOR.exonerada);

        aprobarMateria("GAL1");
        colorMateria("GAL1", COLOR.habilitada);
    });

    it("no marca una materia deshabilitada y abre sus previas", () => {
        colorMateria("PYE", COLOR.deshabilitada);

        cy.get("#PYE").click();

        cy.get("#popup-container").should("be.visible");
        cy.get("#popup-materia-contenido").should("contain", "Previas");
        colorMateria("PYE", COLOR.deshabilitada);
    });

    it("mantiene consistentes las previas y los creditos al desmarcar", () => {
        exonerarMaterias(["CDIV", "MD1", "CDIVV"]);
        cy.get("#titulo-principal-texto").should("contain", "35");

        aprobarMateria("CDIV");

        colorMateria("CDIV", COLOR.habilitada);
        colorMateria("MD1", COLOR.exonerada);
        colorMateria("CDIVV", COLOR.deshabilitada);
        cy.get("#titulo-principal-texto").should("contain", "9");
    });

    it("elimina estados anteriores que dejan de cumplir una regla negativa", () => {
        exonerarMateria("HMA");
        aprobarMateria("MD1");
        exonerarMateria("LG");

        colorMateria("HMA", COLOR.deshabilitada);
        colorMateria("MD1", COLOR.aprobada);
        colorMateria("LG", COLOR.exonerada);
        cy.get("#titulo-principal-texto").should("contain", "12");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasAprobadas"))).to.have.members(["MD1", "LG"]);
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.have.members(["LG"]);
        });

        cy.reload();

        colorMateria("HMA", COLOR.deshabilitada);
        cy.get("#titulo-principal-texto").should("contain", "12");
    });

    it("mantiene el caso de AGI y PAI al perder creditos", () => {
        exonerarMaterias([
            "CDIV",
            "MD1",
            "P1",
            "CTS",
            "Ec",
            "F1",
            "CDIVV",
            "LG",
            "P2",
            "F2",
            "TRE",
            "AC",
            "DAED",
            "F3",
        ]);
        colorMateria("AGI", COLOR.deshabilitada);
        cy.get("#titulo-principal-texto").should("contain", "137");

        exonerarMateria("PCIC");
        colorMateria("AGI", COLOR.habilitada);
        cy.get("#titulo-principal-texto").should("contain", "140");

        exonerarMateria("AGI");
        exonerarMateria("PAI");
        cy.get("#titulo-principal-texto").should("contain", "150");

        aprobarMateria("PCIC");
        colorMateria("PCIC", COLOR.habilitada);
        colorMateria("AGI", COLOR.deshabilitada);
        colorMateria("PAI", COLOR.deshabilitada);
        cy.get("#titulo-principal-texto").should("contain", "137");
    });

    it("permite cargar un ejemplo largo y persistirlo al recargar", () => {
        cy.get('label[for="mi-toggle-MI"]').click();
        exonerarMaterias(ejemploMaterias);

        cy.get("#titulo-principal-texto").should("contain", "276");

        cy.reload();

        cy.get("#mi-toggle-MI").should("be.checked");
        ejemploMaterias.forEach((id) => {
            colorMateria(id, COLOR.exonerada);
        });
        cy.get("#titulo-principal-texto").should("contain", "276");
    });
});

describe("Configuracion y filtros", () => {
    beforeEach(() => {
        estadoInicial();
    });

    it("usa los valores default de configuracion", () => {
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get("#mi-toggle-plan").should("not.be.checked");
        cy.get("#mi-toggle-MI").should("not.be.checked");
        cy.get("#MI").should("not.exist");
        cy.get("#FC").should("exist");
        cy.get("#MD1").should("exist");
    });

    it("activa y desactiva matematica inicial", () => {
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("be.checked");
        materiaVisible("MI");

        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("not.be.checked");
        cy.get("#MI").should("not.exist");
    });

    it("activa y desactiva plan 2025", () => {
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("be.checked");
        materiaVisible("FC");
        materiaVisible("IC");
        cy.get("#MD1").should("not.exist");

        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("not.be.checked");
        materiaVisible("MD1");
        materiaVisible("FC");
        cy.get("#IC").should("not.exist");
    });

    it("usa la obligatoriedad de Ingenieria 2025 para mostrar y filtrar materias", () => {
        cy.get('label[for="mi-toggle-plan"]').click();

        cy.get("#FC").invoke("text").should("match", /\(9\)$/);
        cy.get("#IC").invoke("text").should("match", /\(5\)$/);
        cy.get("#PI").invoke("text").should("match", /\(10\)$/);
        cy.get("#CTS").invoke("text").should("match", /\*$/);

        cy.get('label[for="mi-toggle-opcionales"]').click();

        materiaVisible("FC");
        materiaVisible("IC");
        materiaVisible("PI");
        cy.get("#CTS").should("not.be.visible");
    });

    it("mantiene mutuamente excluyentes FC y MD1 en el Plan 1997", () => {
        exonerarMateria("FC");
        colorMateria("FC", COLOR.exonerada);
        colorMateria("MD1", COLOR.deshabilitada);

        aprobarMateria("FC");
        colorMateria("FC", COLOR.habilitada);
        colorMateria("MD1", COLOR.habilitada);

        exonerarMateria("MD1");
        colorMateria("MD1", COLOR.exonerada);
        colorMateria("FC", COLOR.deshabilitada);
    });

    it("acepta PI como previa equivalente a P1 y las mantiene mutuamente excluyentes", () => {
        colorMateria("P2", COLOR.deshabilitada);

        aprobarMateria("PI");
        colorMateria("PI", COLOR.aprobada);
        colorMateria("P2", COLOR.habilitada);

        aprobarMateria("PI");
        colorMateria("PI", COLOR.exonerada);
        colorMateria("P1", COLOR.deshabilitada);
        colorMateria("P2", COLOR.habilitada);

        aprobarMateria("PI");
        colorMateria("PI", COLOR.habilitada);
        colorMateria("P1", COLOR.habilitada);
        colorMateria("P2", COLOR.deshabilitada);

        exonerarMateria("P1");
        colorMateria("P1", COLOR.exonerada);
        colorMateria("PI", COLOR.deshabilitada);
        colorMateria("P2", COLOR.habilitada);
    });

    it("acepta PI exonerada en previas que exigian exonerar P1", () => {
        estadoInicial({
            aprobadas: ["PI", "MD1", "P2"],
            exoneradas: ["PI", "MD1"],
        });

        colorMateria("P3", COLOR.habilitada);
    });

    it("al exonerar una equivalente elimina la aprobacion de la otra", () => {
        aprobarMateria("PI");
        exonerarMateria("P1");

        colorMateria("P1", COLOR.exonerada);
        colorMateria("PI", COLOR.deshabilitada);
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasAprobadas"))).to.have.members(["P1"]);
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.have.members(["P1"]);
        });

        estadoInicial();
        aprobarMateria("P1");
        exonerarMateria("PI");

        colorMateria("PI", COLOR.exonerada);
        colorMateria("P1", COLOR.deshabilitada);
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasAprobadas"))).to.have.members(["PI"]);
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.have.members(["PI"]);
        });
    });

    it("conserva el estado de FC al cambiar entre planes", () => {
        exonerarMateria("FC");

        cy.get('label[for="mi-toggle-plan"]').click();
        colorMateria("FC", COLOR.exonerada);
        cy.get("#MD1").should("not.exist");

        cy.get('label[for="mi-toggle-plan"]').click();
        colorMateria("FC", COLOR.exonerada);
        colorMateria("MD1", COLOR.deshabilitada);
    });

    it("persiste plan 2025 y matematica inicial al recargar", () => {
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get('label[for="mi-toggle-MI"]').click();
        exonerarMaterias(["FC", "IC", "MI"]);
        cy.get("#titulo-principal-texto").should("contain", "18");

        cy.reload();

        cy.get("#mi-toggle-plan").should("be.checked");
        cy.get("#mi-toggle-MI").should("be.checked");
        colorMateria("FC", COLOR.exonerada);
        colorMateria("IC", COLOR.exonerada);
        colorMateria("MI", COLOR.exonerada);
        cy.get("#titulo-principal-texto").should("contain", "18");
    });

    it("oculta y muestra opcionales", () => {
        cy.get("#CTS").scrollIntoView().should("be.visible");

        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#mi-toggle-opcionales").should("not.be.checked");
        cy.get("#CTS").should("not.be.visible");

        cy.reload();

        cy.get("#mi-toggle-opcionales").should("not.be.checked");
        cy.get("#CTS").should("not.be.visible");

        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get("#CTS").scrollIntoView().should("be.visible");
    });

    it("cambia asteriscos de opcionales segun titulo", () => {
        cy.get("#config-titulo-avance").should("be.visible");
        cy.get("#PYE").invoke("text").should("match", /\(10\)$/);

        cy.get("#toggle-titulo-avance").check({ force: true });

        cy.get("#PYE").invoke("text").should("match", /\(10\)\*$/);
        cy.get("#CDIV").invoke("text").should("match", /\(13\)$/);
    });

    it("filtra por semestre y calidad libre", () => {
        cy.get("#select-filtrar-semestre").select("primero");
        cy.get("#CTS").scrollIntoView().should("be.visible");
        cy.get("#Ec").should("not.be.visible");

        cy.get("#select-filtrar-semestre").select("segundo");
        cy.get("#CTS").should("not.be.visible");
        cy.get("#Ec").scrollIntoView().should("be.visible");

        cy.get("#select-filtrar-semestre").select("libre");
        cy.get("#GAL1").scrollIntoView().should("be.visible");
        cy.get("#P1").should("not.be.visible");
    });

    it("filtra por texto ignorando tildes", () => {
        cy.get("#input-buscar-materia").type("economia");

        cy.get("#Ec").scrollIntoView().should("be.visible");
        cy.get("#GAL1").should("not.be.visible");
    });

    it("filtra por area", () => {
        cy.get("#select-filtrar-area").select("creditosEnProg");

        cy.get("#P1").scrollIntoView().should("be.visible");
        cy.get("#GAL1").should("not.be.visible");
    });
});

describe("Popups y datos guardados", () => {
    beforeEach(() => {
        estadoInicial();
    });

    it("no muestra el acceso ni el popup de ver areas", () => {
        cy.get("#areas").should("not.exist");
        cy.get("#popup-areas").should("not.exist");
    });

    it("resetea progreso, creditos y planificacion", () => {
        exonerarMateria("CDIV");
        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#titulo-principal-texto").should("contain", "13");
        irAPlanificacion();
        agregarPeriodo();

        cy.get("#reset").click();
        cy.get("#popup-container").should("be.visible");
        cy.get("#boton-confirmar-borrar").click();

        cy.get("#vista-planificacion").should("contain", "No hay semestres planificados");
        cy.get("#materias").click();
        cy.get("#mi-toggle-opcionales").should("be.checked");
        colorMateria("CDIV", COLOR.habilitada);
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("agrega y elimina creditos manuales", () => {
        cy.get("#ajustar-creditos").click();
        cy.get("#select-agregar-creditos").select("Total");
        cy.get("#input-agregar-creditos").type("5");
        cy.get("#boton-agregar-creditos").click();

        cy.get("#titulo-principal-texto").should("contain", "5");
        cy.get("#tabla-registros").should("contain", "Total");
        cy.get(".boton-eliminar-registro").click();
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("reconstruye los creditos por area desde los registros guardados", () => {
        estadoInicial({
            storage: {
                registros: JSON.stringify([{ area: "Total", creditos: 5 }]),
                creditosPorArea: JSON.stringify([["Total", 99]]),
            },
        });

        cy.get("#titulo-principal-texto").should("contain", "5");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("registros"))).to.deep.equal([
                { area: "Total", creditos: 5 },
            ]);
            expect(JSON.parse(win.localStorage.getItem("creditosPorArea"))).to.deep.equal([
                ["Total", 5],
            ]);
        });
    });

    it("descarta registros de creditos locales invalidos y persiste el estado limpio", () => {
        estadoInicial({
            storage: {
                registros: JSON.stringify([
                    { area: "Total", creditos: 1.5 },
                    { area: "areaDesconocida", creditos: 7 },
                    { area: "creditosEnProg", creditos: 3 },
                ]),
                creditosPorArea: JSON.stringify([
                    ["Total", 1.5],
                    ["areaDesconocida", 7],
                    ["creditosEnProg", 100],
                ]),
            },
        });

        cy.get("#titulo-principal-texto").should("contain", "3");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("registros"))).to.deep.equal([
                { area: "creditosEnProg", creditos: 3 },
            ]);
            expect(JSON.parse(win.localStorage.getItem("creditosPorArea"))).to.deep.equal([
                ["creditosEnProg", 3],
            ]);
        });
    });

    it("avisa sin alerts si los creditos manuales no son enteros", () => {
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });

        cy.get("#ajustar-creditos").click();
        cy.get("#select-agregar-creditos").select("Total");
        cy.get("#input-agregar-creditos").invoke("val", "1.5").trigger("input");
        cy.get("#boton-agregar-creditos").click();

        cy.get("#mensaje-usuario").should("contain", "entero");
        cy.get("@alert").should("not.have.been.called");
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("copia un backup con los datos relevantes", () => {
        exonerarMateria("GAL1");
        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#avance").click();
        cy.get("#mi-toggle-avance-faltantes").check({ force: true });

        cy.window().then((win) => {
            Object.defineProperty(win.navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: cy.stub().resolves().as("writeText"),
                },
            });
        });

        cy.get("#copiar-datos").click();

        cy.get("@writeText").should("have.been.calledOnce");
        cy.get("@writeText").then((stub) => {
            const textoCopiado = stub.getCall(0).args[0];
            const backup = JSON.parse(textoCopiado);
            expect(backup.aplicacion).to.equal("materias-app");
            expect(backup.version).to.equal(1);
            expect(JSON.parse(backup.datos.materiasExoneradas)).to.include("GAL1");
            expect(JSON.parse(backup.datos.seleccionOpcionales)).to.equal(false);
            expect(JSON.parse(backup.datos.avanceSoloFaltantes)).to.equal(true);
            expect(backup.datos.vistaSeleccionada).to.equal("avance");
        });
        cy.get("#mensaje-usuario").should("contain", "Datos copiados");
    });

    it("no borra datos al intentar cargar un JSON sin claves reconocidas", () => {
        exonerarMateria("GAL1");

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", "{\"foo\":1}").trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").should("contain", "no contiene datos reconocidos");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas"))).to.include("GAL1");
        });
        colorMateria("GAL1", COLOR.exonerada);
    });

    it("conserva todo el estado si un dato interno del JSON es invalido", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["MD1"]),
                materiasExoneradas: JSON.stringify(["MD1"]),
                semestre: "segundo",
                planificacionSemestres: '[{"semestre":"primero","materias":',
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#popup-container").should("be.visible");
        cy.get("#mensaje-usuario").should("contain", "planificacionSemestres");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
        colorMateria("MD1", COLOR.habilitada);
        cy.get("#mi-toggle-opcionales").should("not.be.checked");
    });

    it("rechaza creditos importados fraccionarios sin cambiar el estado", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                registros: JSON.stringify([{ area: "Total", creditos: 1.5 }]),
                creditosPorArea: JSON.stringify([["Total", 1.5]]),
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").invoke("text").should("match", /enter[oa]/);
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
    });

    it("rechaza exoneradas que no figuran tambien como aprobadas sin cambiar el estado", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["MD1"]),
                materiasExoneradas: JSON.stringify(["MD1", "GAL1"]),
                semestre: "segundo",
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#popup-container").should("be.visible");
        cy.get("#mensaje-usuario").should("contain", "no como aprobada");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
        colorMateria("MD1", COLOR.habilitada);
    });

    it("rechaza un estado importado con FC y MD1 exoneradas", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["FC", "MD1"]),
                materiasExoneradas: JSON.stringify(["FC", "MD1"]),
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").should("contain", "no pueden figurar juntas");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
    });

    it("rechaza un estado importado con P1 y PI exoneradas", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["P1", "PI"]),
                materiasExoneradas: JSON.stringify(["P1", "PI"]),
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").should("contain", "no pueden figurar juntas");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
    });

    it("permite equivalentes exoneradas en estados independientes al planificar desde cero", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["P1", "MD1"]),
                materiasExoneradas: JSON.stringify(["P1", "MD1"]),
                planificacionUsaEstadoActual: JSON.stringify(false),
                planificacionExoneradasBase: JSON.stringify(["PI", "FC"]),
            },
        };

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#popup-container").should("not.be.visible");
        cy.get("#mensaje-usuario").should("contain", "Datos cargados");
        colorMateria("P1", COLOR.exonerada);
        colorMateria("MD1", COLOR.exonerada);
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("planificacionUsaEstadoActual"))).to.equal(false);
            expect(JSON.parse(win.localStorage.getItem("planificacionExoneradasBase")))
                .to.have.members(["PI", "FC"]);
        });
    });

    it("rechaza equivalentes exoneradas dentro de la misma base independiente", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                planificacionUsaEstadoActual: JSON.stringify(false),
                planificacionExoneradasBase: JSON.stringify(["P1", "PI"]),
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").should("contain", "no pueden figurar juntas");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
    });

    it("permite importar pares equivalentes si estan solamente aprobados", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["P1", "PI", "MD1", "FC"]),
                materiasExoneradas: JSON.stringify([]),
            },
        };

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#popup-container").should("not.be.visible");
        cy.get("#mensaje-usuario").should("contain", "Datos cargados");
        colorMateria("P1", COLOR.aprobada);
        colorMateria("PI", COLOR.aprobada);
        colorMateria("MD1", COLOR.aprobada);
        colorMateria("FC", COLOR.aprobada);
    });

    it("restaura el estado anterior si localStorage falla durante la escritura", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["MD1"]),
                materiasExoneradas: JSON.stringify(["MD1"]),
                planificacionSemestres: JSON.stringify([]),
            },
        };
        let storageAnterior;

        exonerarMateria("GAL1");
        cy.window().then((win) => {
            storageAnterior = leerStorageCompleto(win);
            const storagePrototype = win.Storage.prototype;
            const setItemOriginal = storagePrototype.setItem;
            let escrituraInterrumpida = false;

            cy.stub(storagePrototype, "setItem").callsFake(function (clave, valor) {
                if (!escrituraInterrumpida && clave === "planificacionSemestres") {
                    escrituraInterrumpida = true;
                    throw new Error("Fallo simulado de localStorage");
                }
                return setItemOriginal.call(this, clave, valor);
            });
        });

        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#mensaje-usuario").should("contain", "estado anterior se conservó");
        cy.window().then((win) => {
            expect(leerStorageCompleto(win)).to.deep.equal(storageAnterior);
        });
        colorMateria("GAL1", COLOR.exonerada);
        colorMateria("MD1", COLOR.habilitada);
    });

    it("carga un JSON valido y actualiza el estado sin recargar la pagina", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["GAL1"]),
                materiasExoneradas: JSON.stringify(["GAL1"]),
                semestre: "segundo",
            },
        };

        irAPlanificacion();
        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#popup-container").should("not.be.visible");
        cy.get("#mensaje-usuario").should("contain", "Datos cargados");
        cy.get("#materias").should("have.class", "activo");
        cy.get("#planificacion").should("not.have.class", "activo");
        colorMateria("GAL1", COLOR.exonerada);
        cy.get("#select-filtrar-semestre").should("have.value", "segundo");
    });

    it("carga un JSON desde avance sin dejar la vista vieja activa", () => {
        const backup = {
            aplicacion: "materias-app",
            version: 1,
            datos: {
                materiasAprobadas: JSON.stringify(["GAL1"]),
                materiasExoneradas: JSON.stringify(["GAL1"]),
                vistaSeleccionada: "materias",
            },
        };

        cy.get("#avance").click();
        cy.get("#importar-datos").click();
        cy.get("#textarea-importar-datos").invoke("val", JSON.stringify(backup)).trigger("input");
        cy.get("#boton-cargar-datos").click();

        cy.get("#materias").should("have.class", "activo");
        cy.get("#avance").should("not.have.class", "activo");
        cy.get("#seccion-aviso-avance").should("not.be.visible");
        colorMateria("GAL1", COLOR.exonerada);
    });
});

describe("Planificacion", () => {
    beforeEach(() => {
        estadoInicial();
    });

    it("muestra planificacion en pagina y la mantiene al recargar", () => {
        irAPlanificacion();

        cy.get("#planificacion").should("have.class", "activo");
        cy.get("#vista-planificacion").should("contain", "Planificaci");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
        cy.get("#config-titulo-avance").should("be.visible");
        cy.get("#seccion-filtros").should("not.be.visible");
        cy.get("#mi-toggle-opcionales").should("not.be.visible");

        cy.reload();

        cy.get("#planificacion").should("have.class", "activo");
        cy.get("#vista-planificacion").should("be.visible");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
        cy.get("#config-titulo-avance").should("be.visible");
        cy.get("#seccion-filtros").should("not.be.visible");
        cy.get("#mi-toggle-opcionales").should("not.be.visible");
    });

    it("usa PI aprobada como previa equivalente para ofrecer P2", () => {
        estadoInicial({ aprobadas: ["PI"] });
        irAPlanificacion();
        agregarPeriodo();
        primerPeriodo().contains("label", "Mostrar materias fuera").click();
        abrirElegirMaterias();

        materiasParaElegir().contains("button", /Programaci.n 2 \(12\)/)
            .scrollIntoView()
            .should("be.visible")
            .and("have.class", "materia-fuera-semestre");
    });

    it("normaliza la planificacion al cambiar el estado actual con la pestaña cerrada", () => {
        estadoInicial({
            aprobadas: ["P1"],
            planificacion: [
                {
                    semestre: "primero",
                    materias: [{ nombre: "P2", resultado: "curso" }],
                    abierto: true,
                },
            ],
        });

        cy.get("#materias").should("have.class", "activo");
        cy.get("#P1").click().click();

        cy.get("#materias").should("have.class", "activo");
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([]);
        });
    });

    it("elimina la equivalente exonerada y recalcula los periodos posteriores", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [
                        { nombre: "P1", resultado: "curso" },
                        { nombre: "PI", resultado: "curso" },
                    ],
                    abierto: true,
                    mostrarMateriasNoDictadas: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "P2", resultado: "habilitada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(0).should("contain", "Programación 1");
        materiasSeleccionadasPeriodo(0).should("contain", "Programación Imperativa");
        materiasSeleccionadasPeriodo(1).should("contain", "Programación 2");

        materiasSeleccionadasPeriodo(0).contains("button", /Programaci.n Imperativa \(10\)/).click();

        materiasSeleccionadasPeriodo(0).should("not.contain", "Programación 1");
        materiasSeleccionadasPeriodo(0).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        materiasSeleccionadasPeriodo(1).should("contain", "Programación 2");
        periodo(0).contains("summary", "Elegir materias").click();
        periodo(0).find(".planificador-elegir-materias").should("not.contain", "Programación 1");

        materiasSeleccionadasPeriodo(0).contains("button", /Programaci.n Imperativa \(10\)/).click();

        materiasSeleccionadasPeriodo(1).should("contain", "Sin materias seleccionadas");
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([
                { nombre: "PI", resultado: "habilitada" },
            ]);
            expect(planificacion[1].materias).to.deep.equal([]);
        });
    });

    it("al exonerar PI despues elimina solo el curso de P1 y conserva el de P2", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "P1", resultado: "curso" }],
                    abierto: true,
                    mostrarMateriasNoDictadas: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "P2", resultado: "curso" }],
                    abierto: true,
                    mostrarMateriasNoDictadas: true,
                },
                {
                    semestre: "segundo",
                    materias: [{ nombre: "PI", resultado: "curso" }],
                    abierto: true,
                    mostrarMateriasNoDictadas: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(2).contains("button", /Programaci.n Imperativa \(10\)/).click();

        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).should("contain", "Programación 2");
        materiasSeleccionadasPeriodo(2).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([]);
            expect(planificacion[1].materias).to.deep.equal([
                { nombre: "P2", resultado: "curso" },
            ]);
            expect(planificacion[2].materias).to.deep.equal([
                { nombre: "PI", resultado: "exonerada" },
            ]);
        });

        cy.reload();

        cy.get("#planificacion").should("have.class", "activo");
        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).should("contain", "Programación 2");
        materiasSeleccionadasPeriodo(2).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([]);
            expect(planificacion[1].materias).to.deep.equal([
                { nombre: "P2", resultado: "curso" },
            ]);
            expect(planificacion[2].materias).to.deep.equal([
                { nombre: "PI", resultado: "exonerada" },
            ]);
        });

        materiasSeleccionadasPeriodo(2).contains("button", /Programaci.n Imperativa \(10\)/).click();

        materiasSeleccionadasPeriodo(1).should("contain", "Sin materias seleccionadas");
    });

    it("ofrece P2 en un periodo intermedio si PI queda exonerada despues", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "P1", resultado: "curso" }],
                    abierto: true,
                },
                {
                    semestre: "primero",
                    materias: [],
                    abierto: true,
                    mostrarMateriasNoDictadas: true,
                },
                {
                    semestre: "segundo",
                    materias: [{ nombre: "PI", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        periodo(1).contains("summary", "Elegir materias").click();

        periodo(1).find(".planificador-elegir-materias")
            .contains("button", /Programaci.n 2 \(12\)/)
            .should("be.visible");
    });

    it("reemplaza una exoneracion equivalente sin perder materias que siguen habilitadas", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "P1", resultado: "exonerada" }],
                    abierto: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "P2", resultado: "exonerada" }],
                    abierto: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "DAED", resultado: "curso" }],
                    abierto: true,
                },
                {
                    semestre: "segundo",
                    materias: [{ nombre: "PI", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).contains("button", /Programaci.n 2 \(12\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        materiasSeleccionadasPeriodo(2).contains("button", /Did.ctica de Algoritmos/)
            .should("have.css", "background-color", COLOR.aprobada);
        materiasSeleccionadasPeriodo(3).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([]);
            expect(planificacion[1].materias).to.deep.equal([
                { nombre: "P2", resultado: "exonerada" },
            ]);
            expect(planificacion[2].materias).to.deep.equal([
                { nombre: "DAED", resultado: "curso" },
            ]);
            expect(planificacion[3].materias).to.deep.equal([
                { nombre: "PI", resultado: "exonerada" },
            ]);
        });

        cy.reload();

        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).should("contain", "Programación 2");
        materiasSeleccionadasPeriodo(2).should("contain", "Didáctica de Algoritmos");
        materiasSeleccionadasPeriodo(3).should("contain", "Programación Imperativa");
    });

    it("descarta un examen invalido de P1 sin eliminar el curso planificado de PI", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "PI", resultado: "curso" }],
                    abierto: true,
                },
                {
                    semestre: "examenes",
                    materias: [{ nombre: "P1", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(0).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.aprobada);
        materiasSeleccionadasPeriodo(1).should("contain", "Sin materias seleccionadas");
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([
                { nombre: "PI", resultado: "curso" },
            ]);
            expect(planificacion[1].materias).to.deep.equal([]);
        });

        cy.reload();

        materiasSeleccionadasPeriodo(0).should("contain", "Programación Imperativa");
        materiasSeleccionadasPeriodo(1).should("contain", "Sin materias seleccionadas");
    });

    it("conserva una exoneracion valida de PI en examen al normalizar y recargar", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "PI", resultado: "curso" }],
                    abierto: true,
                },
                {
                    semestre: "examenes",
                    materias: [{ nombre: "PI", resultado: "habilitada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(1).contains("button", /Programaci.n Imperativa \(10\)/).click();

        materiasSeleccionadasPeriodo(0).should("contain", "Programación Imperativa");
        materiasSeleccionadasPeriodo(1).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([
                { nombre: "PI", resultado: "curso" },
            ]);
            expect(planificacion[1].materias).to.deep.equal([
                { nombre: "PI", resultado: "exonerada" },
            ]);
        });

        cy.reload();

        materiasSeleccionadasPeriodo(0).should("contain", "Programación Imperativa");
        materiasSeleccionadasPeriodo(1).contains("button", /Programaci.n Imperativa \(10\)/)
            .should("have.css", "background-color", COLOR.exonerada);
    });

    it("elimina de la planificacion una materia que deja de cumplir una regla negativa", () => {
        estadoInicial({
            planificacion: [
                {
                    semestre: "segundo",
                    materias: [{ nombre: "HMA", resultado: "exonerada" }],
                    abierto: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "MD1", resultado: "curso" }],
                    abierto: true,
                },
                {
                    semestre: "primero",
                    materias: [{ nombre: "LG", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).should("contain", "Matemática Discreta 1");
        materiasSeleccionadasPeriodo(2).should("contain", "Lógica");
        periodo(2).find("> summary").should("contain", "total 12");

        cy.reload();

        materiasSeleccionadasPeriodo(0).should("contain", "Sin materias seleccionadas");
        materiasSeleccionadasPeriodo(1).should("contain", "Matemática Discreta 1");
        materiasSeleccionadasPeriodo(2).should("contain", "Lógica");
    });

    it("depura reglas negativas en la base independiente de la planificacion", () => {
        estadoInicial({
            usaEstadoActual: false,
            exoneradasBase: ["HMA", "MD1", "LG"],
        });
        irAPlanificacion();

        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("planificacionExoneradasBase")))
                .to.have.members(["MD1", "LG"]);
        });
        cy.contains("#vista-planificacion summary", "Materias exoneradas (2)").should("be.visible");
    });

    it("mantiene coherente la proyeccion sin modificar el estado actual", () => {
        estadoInicial({
            aprobadas: ["HMA", "MD1"],
            exoneradas: ["HMA", "MD1"],
            planificacion: [
                {
                    semestre: "primero",
                    materias: [{ nombre: "LG", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });
        irAPlanificacion();

        materiasSeleccionadasPeriodo(0).should("contain", "Lógica");
        periodo(0).find("> summary").should("contain", "total 21");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem("materiasExoneradas")))
                .to.have.members(["HMA", "MD1"]);
        });
    });

    it("muestra informacion al ir desde avance a planificacion", () => {
        cy.get("#avance").click();
        cy.get("#seccion-informacion").should("not.be.visible");

        cy.get("#planificacion").click();

        cy.get("#planificacion").should("have.class", "activo");
        cy.get("#vista-planificacion").should("be.visible");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
    });

    it("vuelve desde planificacion a materias", () => {
        irAPlanificacion();

        cy.get("#materias").click();

        cy.get("#materias").should("have.class", "activo");
        cy.get("#vista-planificacion").should("not.be.visible");
        cy.get("#seccion-filtros").should("be.visible");
        cy.get("#GAL1").scrollIntoView().should("be.visible");
    });

    it("agrega un periodo, elige materias y cambia el resultado planificado", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();

        primerPeriodo().contains("summary", /Semestre \(0 materias/).should("exist");
        primerPeriodo().contains("button", "Aplicar al estado actual").should("be.visible");
        materiasParaElegir().contains("button", /C.lculo DIV \(13\)/).click();

        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/)
            .should("have.css", "background-color", COLOR.habilitada);

        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/)
            .should("have.css", "background-color", COLOR.aprobada);

        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/)
            .should("have.css", "background-color", COLOR.exonerada);

        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/)
            .should("have.css", "background-color", COLOR.habilitada);

        materiasSeleccionadas().contains("button", /^X$/).click();
        materiasSeleccionadas().should("contain", "Sin materias seleccionadas");
    });

    it("permite cambiar el nombre de un periodo y persistirlo", () => {
        irAPlanificacion();
        agregarPeriodo();

        primerPeriodo().find(".input-nombre-planificador").clear().type("Segundo año");
        primerPeriodo().contains("summary", /Segundo a.o \(0 materias/).should("exist");

        cy.reload();

        primerPeriodo().find(".input-nombre-planificador").should("have.value", "Segundo año");
        primerPeriodo().contains("summary", /Segundo a.o \(0 materias/).should("exist");
    });

    it("muestra creditos y asterisco de opcionales al elegir materias", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();

        materiasParaElegir().contains("button", /C.lculo DIV \(13\)/).should("be.visible");
        materiasParaElegir().find("button").then(($botones) => {
            const textos = [...$botones].map((boton) => boton.textContent);
            expect(textos.some((texto) => /\(\d+\)\*$/.test(texto))).to.equal(true);
        });
    });

    it("filtra opcionales por periodo en planificacion", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();

        materiasParaElegir().contains("button", /Ciencia, Tecnolog.a y Sociedad \(8\)\*/).should("be.visible");

        primerPeriodo().contains("label", "Mostrar opcionales").click();

        materiasParaElegir().should("not.contain", "Ciencia, Tecnolog");
        materiasParaElegir().contains("button", /C.lculo DIV \(13\)/).should("be.visible");
    });

    it("no muestra secciones de materias al cambiar configuracion dentro de planificacion", () => {
        irAPlanificacion();
        agregarPeriodo();

        cy.get('label[for="mi-toggle-MI"]').click();

        cy.get("#vista-planificacion").should("be.visible");
        cy.get("#MI").should("not.be.visible");
    });

    it("oculta por defecto materias fuera del periodo o sin inscripcion y las muestra con toggle", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();

        materiasParaElegir().should("not.contain", "Matem");

        primerPeriodo().contains("label", "Mostrar materias fuera").click();

        materiasParaElegir().contains("button", /Matem.tica Discreta 1 \(9\)/)
            .scrollIntoView()
            .should("be.visible")
            .and("have.class", "materia-fuera-semestre");
    });

    it("en periodo de examenes permite materias libres sin curso y no muestra no libres sin curso", () => {
        irAPlanificacion();
        agregarPeriodo();
        primerPeriodo().find("select.selector-planificador").select("examenes");
        primerPeriodo().contains("label", "Mostrar materias fuera").click();
        abrirElegirMaterias();

        materiasParaElegir().contains("button", /Programaci.n Imperativa \(10\)\*/)
            .scrollIntoView()
            .should("be.visible");
        materiasParaElegir().contains("button", /^Programaci.n 1 \(10\)$/).should("not.exist");
        materiasParaElegir().contains("button", /^Programaci.n 2 \(12\)$/).should("not.exist");
        materiasParaElegir().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();

        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/)
            .should("have.css", "background-color", COLOR.habilitada);

        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();
        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/)
            .should("have.css", "background-color", COLOR.exonerada);

        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();
        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/)
            .should("have.css", "background-color", COLOR.habilitada);
    });

    it("aplica el primer periodo al estado actual y elimina esa seccion", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();
        materiasParaElegir().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();

        primerPeriodo().contains("button", "Aplicar al estado actual").click();

        cy.get("#vista-planificacion").should("contain", "No hay semestres planificados");
        cy.get("#materias").click();
        colorMateria("CDIV", COLOR.exonerada);
        cy.get("#titulo-principal-texto").should("contain", "13");
    });

    it("oculta aplicar al estado actual cuando se empieza de cero", () => {
        irAPlanificacion();
        cy.get("#toggle-estado-actual-planificador").uncheck({ force: true });
        agregarPeriodo();

        primerPeriodo().contains("button", "Aplicar al estado actual").should("not.exist");
    });

    it("permite planificar desde cero con materias base sin cambiar el estado real", () => {
        irAPlanificacion();
        cy.get("#toggle-estado-actual-planificador").uncheck({ force: true });
        abrirMateriasExoneradasPlanificador();
        materiasExoneradasPlanificador().contains("button", /C.lculo DIV \(13\)/).click();

        abrirMateriasExoneradasPlanificador();
        materiasExoneradasPlanificador().contains("button", /C.lculo DIV \(13\)/)
            .should("have.css", "background-color", COLOR.exonerada);

        agregarPeriodo();
        abrirElegirMaterias();
        materiasParaElegir().contains("button", /C.lculo DIVV \(13\)/).should("be.visible");

        cy.get("#materias").click();
        colorMateria("CDIV", COLOR.habilitada);
    });

    it("aplica cursos aprobados del primer periodo sin sumarlos como creditos", () => {
        irAPlanificacion();
        agregarPeriodo();
        abrirElegirMaterias();
        materiasParaElegir().contains("button", /C.lculo DIV \(13\)/).click();
        materiasSeleccionadas().contains("button", /C.lculo DIV \(13\)/).click();

        primerPeriodo().contains("button", "Aplicar al estado actual").click();

        cy.get("#materias").click();
        colorMateria("CDIV", COLOR.aprobada);
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("permite minimizar y eliminar periodos planificados", () => {
        irAPlanificacion();
        agregarPeriodo();

        primerPeriodo().find("> summary").click();
        primerPeriodo().should("not.have.attr", "open");

        cy.reload();

        primerPeriodo().should("not.have.attr", "open");
        primerPeriodo().find("> summary").click();
        primerPeriodo().contains("button", "Eliminar").click();
        cy.get("#vista-planificacion").should("contain", "No hay semestres planificados");
    });

    it("persiste periodos, tipo y materias al recargar", () => {
        irAPlanificacion();
        agregarPeriodo();
        primerPeriodo().find("select.selector-planificador").select("examenes");
        abrirElegirMaterias();
        materiasParaElegir().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();
        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();

        cy.reload();

        cy.get("#planificacion").should("have.class", "activo");
        primerPeriodo().find("select.selector-planificador").should("have.value", "examenes");
        materiasSeleccionadas().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/)
            .should("have.css", "background-color", COLOR.exonerada);
    });
});

describe("Avance", () => {
    beforeEach(() => {
        estadoInicial();
    });

    it("muestra el avance de ingenieria y lo mantiene al recargar", () => {
        cy.get("#avance").click();

        cy.get("#avance").should("have.class", "activo");
        cy.get("#vista-avance").should("be.visible");
        cy.get("#seccion-aviso-avance").should("be.visible").and("contain", "Puede contener errores");
        cy.get("#seccion-informacion").should("not.be.visible");
        cy.get("#vista-avance").should("contain", "Créditos totales: 0/450");
        cy.get("#vista-avance").should("contain", "Faltan 450 créditos");
        cy.get("#vista-avance").should("contain", "Grupo de materias básicas");
        cy.get("#vista-avance").should("contain", "Unidades curriculares necesarias");
        cy.get("#config-titulo-avance").should("be.visible");
        cy.get("#config-avance-faltantes").should("be.visible");
        cy.get("#config-matematica-inicial").should("not.be.visible");
        cy.get("#config-plan-2025").should("not.be.visible");
        cy.get("#config-opcionales").should("not.be.visible");
        cy.get("#vista-avance #toggle-titulo-avance").should("not.exist");

        cy.reload();

        cy.get("#avance").should("have.class", "activo");
        cy.get("#vista-avance").should("be.visible");
        cy.get("#seccion-informacion").should("not.be.visible");
    });

    it("marca requisitos curriculares cumplidos con materias exoneradas", () => {
        estadoInicial({ exoneradas: ["CDIV"] });

        cy.get("#avance").click();

        cy.get("#vista-avance").should("contain", "Créditos totales: 13/450");
        requisitoCurriculo(/^C.lculo DIV$/).should("have.class", "cumplido");

        cy.get("#mi-toggle-avance-faltantes").check({ force: true });

        requisitoCurriculo(/^C.lculo DIV$/).should("not.exist");
        cy.contains(".avance-requisito", /Matem.tica/).within(() => {
            cy.contains("summary", /Materias de/).click();
            cy.contains("Materias ya hechas").should("not.exist");
            cy.contains("Materias disponibles");
        });

        cy.reload();

        cy.get("#mi-toggle-avance-faltantes").should("be.checked");
        requisitoCurriculo(/^C.lculo DIV$/).should("not.exist");
    });

    it("permite ver avance proyectado hasta un periodo planificado", () => {
        estadoInicial({
            exoneradas: ["GAL1"],
            planificacion: [
                {
                    semestre: "primero",
                    materias: [{ nombre: "CDIV", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });

        cy.get("#avance").click();

        cy.get("#vista-avance").should("contain", "Créditos totales: 9/450");
        cy.contains(".avance-selector-planificacion", "Ver avance").should("be.visible");
        cy.contains(".avance-radio-opcion", "Actual").find("input").should("be.checked");

        cy.contains(".avance-radio-opcion", /Hasta .*Semestre/).find("input").check();

        cy.get("#vista-avance").should("contain", "Créditos totales: 22/450");
        requisitoCurriculo(/^C.lculo DIV$/).should("have.class", "cumplido");

        cy.reload();

        cy.contains(".avance-radio-opcion", /Hasta .*Semestre/).find("input").should("be.checked");
        cy.get("#vista-avance").should("contain", "Créditos totales: 22/450");
    });

    it("descarta del avance proyectado materias que perdieron sus previas", () => {
        estadoInicial({
            aprobadas: ["CDIV"],
            planificacion: [
                {
                    semestre: "primero",
                    materias: [{ nombre: "CDIVV", resultado: "exonerada" }],
                    abierto: true,
                },
            ],
        });

        colorMateria("CDIV", COLOR.aprobada);
        cy.get("#CDIV").click().click();
        colorMateria("CDIV", COLOR.habilitada);

        cy.get("#avance").click();
        cy.contains(".avance-radio-opcion", /Hasta .*Semestre/).find("input").check();

        cy.get("#vista-avance").should("contain", "Créditos totales: 0/450");
        requisitoCurriculo(/^C.lculo DIVV$/).should("not.have.class", "cumplido");
        cy.window().then((win) => {
            const planificacion = JSON.parse(win.localStorage.getItem("planificacionSemestres"));
            expect(planificacion[0].materias).to.deep.equal([]);
        });
    });

    it("vuelve a avance actual si se elimina el periodo proyectado seleccionado", () => {
        estadoInicial({
            planificacion: [
                { semestre: "primero", materias: [], abierto: true },
                { semestre: "segundo", materias: [], abierto: true },
            ],
        });

        cy.get("#avance").click();
        cy.get(".avance-radio-opcion").last().find("input").check();

        cy.window().then((win) => {
            expect(win.localStorage.getItem("avancePlanificacion")).to.equal("planificacion-1");
        });

        cy.get("#planificacion").click();
        cy.get("#vista-planificacion .planificador-semestre").eq(1).contains("button", "Eliminar").click();

        cy.window().then((win) => {
            expect(win.localStorage.getItem("avancePlanificacion")).to.equal("actual");
        });

        cy.get("#avance").click();
        cy.contains(".avance-radio-opcion", "Actual").find("input").should("be.checked");
    });

    it("permite expandir las materias asociadas a un area", () => {
        estadoInicial({ exoneradas: ["CDIV"] });

        cy.get("#avance").click();
        cy.contains(".avance-requisito", /Matem.tica/).within(() => {
            cy.contains("summary", /Materias de Matem.tica/).click();
            cy.contains("Materias ya hechas");
            cy.contains(/C.lculo DIV/);
            cy.contains("Materias disponibles");
        });
    });

    it("permite ver y persistir el avance de analista", () => {
        cy.get("#avance").click();
        cy.get("#toggle-titulo-avance").check({ force: true });

        cy.get("#vista-avance").should("contain", "Avance para Analista en Computación");
        cy.get("#vista-avance").should("contain", "Créditos totales: 0/270");
        cy.get("#vista-avance").should("contain", "Faltan 270 créditos");
        cy.get("#vista-avance").should("not.contain", "Grupo optativas");
        cy.contains(".avance-requisito", /Matem.tica/).within(() => {
            cy.contains(".avance-requisito-creditos", "0/0");
            cy.contains("summary", /Materias de Matem.tica/).click();
            cy.contains("Materias disponibles");
        });

        cy.reload();

        cy.get("#toggle-titulo-avance").should("be.checked");
        cy.get("#vista-avance").should("contain", "Créditos totales: 0/270");
    });
});

describe("Mobile", () => {
    beforeEach(() => {
        estadoInicial();
        cy.viewport(390, 800);
        cy.reload();
    });

    it("abre el menu sin empujar el contenido", () => {
        cy.get("#secciones").then(($secciones) => {
            const topAntes = $secciones[0].getBoundingClientRect().top;

            cy.get("#label-ham").click();

            cy.get("#navbar").should("be.visible").and("have.css", "position", "fixed");
            cy.get("#secciones").should(($actual) => {
                expect($actual[0].getBoundingClientRect().top).to.be.at.most(topAntes);
            });
        });
    });
});
