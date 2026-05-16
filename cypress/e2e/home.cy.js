describe("Home", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("abre la página", () => {
        cy.get("body").should("be.visible");
    });

    it("marca una materia aprobada al hacer click", () => {
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(173, 216, 230)");
    });

    it("marca una materia exonerada al hacer click", () => {
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
    });

    it("desmarca una materia al hacer click otra vez", () => {
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(240, 128, 128)");
    });

    it("revisar valores default de los switches", () => {
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get("#mi-toggle-plan").should("not.be.checked");
        cy.get("#mi-toggle-MI").should("not.be.checked");
    });

    it("default matematica inicial", () => {
        cy.get("#MI").should("not.exist");
    });

    it("default plan 1997", () => {
        cy.get("#FC").should("not.exist");
        cy.get("#MD1").should("exist");
        cy.get("#MD1").should("be.visible");
    });

    it("default opcionales", () => {
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("be.visible");
    });

    it("activar y desactivar las opcionales", () => {
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#mi-toggle-opcionales").should("not.be.checked");
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("not.be.visible");
        cy.get('label[for="mi-toggle-opcionales"]').click();
        cy.get("#mi-toggle-opcionales").should("be.checked");
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("be.visible");
    });

    it("activar y desactivar matematica inicial", () => {
        cy.get("#mi-toggle-MI").should("not.be.checked");
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("be.checked");
        cy.get("#MI").should("exist");
        cy.get("#MI").should("be.visible");
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#mi-toggle-MI").should("not.be.checked");
        cy.get("#MI").should("not.exist");
    });

    it("activar y desactivar plan 2025", () => {
        cy.get("#mi-toggle-plan").should("not.be.checked");
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("be.checked");
        cy.get("#FC").should("exist");
        cy.get("#FC").should("be.visible");
        cy.get("#MD1").should("not.exist");
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get("#mi-toggle-plan").should("not.be.checked");
        cy.get("#MD1").should("exist");
        cy.get("#MD1").should("be.visible");
        cy.get("#FC").should("not.exist");
    });

    it("default ambos semestres", () => {
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("be.visible");
        cy.get("#Ec").should("exist");
        cy.get("#Ec").should("be.visible");
    });

    it("probar 1er, 2do y calidad libre", () => {
        cy.get("#primero").click();
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("be.visible");
        cy.get("#Ec").should("exist");
        cy.get("#Ec").should("not.be.visible");
        cy.get("#segundo").click();
        cy.get("#CTS").should("exist");
        cy.get("#CTS").should("not.be.visible");
        cy.get("#Ec").should("exist");
        cy.get("#Ec").should("be.visible");
        cy.get("#libre").click();
        cy.get("#P1").should("exist");
        cy.get("#P1").should("not.be.visible");
    });

    it("probar previas", () => {
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PYE").click();
        cy.get("#PYE").click();
        cy.get("#PYE").should("have.css", "background-color", "rgb(144, 238, 144)");
    });

    it("probar reset", () => {
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PYE").click();
        cy.get("#PYE").click();
        cy.get("#PYE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#popup-container").should("not.be.visible");
        cy.get("#titulo-principal-texto").should("contain", "45");
        cy.get("#reset").click();
        cy.get("#popup-container").should("be.visible");
        cy.get("#boton-confirmar-borrar").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(240, 128, 128)");
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#PYE").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#titulo-principal-texto").should("contain", "0");
    });

    it("default deshabilitadas", () => {
        cy.get("#PYE").should("have.css", "background-color", "rgb(128, 128, 128)");
    });

    it("default popup", () => {
        cy.get("#popup-container").should("not.be.visible");
    });

    it("abrir y cerrar popup", () => {
        cy.get("#popup-container").should("not.be.visible");
        cy.get("#areas").click();
        cy.get("#popup-container").should("be.visible");
        cy.get("#popup-container").should("contain", "Materias Básicas");
        cy.get("#cerrar-popup").click();
        cy.get("#popup-container").should("not.be.visible");
    });

    it("bug de AGI y PAI", () => {
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD1").click();
        cy.get("#MD1").click();
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P1").click();
        cy.get("#P1").click();
        cy.get("#P1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CTS").click();
        cy.get("#CTS").click();
        cy.get("#CTS").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#Ec").click();
        cy.get("#Ec").click();
        cy.get("#Ec").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F1").click();
        cy.get("#F1").click();
        cy.get("#F1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#LG").click();
        cy.get("#LG").click();
        cy.get("#LG").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P2").click();
        cy.get("#P2").click();
        cy.get("#P2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F2").click();
        cy.get("#F2").click();
        cy.get("#F2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TRE").click();
        cy.get("#TRE").click();
        cy.get("#TRE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AC").click();
        cy.get("#AC").click();
        cy.get("#AC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#DAED").click();
        cy.get("#DAED").click();
        cy.get("#DAED").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F3").click();
        cy.get("#F3").click();
        cy.get("#F3").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AGI").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#titulo-principal-texto").should("contain", "137");
        
        cy.get("#PCIC").click();
        cy.get("#PCIC").click();
        cy.get("#PCIC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AGI").should("have.css", "background-color", "rgb(240, 128, 128)");
        cy.get("#titulo-principal-texto").should("contain", "140");


        cy.get("#AGI").click();
        cy.get("#AGI").click();
        cy.get("#AGI").should("have.css", "background-color", "rgb(144, 238, 144)");

        cy.get("#PAI").click();
        cy.get("#PAI").click();
        cy.get("#PAI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "150");

        cy.get("#PCIC").click();
        cy.get("#PCIC").should("have.css", "background-color", "rgb(240, 128, 128)");
        cy.get("#AGI").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#PAI").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#titulo-principal-texto").should("contain", "137");
    });

    it("creditos consistentes al desmarcar materia", () => {
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD1").click();
        cy.get("#MD1").click();
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "35");
        cy.get("#CDIV").click();
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIV").should("have.css", "background-color", "rgb(240, 128, 128)");
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(128, 128, 128)");
        cy.get("#titulo-principal-texto").should("contain", "9");
    });

    it("cargar un ejemplo de materias", () => {
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD1").click();
        cy.get("#MD1").click();
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MI").click();
        cy.get("#MI").click();
        cy.get("#MI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P1").click();
        cy.get("#P1").click();
        cy.get("#P1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#Ec").click();
        cy.get("#Ec").click();
        cy.get("#Ec").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F1").click();
        cy.get("#F1").click();
        cy.get("#F1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#GAL2").click();
        cy.get("#GAL2").click();
        cy.get("#GAL2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#LG").click();
        cy.get("#LG").click();
        cy.get("#LG").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD2").click();
        cy.get("#MD2").click();
        cy.get("#MD2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P2").click();
        cy.get("#P2").click();
        cy.get("#P2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AC").click();
        cy.get("#AC").click();
        cy.get("#AC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P3").click();
        cy.get("#P3").click();
        cy.get("#P3").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P4").click();
        cy.get("#P4").click();
        cy.get("#P4").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AGI").click();
        cy.get("#AGI").click();
        cy.get("#AGI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#FBD").click();
        cy.get("#FBD").click();
        cy.get("#FBD").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PYE").click();
        cy.get("#PYE").click();
        cy.get("#PYE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#SO").click();
        cy.get("#SO").click();
        cy.get("#SO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TP").click();
        cy.get("#TP").click();
        cy.get("#TP").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TL").click();
        cy.get("#TL").click();
        cy.get("#TL").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PAI").click();
        cy.get("#PAI").click();
        cy.get("#PAI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#IIO").click();
        cy.get("#IIO").click();
        cy.get("#IIO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#RC").click();
        cy.get("#RC").click();
        cy.get("#RC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CCE").click();
        cy.get("#CCE").click();
        cy.get("#CCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#ITI").click();
        cy.get("#ITI").click();
        cy.get("#ITI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TACCE").click();
        cy.get("#TACCE").click();
        cy.get("#TACCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "276");
    });

    it("cargar un ejemplo de materias, recargar y mirar que se mantenga", () => {
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").click();
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD1").click();
        cy.get("#MD1").click();
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MI").click();
        cy.get("#MI").click();
        cy.get("#MI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P1").click();
        cy.get("#P1").click();
        cy.get("#P1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#Ec").click();
        cy.get("#Ec").click();
        cy.get("#Ec").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F1").click();
        cy.get("#F1").click();
        cy.get("#F1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIV").click();
        cy.get("#CDIV").click();
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#GAL2").click();
        cy.get("#GAL2").click();
        cy.get("#GAL2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#LG").click();
        cy.get("#LG").click();
        cy.get("#LG").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD2").click();
        cy.get("#MD2").click();
        cy.get("#MD2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P2").click();
        cy.get("#P2").click();
        cy.get("#P2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AC").click();
        cy.get("#AC").click();
        cy.get("#AC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").click();
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P3").click();
        cy.get("#P3").click();
        cy.get("#P3").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P4").click();
        cy.get("#P4").click();
        cy.get("#P4").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AGI").click();
        cy.get("#AGI").click();
        cy.get("#AGI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#FBD").click();
        cy.get("#FBD").click();
        cy.get("#FBD").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PYE").click();
        cy.get("#PYE").click();
        cy.get("#PYE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#SO").click();
        cy.get("#SO").click();
        cy.get("#SO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TP").click();
        cy.get("#TP").click();
        cy.get("#TP").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TL").click();
        cy.get("#TL").click();
        cy.get("#TL").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PAI").click();
        cy.get("#PAI").click();
        cy.get("#PAI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#IIO").click();
        cy.get("#IIO").click();
        cy.get("#IIO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#RC").click();
        cy.get("#RC").click();
        cy.get("#RC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CCE").click();
        cy.get("#CCE").click();
        cy.get("#CCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#ITI").click();
        cy.get("#ITI").click();
        cy.get("#ITI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TACCE").click();
        cy.get("#TACCE").click();
        cy.get("#TACCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "276");
        cy.reload();
        cy.get("#mi-toggle-MI").should("be.checked");
        cy.get("#GAL1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#Ec").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#F1").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#GAL2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#LG").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MD2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P2").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CDIVV").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P3").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#P4").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#AGI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#FBD").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PYE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#SO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TP").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TL").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#PAI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#IIO").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#RC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#CCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#ITI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#TACCE").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "276");
    });

    it("bug recargar pagina con plan 2025", () => {
        cy.get('label[for="mi-toggle-plan"]').click();
        cy.get('label[for="mi-toggle-MI"]').click();
        cy.get("#FC").click();
        cy.get("#FC").click();
        cy.get("#FC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#IC").click();
        cy.get("#IC").click();
        cy.get("#IC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MI").click();
        cy.get("#MI").click();
        cy.get("#MI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "18");
        cy.reload();
        cy.get("#mi-toggle-plan").should("be.checked");
        cy.get("#FC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#IC").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#MI").should("have.css", "background-color", "rgb(144, 238, 144)");
        cy.get("#titulo-principal-texto").should("contain", "18");
    });
});