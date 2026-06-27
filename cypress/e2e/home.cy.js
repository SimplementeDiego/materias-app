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
    const storage = {
        materiasAprobadas: JSON.stringify(datos.aprobadas ?? []),
        materiasExoneradas: JSON.stringify(datos.exoneradas ?? []),
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

const abrirElegirMaterias = () => {
    primerPeriodo().contains("summary", "Elegir materias").click();
};

const materiasParaElegir = () => primerPeriodo().find(".planificador-elegir-materias");

const materiasSeleccionadas = () => {
    return primerPeriodo().contains("Seleccionadas").next(".planificador-lista-botones");
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
        cy.get("#FC").should("not.exist");
        cy.get("#MD1").should("exist");
    });

    it("activa y desactiva matematica inicial", () => {
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("be.checked");
        cy.get("#MI").should("be.visible");

        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("not.be.checked");
        cy.get("#MI").should("not.exist");
    });

    it("activa y desactiva plan 2025", () => {
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("be.checked");
        cy.get("#FC").should("be.visible");
        cy.get("#IC").should("be.visible");
        cy.get("#MD1").should("not.exist");

        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("not.be.checked");
        cy.get("#MD1").should("be.visible");
        cy.get("#FC").should("not.exist");
        cy.get("#IC").should("not.exist");
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

        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get("#CTS").scrollIntoView().should("be.visible");
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

    it("abre y cierra el popup de areas", () => {
        cy.get("#popup-container").should("not.be.visible");

        cy.get("#areas").click();

        cy.get("#popup-container").should("be.visible");
        cy.get("#popup-container").should("contain", "Materias B");
        cy.get("#cerrar-popup").click();
        cy.get("#popup-container").should("not.be.visible");
    });

    it("resetea progreso, creditos y planificacion", () => {
        exonerarMateria("CDIV");
        cy.get("#titulo-principal-texto").should("contain", "13");
        irAPlanificacion();
        agregarPeriodo();

        cy.get("#reset").click();
        cy.get("#popup-container").should("be.visible");
        cy.get("#boton-confirmar-borrar").click();

        cy.get("#vista-planificacion").should("contain", "No hay semestres planificados");
        cy.get("#materias").click();
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
        cy.get("#seccion-filtros").should("not.be.visible");
        cy.get("#mi-toggle-opcionales").should("not.be.visible");

        cy.reload();

        cy.get("#planificacion").should("have.class", "activo");
        cy.get("#vista-planificacion").should("be.visible");
        cy.get("#seccion-informacion").should("be.visible");
        cy.get("#seccion-configuracion").should("be.visible");
        cy.get("#seccion-filtros").should("not.be.visible");
        cy.get("#mi-toggle-opcionales").should("not.be.visible");
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
            .should("be.visible")
            .and("have.class", "materia-fuera-semestre");
    });

    it("en periodo de examenes permite materias libres sin curso y no muestra no libres sin curso", () => {
        irAPlanificacion();
        agregarPeriodo();
        primerPeriodo().find("select.selector-planificador").select("examenes");
        abrirElegirMaterias();

        materiasParaElegir().contains("button", /Geometr.a y .lgebra Lineal 1 \(9\)/).click();
        materiasParaElegir().should("not.contain", "Programaci");

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
