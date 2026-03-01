//comentar y revisar codigo

const LocalStorageNombres = Object.freeze({
  materiasAprobadas: "materiasAprobadas",
  materiasExoneradas: "materiasExoneradas",
  semestre : "semestre"
});

const Semestre = Object.freeze({
  PRIMERO: "primero",
  SEGUNDO: "segundo",
  AMBOS: "ambos",
  LIBRE: "libre"
});

const BarraPopup = Object.freeze({
  Previas: "previas",
  PreviaDe: "previaDe",
  Informacion: "informacion"
});

const Estado = Object.freeze({
  DESHABILITADA: 0,
  HABILITADA: 1,
  APROBADA: 2,
  EXONERADA: 3
});

const TraduccionBloqueCreditos = Object.freeze({
  creditosEnM: "Matemática",
  creditosEnCE: "Ciencias Experimentales",
  creditosEnProg: "Programación",
  creditosEnAC_SO_RC: "Arq., S. OP., Redes de C.",
  creditosEnBD_SI: "B. Datos y Sist. de I.",
  creditosEnMN: "Cálculo Numérico",
  creditosEnIO: "Investigación Operativa",
  creditosEnIS: "Ingeniería de Software",
  creditosEnTall_Pasa_Proy: "A. Integ., Tall., Pas. y Proy.",
  creditosEnGO: "Gestión en Organizaciones",
  creditosEnIAYR: "Int. Artificial y Robótica",
  creditosEnCHS: "Ciencias H. y S.",
  Total: "Total"
});

const BloqueCreditos = Object.freeze({
  creditosEnM: "creditosEnM",
  creditosEnCE: "creditosEnCE",
  creditosEnProg: "creditosEnProg",
  creditosEnAC_SO_RC: "creditosEnAC_SO_RC",
  creditosEnBD_SI: "creditosEnBD_SI",
  creditosEnMN: "creditosEnMN",
  creditosEnIO: "creditosEnIO",
  creditosEnIS: "creditosEnIS",
  creditosEnTall_Pasa_Proy: "creditosEnTall_Pasa_Proy",
  creditosEnGO: "creditosEnGO",
  creditosEnIAYR: "creditosEnIAYR",
  creditosEnCHS: "creditosEnCHS",
  Total: "Total",
});

const claseResaltarBotonEnNav = "activo";
const colorAprobada = "lightblue";
const colorExonerada = "lightgreen";
const colorHabilitada = "lightcoral";
const colorDeshabilitada = "gray";

const idSecciones = "secciones";
const idPopUp = "popup-container";
const idTextInPopup = "popup-materia-contenido";
const idCheckbox = "input-ham";
const idNavbar = "navbar";
const idButtonCloseInPopup = "cerrar-popup";
const idTitulo = "titulo-principal-texto";
const idHamContainer = "titulo-principal-checkbox-container";
const idHam = "img-ham";
const idPopupMateria = "popup-materia";
const idPopupRespuestas = "popup-respuestas"
const idPopupAreas = "popup-areas";
const idPopupListaMaterias = "popup-lista-materias";
const idPopupAjustarCreditos = "popup-ajustar-creditos";

const registros = [];
const creditosPorArea = new Map();
let historialAprobadas = new Set();
let historialExoneradas = new Set();
let seleccionOpcionales = true;
let seleccionMenu = false;
let seleccionSemestre = Semestre.AMBOS;
let valorBarra = BarraPopup.Previas;
let popUpActual = idPopupMateria;

let creditosBloque = {
  creditosEnM: 0,
  creditosEnCE: 0,
  creditosEnProg: 0,
  creditosEnAC_SO_RC: 0,
  creditosEnBD_SI: 0,
  creditosEnMN: 0,
  creditosEnIO: 0,
  creditosEnIS: 0,
  creditosEnTall_Pasa_Proy: 0,
  creditosEnGO: 0,
  creditosEnIAYR: 0,
  creditosEnCHS: 0,
  Total: 0,
};

class Materia {
  constructor(
    nombre,
    creditos,
    reglaHabilitacion,
    nombreCompleto,
    semestre,
    esOpcional,
    esLibre,
    area,
    informacion
  ) {
    this.nombre = nombre;
    this.creditos = creditos;
    this.reglaHabilitacion = reglaHabilitacion;
    this.nombreCurso = `${nombre}Curso`;
    this.estado = Estado.DESHABILITADA;
    this.nombreCompleto = nombreCompleto;
    this.prioridad = 0;
    this.semestre = semestre;
    this.esOpcional = esOpcional;
    this.esLibre = esLibre;
    this.area = area;
    this.peso = 0;
    this.informacion = informacion;
    this.se_da = true;
  }
}

const todas = (...reglas) => ({ tipo: "todas", reglas });
const alguna = (...reglas) => ({ tipo: "alguna", reglas });
const negar = (regla) => ({ tipo: "negar", regla });

const materiaAprobada = (materia) => ({
  tipo: "predicado",
  id: `aprobada:${materia.nombre}`,
  verificar: () => historialAprobadas.has(materia.nombre),
  mensajeFalta: `Curso de ${materia.nombreCompleto}`,
});

const materiaExonerada = (materia) => ({
  tipo: "predicado",
  id: `exonerada:${materia.nombre}`,
  verificar: () => historialExoneradas.has(materia.nombre),
  mensajeFalta: `Exonerar ${materia.nombreCompleto}`,
});

const creditosMinimos = (bloque, cantidad) => ({
  tipo: "predicado",
  id: `creditos:${bloque}>=${cantidad}`,
  verificar: () => creditosBloque[bloque] >= cantidad,
  mensajeFalta: `Tener al menos ${cantidad} créditos en ${TraduccionBloqueCreditos[bloque]}.`,
});

function evaluarRegla(regla) {
  if (!regla) return { cumple: true, faltantes: [] };
  if (regla.tipo === "predicado") {
    const cumple = regla.verificar();
    return { cumple, faltantes: cumple ? [] : [regla.mensajeFalta] };
  }
  if (regla.tipo === "todas") {
    const resultados = regla.reglas.map((r) => evaluarRegla(r));
    return {
      cumple: resultados.every((r) => r.cumple),
      faltantes: resultados.flatMap((r) => r.faltantes),
    };
  }
  if (regla.tipo === "alguna") {
    const resultados = regla.reglas.map((r) => evaluarRegla(r));
    const cumple = resultados.some((r) => r.cumple);
    if (cumple) return { cumple: true, faltantes: [] };
    const mejorOpcion = resultados.reduce((a, b) =>
      a.faltantes.length <= b.faltantes.length ? a : b
    );
    return { cumple: false, faltantes: mejorOpcion.faltantes };
  }
  if (regla.tipo === "negar") {
    const resultadoInterno = evaluarRegla(regla.regla);
    return {
      cumple: !resultadoInterno.cumple,
      faltantes: !resultadoInterno.cumple ? [] : ["No se cumple la condición negada"],
    };
  }
}

const CDIV = new Materia("CDIV", 13, null, "Cálculo DIV", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
CDIV.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1024"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1504"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/73997/mod_resource/content/4/Ficha%20del%20curso.pdf"}]
const CDIVV = new Materia("CDIVV", 13, materiaAprobada(CDIV), "Cálculo DIVV", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
CDIVV.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1594"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1131"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/35367/mod_resource/content/1/Programa_Unidad_Curricular_calculo_varias_variables.pdf"}]
const MD1 = new Materia("MD1", 9, null, "Matemática Discreta 1", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
MD1.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=323"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1541"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2024-08/Matem%C3%A1tica%20Discreta%201.pdf"}]
MD1.se_da = false;
const FC = new Materia("FC", 9, negar(materiaExonerada(MD1)), "Fundamentos de la combinatoria", Semestre.PRIMERO, false, true, BloqueCreditos.creditosEnM, []);
FC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=2008"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/90476/mod_resource/content/1/Programa.pdf"}]
MD1.reglaHabilitacion = negar(materiaExonerada(FC));
const P1 = new Materia("P1", 10, null, "Programación 1", Semestre.AMBOS, false, false, BloqueCreditos.creditosEnProg, []);
P1.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=58"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1958"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/49951/mod_resource/content/2/ProgramaP12024.pdf"}]
const GAL1 = new Materia("GAL1", 9, null, "Geometría y Álgebra Lineal 1", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
GAL1.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1597"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1442"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2024-08/GAL1_Programa.pdf"}]
const P2 = new Materia("P2", 12, materiaAprobada(P1), "Programación 2", Semestre.AMBOS, false, false, BloqueCreditos.creditosEnProg, []);
P2.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=132"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/50251/mod_resource/content/6/Programa%20de%20Unidad%20Curricular%20-%20P2%202017-%2012creditos.pdf"}]
const TAR = new Materia("TAR", 10, todas(materiaExonerada(GAL1), materiaExonerada(CDIV), materiaAprobada(CDIVV)), "Topología y Análisis Real", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnM, []);
TAR.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1279"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2022-11/1-Topologia_analisis_real_programa.pdf"}]
const DAED = new Materia("DAED", 7, todas(materiaExonerada(P1), materiaExonerada(P2)), "Didáctica de Algorit. y Estruct. de Datos", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnProg, []);
DAED.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=874"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/45593/mod_resource/content/2/Programa-de-Unidad-Curricular-DAED.pdf"}]
const Ec = new Materia("Ec", 7, null, "Economía", Semestre.SEGUNDO, true, true, BloqueCreditos.creditosEnCHS, []);
Ec.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1093"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/static/programas/Grado/2019/Econom%C3%ADa/economia.pdf"}]
const F1 = new Materia("F1", 10, null, "Física 1", Semestre.AMBOS, true, true, BloqueCreditos.creditosEnCE, []);
F1.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=87"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1545"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/73445/mod_resource/content/2/f1_1151.pdf"}]
const GAL2 = new Materia("GAL2", 9, materiaAprobada(GAL1), "Geometría y Álgebra Lineal 2", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
GAL2.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=270"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=203"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/37189/mod_resource/content/2/Programa%20GAL%202.pdf"}]
const AAL = new Materia("AAL", 9, todas(materiaExonerada(GAL2),materiaExonerada(CDIV)), "Aplicaciones del Álgebra Lineal", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnMN, []);
AAL.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1543"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/35094/mod_resource/content/7/Aplicaciones%20del%20%C3%81lgebra%20Lineal.pdf"}]
const PYE = new Materia("PYE", 10, todas(materiaAprobada(CDIVV),materiaExonerada(GAL1),materiaExonerada(CDIV)), "Probabilidad y Estadistica", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
PYE.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=54"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1537"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/40052/mod_resource/content/1/programa_PyE.pdf"}]
const PCI = new Materia("PCI", 10, todas(materiaExonerada(PYE),materiaExonerada(CDIVV),materiaExonerada(GAL2)), "Procesamiento cuántico de la info.", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnM, []);
PCI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1903"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/11372/mod_resource/content/1/programa_proc_cuant_inf.pdf"}]
PCI.se_da = false;
const ITI = new Materia("ITI", 8, materiaExonerada(PYE), "Int. a la Teoría de la Información", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnM, []);
ITI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=412"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/631/course/section/2052/ProgramaITI-2013-Grado.pdf"}]
const MD2 = new Materia("MD2", 9, todas(alguna(materiaAprobada(MD1),materiaAprobada(FC)),materiaAprobada(GAL1)), "Matemática Discreta 2", Semestre.AMBOS, false, true, BloqueCreditos.creditosEnM, []);
MD2.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=267"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1542"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2024-09/Matem%C3%A1tica%20Discreta%202.pdf"}]
const LG = new Materia("LG", 12, alguna(materiaAprobada(MD1),materiaAprobada(FC)), "Lógica", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnM, []);
LG.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=394"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/48291/mod_resource/content/2/Programa%20de%20Unidad%20Curricular%20Logica.pdf"}]
const MN = new Materia("MN", 10, todas(materiaExonerada(CDIVV),materiaExonerada(P1),materiaExonerada(GAL2),materiaExonerada(GAL1),materiaExonerada(CDIV)), "Métodos Numéricos", Semestre.SEGUNDO, false, false, BloqueCreditos.creditosEnMN, []);
MN.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=62"}, 
                    {nombre: "Programa (viejo)", valor: "https://www.fing.edu.uy/sites/default/files/2025-06/metodos_numericos_2024.pdf"}]
const P4 = new Materia("P4", 15, todas(materiaExonerada(GAL1),materiaExonerada(CDIV),alguna(materiaExonerada(MD1),materiaExonerada(FC)),materiaExonerada(P2)), "Programación 4", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnProg, []);
P4.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=413"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/50913/mod_resource/content/2/programa_curso.pdf"}]
const IIO = new Materia("IIO", 10, todas(materiaExonerada(GAL2),materiaExonerada(PYE),materiaExonerada(CDIVV),materiaExonerada(CDIV),materiaExonerada(GAL1)), "Int. a la Investigación de Operaciones", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnIO, []);
IIO.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=994"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/47534/mod_resource/content/2/Programa%20IIO%202018.pdf"}]
const ADA = new Materia("ADA", 10, materiaExonerada(IIO), "Algoritmos de Aproximación", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIO, []);
ADA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=914"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/58168/mod_resource/content/2/AA-2025%20%281%29%20%281%29.pdf"}]
const MMC = new Materia("MMC", 8, todas(materiaExonerada(PYE),materiaExonerada(IIO)), "Métodos de Monte Carlo", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnMN, []);
MMC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=24"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2022-06/M%C3%A9todos%20de%20Monte%20Carlo.pdf"}]
const FDPE = new Materia("FDPE", 8, materiaExonerada(IIO), "Fundamentos de Programación Entera", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnIO, []);
FDPE.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=269"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/47033/mod_resource/content/2/PUC_Fundamentos-de-Programacion-Entera_2018.pdf"}]
FDPE.se_da = false;
const MO = new Materia("MO", 6, materiaExonerada(IIO), "Modelado y Optimización", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIO, []);
MO.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1070"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/48929/mod_resource/content/2/ModOpt_Programa_Bedelia_2018.pdf"}]
const OBI = new Materia("OBI", 8, materiaExonerada(IIO), "Optimización bajo Incertidumbre", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnIO, []);
OBI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=397"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/57177/mod_resource/content/7/PUC_Optimizacion-bajo-Incertidumbre_2018.pdf"}]
const IOGR = new Materia("IOGR", 6, materiaExonerada(IIO), "Investigación de Oper. y Gest. de Riesgos", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIO, []);
IOGR.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=38"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/48237/mod_resource/content/1/Programa%20de%20Investigacion%20Operativa%20y%20Gestion%20de%20Riesgos.pdf"}]
const P3 = new Materia("P3", 15, todas(materiaAprobada(P2),materiaExonerada(P1),alguna(materiaExonerada(MD1),materiaExonerada(FC))), "Programación 3", Semestre.SEGUNDO, false, true, BloqueCreditos.creditosEnProg, []);
P3.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=39"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/50602/mod_resource/content/4/ProgramaUCProgramacion3%20-%202024.pdf"}]
const FRA = new Materia("FRA", 7, todas(creditosMinimos(BloqueCreditos.creditosEnCE,10),creditosMinimos(BloqueCreditos.creditosEnAC_SO_RC,12), materiaAprobada(P3), materiaExonerada(P2), materiaExonerada(LG)), "Fundamentos de la Robótica Autónoma", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnIAYR, []);
FRA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=869"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/46349/mod_resource/content/7/fra_programa_2026.pdf"}]
const ALN = new Materia("ALN", 9, todas(materiaExonerada(P3),materiaExonerada(MN)), "Álgebra Lineal Numérica", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnMN, []);
ALN.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1143"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/43937/mod_resource/content/1/ProgramaALN.pdf"}]
const AC = new Materia("AC", 10, todas(materiaAprobada(LG),materiaAprobada(P2),materiaExonerada(P1),alguna(materiaAprobada(MD1),materiaAprobada(FC))), "Arquitectura de Computadoras", Semestre.SEGUNDO, false, true, BloqueCreditos.creditosEnAC_SO_RC, []);
AC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=195"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/44348/mod_resource/content/1/programa-arqcomp-2024.pdf"}]
const CV = new Materia("CV", 10, todas(materiaAprobada(CDIVV),materiaExonerada(GAL1),materiaExonerada(CDIV)), "Cálculo Vectorial", Semestre.AMBOS, true, true, BloqueCreditos.creditosEnM, []);
CV.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1498"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1183"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/36477/mod_resource/content/1/Ficha%20-%20Ca%CC%81lculo%20Vectorial.pdf"}]
const ED = new Materia("ED", 10, todas(materiaExonerada(GAL2),materiaAprobada(CDIVV),materiaExonerada(GAL1),materiaExonerada(CDIV)), "Int. a las Ec. Diferenciales", Semestre.SEGUNDO, true, true, BloqueCreditos.creditosEnM, []);
ED.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=342"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2024-08/Programa_Introducci%C3%B3n%20a%20las%20ecuaciones%20diferenciales.pdf"}]
const TL = new Materia("TL", 12, todas(materiaAprobada(P3),materiaExonerada(CDIV),materiaExonerada(GAL1),materiaExonerada(LG),alguna(materiaExonerada(MD1),materiaExonerada(FC))), "Teoría de Lenguajes", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnProg, []);
TL.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=687"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/Programa%20de%20Unidad%20Curricular%20TeoLeng.pdf"}]
const FVC = new Materia("FVC", 5, todas(materiaAprobada(CV),materiaExonerada(CDIVV)), "Funciones de Variable Compleja", Semestre.PRIMERO, true, true, BloqueCreditos.creditosEnM, []);
FVC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=55"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/36683/mod_resource/content/2/%20Programa%202019/fvc%20corregido%20%281%29.pdf"}]
const SO = new Materia("SO", 12, todas(materiaAprobada(AC),materiaExonerada(GAL1),materiaExonerada(CDIV),materiaExonerada(P2),alguna(materiaExonerada(MD1),materiaExonerada(FC))), "Sistemas Operativos", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnAC_SO_RC, []);
SO.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=679"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/52825/mod_resource/content/1/Programa-SO.pdf"}]
const CCE = new Materia("CCE", 8, todas(materiaAprobada(PYE),materiaExonerada(GAL1),materiaExonerada(CDIVV),alguna(materiaExonerada(MD1),materiaExonerada(FC)),materiaExonerada(CDIV), materiaAprobada(P3)), "Códigos para Corrección de Errores", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnM, []);
CCE.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=134"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/45183/mod_resource/content/1/Programa%20de%20Unidad%20Curricular%20Co%CC%81digos%20para%20Correccio%CC%81n%20de%20Errores%202020%20%28pendiente%20de%20aprobacio%CC%81n%29.pdf"}]
CCE.se_da = false;
const TACCE = new Materia("TACCE", 7, materiaAprobada(CCE), "Temas avanzados en cód. para corr. de err.", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnM, []);
TACCE.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=456"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/683/course/section/2272/Programa%20de%20Unidad%20Curricular%20Temas%20avanzados%20en%20c%C3%B3digos%20para%20correcci%C3%B3n%20de%20errores%202023.pdf"}]
const PMPPG = new Materia("PMPPG", 10, todas(materiaExonerada(P2),alguna(materiaExonerada(AC),materiaExonerada(SO),todas(materiaAprobada(AC),materiaAprobada(SO)))), "Prog. masivamente paralela en p. gráficos", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
PMPPG.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1076"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/51679/mod_resource/content/2/Programa_PMPenGPU_Grado2024.pdf"}]
const FO = new Materia("FO", 6, todas(materiaExonerada(CDIVV),materiaAprobada(P1),materiaExonerada(GAL2)), "Fundamentos de Optimización", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnIO, []);
FO.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1513"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/36863/mod_resource/content/1/Programa_Unidad_Curricular_Optimizacion.pdf"}]
const OCA = new Materia("OCA", 10, materiaExonerada(IIO), "Optimización Continua y Aplicaciones", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIO, []);
OCA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1538"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2023-10/optimizacion%20continua%20y%20aplicaciones_1640.pdf"}]
const FBD = new Materia("FBD", 15, todas(materiaExonerada(LG),materiaExonerada(P3),materiaExonerada(MD2)), "Fundamentos de Bases de Datos", Semestre.SEGUNDO, false, false, BloqueCreditos.creditosEnBD_SI, []);
FBD.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=330"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/545/course/section/1643/Programa-FBD.pdf?time=1627317936142"}]
const BDNR = new Materia("BDNR", 10, materiaExonerada(FBD), "Bases de Datos No Relacionales", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnBD_SI, []);
BDNR.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=947"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/propuesta-bdnr.pdf"}]
BDNR.se_da = false;
const CDI = new Materia("CDI", 8, materiaExonerada(FBD), "Calidad de Datos e Información", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnBD_SI, []);
CDI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1073"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/45151/mod_resource/content/1/Programa-CalidadDatosInf.pdf"}]
const RC = new Materia("RC", 12, todas(materiaExonerada(P3),materiaAprobada(SO),materiaExonerada(CDIV),materiaAprobada(AC)), "Redes de Computadoras", Semestre.SEGUNDO, false, false, BloqueCreditos.creditosEnAC_SO_RC, []);
RC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=335"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/52289/mod_resource/content/2/Programa%20de%20Unidad%20Curricular%20Redes%20de%20Computadoras%20-%2020191022.pdf"}]
const SETR = new Materia("SETR", 10, todas(materiaExonerada(AC),materiaExonerada(P2)), "Sistemas embebidos para tiempo real", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
SETR.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=581"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/cursos/2019/anexos/37196/Sist-EmbebidosTiempoReal-20.pdf"}]
const RO = new Materia("RO", 10, materiaExonerada(RC), "Redes Ópticas", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
RO.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1862"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2024-08/Redes_Opticas.pdf"}]
const TSI = new Materia("TSI", 10, todas(materiaAprobada(RC),materiaExonerada(FBD),materiaExonerada(P3)), "Taller de Seguridad Informática", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
TSI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=324"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/53898/mod_folder/content/0/Programa%20de%20Unidad%20Curricular.pdf"}]
const ADAR = new Materia("ADAR", 8, todas(materiaExonerada(P3),materiaExonerada(RC)), "Análisis y Diseño de Al. Dis. en Redes", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
ADAR.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=145"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/44090/mod_resource/content/0/Programa_ADADR.pdf"}]
const CAP = new Materia("CAP", 10, todas(materiaAprobada(P4),materiaAprobada(RC),materiaAprobada(SO),materiaAprobada(AC)), "Computación de alta performance", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
CAP.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1064"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2023-04/Computaci%C3%B3n%20de%20alta%20performance.pdf"}]
const TP = new Materia("TP", 15, alguna(todas(materiaExonerada(P3),materiaAprobada(P4)),materiaExonerada(P4)), "Taller de Programación", Semestre.SEGUNDO, false, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
TP.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=315"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/53463/mod_resource/content/5/programaTProg2017_APROBADO.pdf"}]
const IPLN = new Materia("IPLN", 12, todas(materiaExonerada(P4),materiaAprobada(TP),materiaExonerada(LG),materiaExonerada(P3),materiaExonerada(TL),materiaExonerada(PYE)), "Int. al Procesamiento de Leng. Natural", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIAYR, []);
IPLN.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=211"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/47980/mod_resource/content/0/Programa%20de%20Unidad%20Curricular%20IntroPLN%20Grado.pdf"}]
const IIS = new Materia("IIS", 10, todas(materiaAprobada(TP),materiaAprobada(FBD),materiaAprobada(P4)), "Taller Introductorio de Ing. de Software", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnIS, []);
IIS.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=613"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/54380/mod_page/content/7/Programa%20TIIS%20-%202025.pdf"}]
const FWS = new Materia("FWS", 8, todas(materiaExonerada(IIS),materiaExonerada(FBD)), "Fundamentos de la web semántica", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnBD_SI, []);
FWS.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=536"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/46740/mod_resource/content/1/Programa%20de%20Unidad%20Curricular-FWS.pdf"}]
FWS.se_da = false;
const PF = new Materia("PF", 10, todas(materiaExonerada(TL),materiaExonerada(P2),materiaExonerada(LG),alguna(materiaExonerada(MD1),materiaExonerada(FC))), "Programación Funcional", Semestre.AMBOS, false, false, BloqueCreditos.creditosEnProg, []);
PF.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=138"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/cursos/2020/anexos/39014/Programaci%C3%B3n%20Funcional.pdf"}]
const PFA = new Materia("PFA", 12, materiaAprobada(PF), "Programación Funcional Avanzada", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnProg, []);
PFA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=965"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2025-10/programacion-funcional-avanzada_1350.pdf"}]
const PL = new Materia("PL", 10, todas(materiaExonerada(TL),materiaExonerada(P3),materiaExonerada(MD2),materiaExonerada(LG)), "Programación Lógica", Semestre.PRIMERO, false, false, BloqueCreditos.creditosEnProg, []);
PL.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=293"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/51520/mod_resource/content/2/PL_programaOficial2018.pdf"}]
const PIS = new Materia("PIS", 15, todas(materiaAprobada(IIS),materiaExonerada(P4)), "Proyecto de Ingeniería de Software", Semestre.SEGUNDO, false, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
PIS.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=573"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/cursos/2020/anexos/39036/Proyecto%20de%20Ingenier%C3%ADa%20de%20Software.pdf"}]
const AA = new Materia("AA", 12, todas(materiaExonerada(LG),materiaExonerada(PYE),materiaExonerada(P3),materiaExonerada(FBD),materiaExonerada(P4),materiaExonerada(MD2)), "Aprendizaje Automático", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIAYR, []);
AA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=43"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/221/course/section/209/AA%20-%20Programa%20de%20Unidad%20Curricular.pdf"}]
const TAA = new Materia("TAA", 10, materiaAprobada(AA), "Taller de Aprendizaje Automático", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnIAYR, []);
TAA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1492"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/1775/course/section/7452/1-Programa_TallerAprendizajeAutomatico_actualizacion_2023_retroactiva_total%20%282%29.pdf?time=1710286794133"}]
const RNLN = new Materia("RNLN", 10, todas(materiaExonerada(P3),materiaAprobada(AA),materiaExonerada(PYE)), "Redes Neuronales para Leng. Natural", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIAYR, []);
RNLN.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1758"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/2023-05/REDES%20NEURONALES%20PARA%20LENGUAJE%20NATURAL.pdf"}]
const AE = new Materia("AE", 10, todas(materiaExonerada(P4),materiaExonerada(PYE),materiaExonerada(IIO)), "Algoritmos Evolutivos", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnIO, []);
AE.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1049"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/44000/mod_resource/content/2/Programa%20de%20Unidad%20Curricular%20Algoritmos%20Evolutivos.pdf"}]
const ICG = new Materia("ICG", 10, todas(materiaExonerada(P3),materiaExonerada(P4),materiaAprobada(GAL2),materiaExonerada(GAL1)), "Int. a la Computación Gráfica", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnProg, []);
ICG.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=205"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/inco/cursos/compgraf/Programa/Programa.Int.a.la.Comp.Grafica-1316.pdf"}]
const CGA = new Materia("CGA", 12, materiaAprobada(ICG), "Computación Gráfica Avanzada", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnProg, []);
CGA.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1067"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/45437/mod_resource/content/3/Programa%20de%20Computaci%C3%B3n%20Gr%C3%A1fica%20Avanzada.pdf"}]
const FSI = new Materia("FSI", 12, todas(materiaExonerada(SO),materiaExonerada(FBD),materiaExonerada(P3),materiaExonerada(LG),materiaExonerada(RC)), "Fundamentos de la Seguridad Informática", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnAC_SO_RC, []);
FSI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=399"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/46578/mod_resource/content/1/Programa%20de%20Unidad%20Curricular%20-%20FSI.pdf"}]
const MI = new Materia("MI", 4, null, "Matemática Inicial", Semestre.AMBOS, false, false, BloqueCreditos.creditosEnM, []);
MI.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1822"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1535"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/499136/mod_resource/content/1/Programa_UC_Matematica_Inicial_modificado.pdf"}]
const CTS = new Materia("CTS", 8, null, "Ciencia, Tecnología y Sociedad", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnCHS, []);
CTS.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1243"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/71255/mod_resource/content/2/Programa%20Unidad%20Curricular%20Ciencia%20Tecnolog%C3%ADa%20y%20Sociedad%20%28Cod.%201223%29.pdf"}]
const TRE = new Materia("TRE", 6, creditosMinimos(BloqueCreditos.creditosEnProg,10), "Taller de Robótica Educativa", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
TRE.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1187"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/53819/mod_resource/content/4/Programataller-robedu-butia_v20180817.pdf"}]
const F2 = new Materia("F2", 10, todas(materiaAprobada(F1),materiaAprobada(CDIV)), "Física 2", Semestre.AMBOS, true, true, BloqueCreditos.creditosEnCE, []);
F2.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=32"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1546"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/cursos/2011/anexos/2553/357_0.pdf"}]
const F3 = new Materia("F3", 10, todas(materiaAprobada(CDIV), alguna(todas(materiaAprobada(F1), materiaAprobada(F2)), materiaExonerada(F1))), "Física 3", Semestre.AMBOS, true, true, BloqueCreditos.creditosEnCE, []);
F3.informacion = [{nombre: "Eva primer semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=36"}, 
                    {nombre: "Eva segundo semestre", valor: "https://eva.fing.edu.uy/course/view.php?id=1547"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/9232/mod_resource/content/0/Programa/nf3.pdf"}]
const AGI = new Materia("AGI", 5, creditosMinimos(BloqueCreditos.Total,140), "Administración General para Ingenieros", Semestre.PRIMERO, true, true, BloqueCreditos.creditosEnGO, []);
AGI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=778"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/73141/mod_folder/content/0/Programa%202024.pdf"}]
const CC = new Materia("CC", 8, todas(materiaAprobada(PYE),creditosMinimos(BloqueCreditos.Total,80)), "Control de Calidad", Semestre.PRIMERO, true, true, BloqueCreditos.creditosEnGO, []);
CC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=49"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/26508/mod_resource/content/2/Programa%20Control%20de%20Calidad%20-%20nuevo%20formato.pdf"}]
CC.se_da = false;
const PAI = new Materia("PAI", 5, materiaAprobada(AGI), "Práctica de Administración para Ingenieros", Semestre.SEGUNDO, true, true, BloqueCreditos.creditosEnGO, []);
PAI.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=779"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/71749/mod_resource/content/4/Programa_Practica_de_Administracion_para_Ingenieros_2019_v2.pdf"}]
const PCIC = new Materia("PCIC", 3, null, "Políticas Científicas en Inf. y Comp.", Semestre.SEGUNDO, true, false, BloqueCreditos.creditosEnCHS, []);
PCIC.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=1311"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/cursos/2011/anexos/3559/Pol%C3%ADticas%20Cient%C3%ADficas%20en%20Inform%C3%A1tica%20y%20Computaci%C3%B3n.pdf"}]
const ASS = new Materia("ASS", 10, todas(creditosMinimos(BloqueCreditos.creditosEnGO,10),materiaAprobada(RC),materiaAprobada(SO),materiaAprobada(FBD),materiaAprobada(IIS),materiaExonerada(AC)), "Administración y Seguridad de Sistemas", Semestre.PRIMERO, true, false, BloqueCreditos.creditosEnBD_SI, []);
ASS.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=785"}, 
                    {nombre: "Programa", valor: "https://www.fing.edu.uy/sites/default/files/Programa%20de%20Unidad%20Curricular%20ASS.pdf"}]
const Pasan = new Materia("Pasan", 10, creditosMinimos(BloqueCreditos.Total,200), "Pasantía", Semestre.AMBOS, true, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
Pasan.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=702"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/49439/mod_resource/content/2/Pasantia_programa.pdf"}]
const PG = new Materia("PG", 30, alguna(
                                        creditosMinimos(BloqueCreditos.Total,380),
                                        todas(creditosMinimos(BloqueCreditos.Total,365),materiaAprobada(TP),materiaAprobada(PIS),materiaAprobada(TL),materiaAprobada(MN),materiaAprobada(P4),materiaAprobada(IIS),materiaAprobada(P3),materiaAprobada(FBD),materiaAprobada(SO),materiaAprobada(IIO),materiaAprobada(AC)),
                                        todas(creditosMinimos(BloqueCreditos.Total,330),creditosMinimos(BloqueCreditos.creditosEnMN,8),creditosMinimos(BloqueCreditos.creditosEnTall_Pasa_Proy,15),creditosMinimos(BloqueCreditos.creditosEnProg,60),creditosMinimos(BloqueCreditos.creditosEnBD_SI,10),creditosMinimos(BloqueCreditos.creditosEnIO,10),creditosMinimos(BloqueCreditos.creditosEnIS,10),creditosMinimos(BloqueCreditos.creditosEnM,70),creditosMinimos(BloqueCreditos.creditosEnGO,10),creditosMinimos(BloqueCreditos.creditosEnAC_SO_RC,30),creditosMinimos(BloqueCreditos.creditosEnCHS,10)))
                      , "Proyecto de Grado", Semestre.AMBOS, false, false, BloqueCreditos.creditosEnTall_Pasa_Proy, []);
PG.informacion = [{nombre: "Eva", valor: "https://eva.fing.edu.uy/course/view.php?id=627"}, 
                    {nombre: "Programa", valor: "https://eva.fing.edu.uy/pluginfile.php/51946/mod_resource/content/1/Programa%20de%20Unidad%20Curricular%20Proyecto%20de%20Grado.pdf"}]



let Materias = [
  CC,
  MD1,
  CDIV,
  P1,
  GAL1,
  Ec,
  F1,
  CTS,
  PCIC,
  CDIVV,
  P2,
  DAED,
  GAL2,
  MD2,
  LG,
  TRE,
  F2,
  F3,
  AC,
  PYE,
  PCI,
  MN,
  P4,
  AAL,
  CV,
  ED,
  TP,
  IIO,
  ADA,
  MMC,
  FDPE,
  P3,
  FRA,
  SO,
  Pasan,
  ITI,
  FVC,
  CCE,
  TACCE,
  TL,
  FBD,
  BDNR,
  CDI,
  RC,
  SETR,
  RO,
  OBI,
  FO,
  OCA,
  AE,
  ICG,
  PMPPG,
  ALN,
  IIS,
  FWS,
  PF,
  PFA,
  PL,
  AA,
  TAA,
  CGA,
  FSI,
  CAP,
  ADAR,
  TSI,
  PIS,
  ASS,
  PG,
  IPLN,
  IOGR,
  MO,
  RNLN,
  AGI,
  PAI,
  TAR
];

function displayBlock(elemento){
  document.getElementById(elemento).style.display = "block";
}

function displayNone(elemento){
  document.getElementById(elemento).style.display = "none";
}

function displayFlex(elemento){
  document.getElementById(elemento).style.display = "flex";
}

function openPopup(proximoPopup) {
  displayNone(popUpActual);
  popUpActual = proximoPopup;
  displayFlex(proximoPopup);
  closeNavIfMobile();
  displayFlex(idPopUp);
  document.getElementById(idButtonCloseInPopup).focus();
}

function closePopup() {
  displayNone(idPopUp);
}

function activarBarraPopup(nombreMateria, valor) {
  displayFlex("popup-materia-barra-superior");
  document.getElementById(valorBarra).classList.remove("activo");
  valorBarra = valor;
  document.getElementById(valor).classList.add("activo");
  document.getElementById(BarraPopup.Previas).onclick = () => { popUpGeneral(nombreMateria,"previas") };
  document.getElementById(BarraPopup.PreviaDe).onclick = () => { popUpGeneral(nombreMateria,"previaDe") };
  document.getElementById(BarraPopup.Informacion).onclick = () => { popUpGeneral(nombreMateria,"informacion") };
}

function desactivarBarraPopup(){
  displayNone("popup-materia-barra-superior");
}

function popUpGeneral(nombreMateria, valor) {
  const containerPrincipal = document.createElement("div");
  activarBarraPopup(nombreMateria, valor);
  const contenidoInferior = document.createElement("div");
  switch (valor) {
    case BarraPopup.Previas:
      contenidoInferior.append(indicarPrevias(nombreMateria));
      break;
    case BarraPopup.PreviaDe:
      contenidoInferior.append(mostrarDeQueEsPrevia(nombreMateria));
      break;
    case BarraPopup.Informacion:
      contenidoInferior.append(indicarInformacion(nombreMateria));
      break;
  }
  containerPrincipal.append(contenidoInferior);
  document.getElementById(idTextInPopup).innerHTML = "";
  document.getElementById(idTextInPopup).append(containerPrincipal);
  openPopup(idPopupMateria);
}

function isMobileDevice(){
  return !window.matchMedia("(min-width: 675px)").matches;
}

function isNavbarOpen() {
  return document.getElementById(idCheckbox).checked;
}

function closeNavIfMobile(){
  if (isMobileDevice()&&isNavbarOpen()) {
    document.getElementById(idCheckbox).click();
  }
}

window.onclick = function (event) {
  var modal = document.getElementById(idPopUp);
  if (event.target == modal) {
    closePopup();
  }
};

function toggleMI() {
  if (Materias.includes(MI)) {
    Materias = Materias.filter(materia => materia !== MI)
    historialAprobadas.delete(MI.nombre);
    historialExoneradas.delete(MI.nombre);
    CDIV.reglaHabilitacion = null;
  } else {
    Materias.push(MI)
    CDIV.reglaHabilitacion = materiaExonerada(MI);
  }
  rehacerPaginaSinEstado();
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
  localStorage.setItem(MI.nombre, Materias.includes(MI));
  reconstruirEstadoPagina();
}

function togglePlan() {
  if (Materias.includes(FC)) {
    Materias = Materias.filter(materia => materia !== FC)
    historialAprobadas.delete(FC.nombre);
    historialExoneradas.delete(FC.nombre);
    Materias.push(MD1)
  } else {
    Materias = Materias.filter(materia => materia !== MD1)
    historialAprobadas.delete(MD1.nombre);
    historialExoneradas.delete(MD1.nombre);
    Materias.push(FC)
  }
  rehacerPaginaSinEstado();
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
  localStorage.setItem(FC.nombre, Materias.includes(FC));
  reconstruirEstadoPagina();
}

function toggleOpcionales() {
  seleccionOpcionales = !seleccionOpcionales;
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
}

function encontrarMateriaPorNombre(nombre) {
  return Materias.find((materia) => materia.nombre == nombre);
}

function toggleMateria(nombre) {
  let materiaActual = encontrarMateriaPorNombre(nombre);
  switch (materiaActual.estado) {
    case Estado.DESHABILITADA:
      popUpGeneral(nombre, "previas");
      break;
    case Estado.HABILITADA:
      historialAprobadas.add(materiaActual.nombre);
      break;
    case Estado.APROBADA:
      historialExoneradas.add(materiaActual.nombre);
      break;
    case Estado.EXONERADA:
      historialAprobadas.delete(materiaActual.nombre);
      historialExoneradas.delete(materiaActual.nombre);
      break;
    default:
      break;
  }
  reconstruirEstadoPagina();
}

function cambiarClaseActivaEnNav(idBoton) {
  document.getElementById(seleccionSemestre).classList.remove(claseResaltarBotonEnNav);
  seleccionSemestre = idBoton;
  document.getElementById(seleccionSemestre).classList.add(claseResaltarBotonEnNav);
}

function toggleBotones(idBoton) {
  cambiarClaseActivaEnNav(idBoton);
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
  localStorage.setItem(LocalStorageNombres.semestre, seleccionSemestre);
}

function isMateriaValid(materia) {
  let semestreLibre = (seleccionSemestre==Semestre.LIBRE && materia.esLibre);
  let semestreAmbos = (seleccionSemestre==Semestre.AMBOS);
  let semestrePrimero = (seleccionSemestre==Semestre.PRIMERO && (materia.semestre==Semestre.PRIMERO || materia.semestre==Semestre.AMBOS))
  let semestreSegundo = (seleccionSemestre==Semestre.SEGUNDO && (materia.semestre==Semestre.SEGUNDO || materia.semestre==Semestre.AMBOS))
  let opcionales = (seleccionOpcionales || !materia.esOpcional);
  return (semestreLibre || semestreAmbos || semestrePrimero || semestreSegundo) && opcionales;
}

function evaluarMostrarMateria(materia) {
  isMateriaValid(materia) ? displayFlex(materia.nombre) : displayNone(materia.nombre);
}

function mostrarBotonesDeMateriasQueCorresponda() {
  Materias.forEach( (materia) => { evaluarMostrarMateria(materia) });
}

function toggleMenu() {
  isNavbarOpen() ? displayFlex(idNavbar) : displayNone(idNavbar);
  document.getElementById(idHam).classList.toggle("abierto");
  seleccionMenu = !seleccionMenu;
}

function resetCreditos() {
  creditosBloque.creditosEnM = 0;
  creditosBloque.creditosEnCE = 0;
  creditosBloque.creditosEnProg = 0;
  creditosBloque.creditosEnAC_SO_RC = 0;
  creditosBloque.creditosEnBD_SI = 0;
  creditosBloque.creditosEnMN = 0;
  creditosBloque.creditosEnIO = 0;
  creditosBloque.creditosEnIS = 0;
  creditosBloque.creditosEnTall_Pasa_Proy = 0;
  creditosBloque.creditosEnGO = 0;
  creditosBloque.creditosEnIAYR = 0;
  creditosBloque.creditosEnCHS = 0;
  creditosBloque.Total = 0;
}

function establecerEstadoBotonMateria(materia){
  const boton = document.getElementById(materia.nombre);
  const { cumple } = evaluarRegla(materia.reglaHabilitacion);
  if (!cumple) {
    materia.estado = Estado.DESHABILITADA;
    boton.style.background = colorDeshabilitada;
    return;
  }
  if (historialExoneradas.has(materia.nombre)) {
    materia.estado = Estado.EXONERADA;
    boton.style.background = colorExonerada;
    return;
  }
  if (historialAprobadas.has(materia.nombre)) {
    materia.estado = Estado.APROBADA;
    boton.style.background = colorAprobada;
    return;
  }
  materia.estado = Estado.HABILITADA;
  boton.style.background = colorHabilitada;
}

function actualizarCreditosTitulo() {
  document.getElementById(idTitulo).textContent = `Materias | Créditos: ${creditosBloque.Total}`;
}

function reconstruyoEstadoValido(){
  let auxHistorialAprobadas = historialAprobadas;
  let auxHistorialExoneradas = historialExoneradas;
  historialAprobadas = new Set();
  historialExoneradas = new Set();
  let huboCambio = true;
  while (huboCambio) {
    calcularCreditos();
    huboCambio = false;
    const copiaAprobadas = new Set(auxHistorialAprobadas);
    copiaAprobadas.forEach( (nombreMateria) => {
      let materia = encontrarMateriaPorNombre(nombreMateria);
      if (!materia) {
        auxHistorialAprobadas.delete(nombreMateria);
        auxHistorialExoneradas.delete(nombreMateria);
        huboCambio = true;
      } else {
        let {cumple} = evaluarRegla(materia.reglaHabilitacion);
        if (cumple) {
          huboCambio = true;
          auxHistorialAprobadas.delete(nombreMateria);
          historialAprobadas.add(nombreMateria);
        }
      }
    })
    if (huboCambio) continue;
    const copiaExoneradas = new Set(auxHistorialExoneradas);
    copiaExoneradas.forEach( (nombreMateria) => {
      let materia = encontrarMateriaPorNombre(nombreMateria);
      let {cumple} = evaluarRegla(materia.reglaHabilitacion);
      if (cumple) {
        huboCambio = true;
        auxHistorialExoneradas.delete(nombreMateria);
        historialExoneradas.add(nombreMateria);
        sumarCreditos(materia);
      }
    })
  }
}

function calcularCreditos() {
  resetCreditos();
  for (const [area, cantidad] of creditosPorArea) {
    if (area in creditosBloque) {
      creditosBloque[area] += cantidad;
      if (area !== "Total") {
        creditosBloque.Total += cantidad;
      }
    }
  }
  historialExoneradas.forEach((nombreMateria) => {
    let materia = encontrarMateriaPorNombre(nombreMateria);
    sumarCreditos(materia);
  });
}

function reconstruirEstadoPagina() {
  reconstruyoEstadoValido();
  calcularCreditos();
  Materias.forEach((materia) => { establecerEstadoBotonMateria(materia); });
  actualizarCreditosTitulo();
  localStorage.setItem(LocalStorageNombres.materiasExoneradas, JSON.stringify(Array.from(historialExoneradas.values())));
  localStorage.setItem(LocalStorageNombres.materiasAprobadas, JSON.stringify(Array.from(historialAprobadas.values())));
}

function reset() {
  historialAprobadas.clear();
  historialExoneradas.clear();
  reconstruirEstadoPagina();
}

function sumarCreditos(materia) {
  if (historialExoneradas.has(materia.nombre)) {
    creditosBloque.Total += materia.creditos;
    creditosBloque[BloqueCreditos[materia.area]] += materia.creditos;
  }
}

function calcularHTMLIndicarPrevias(regla) {
  if (!regla) return;
  let elementoSalida = document.createElement("div");
  elementoSalida.classList.add("rectangulo");
  if (regla.tipo === "predicado") {
    if (evaluarRegla(regla).cumple){
      elementoSalida.classList.add("tachado");
    }
    elementoSalida.textContent = regla.mensajeFalta;
  }
  if (regla.tipo === "todas") {
    let tituloSalida = document.createElement("div");
    tituloSalida.innerText = "Debe cumplir todo lo siguiente";
    tituloSalida.classList.add("titulo-popup");
    elementoSalida.append(tituloSalida);
    regla.reglas.forEach( (reglaActual) => { 
      elementoSalida.append(calcularHTMLIndicarPrevias(reglaActual)); 
    } );
  }
  if (regla.tipo === "alguna") {
    let tituloSalida = document.createElement("div");
    tituloSalida.innerText = "Debe cumplir alguna de las siguientes opciones";
    tituloSalida.classList.add("titulo-popup");
    elementoSalida.append(tituloSalida)
    let opcionNumero = 1;
    regla.reglas.forEach( (reglaActual) => { 
      let tituloOpcion = document.createElement("div");
      tituloOpcion.innerText = `Opción ${opcionNumero}`;
      opcionNumero++;
      tituloOpcion.classList.add("subrayado");
      elementoSalida.append(tituloOpcion);
      elementoSalida.append(calcularHTMLIndicarPrevias(reglaActual)); 
    } );
  }
  if (regla.tipo === "negar") {
    let tituloSalida = document.createElement("div");
    tituloSalida.innerText = "No cumplir lo siguiente";
    tituloSalida.classList.add("titulo-popup");
    elementoSalida.append(tituloSalida);
    elementoSalida.append(calcularHTMLIndicarPrevias(regla.regla)); 
  }
  return elementoSalida;
}

function verRespuestas() {  
  openPopup(idPopupRespuestas);
}

function indicarInformacion(nombreMateria) {
  let htmlFinal = document.createElement("div");
  const materiaAct = encontrarMateriaPorNombre(nombreMateria);
  htmlFinal.append(crearLineaAreaSubrayadaConMargenAbajo(`Información de ${materiaAct.nombreCompleto}`));
  const line = document.createElement("div");
  line.innerText = `Aporta créditos en el área de ${TraduccionBloqueCreditos[materiaAct.area]}`
  line.onclick = () => { mostrarMateriasEnPopup(BloqueCreditos[materiaAct.area]) }
  htmlFinal.append(line);
  materiaAct.informacion.forEach( ({ nombre, valor }) => {
    const a = document.createElement("a");
    a.href = valor;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = nombre;
    const line = document.createElement("div");
    line.append(a);
    htmlFinal.append(line);
  } )
  return htmlFinal;
}

function indicarPrevias(nombre) {
  let htmlPrevias = document.createElement("div");
  const materiaAct = encontrarMateriaPorNombre(nombre);
  htmlPrevias.innerText = `Previas de ${materiaAct.nombreCompleto}:`;
  const previas = calcularHTMLIndicarPrevias(materiaAct.reglaHabilitacion);
  if (previas) {
    htmlPrevias.append(previas);
  } else {
    htmlPrevias.innerText = `${materiaAct.nombreCompleto} no tiene previas.`;
  }
  
  return htmlPrevias;
}

function crearLineaArea(area, creditosEsperados) {
  const linea = document.createElement("div");
  linea.innerText = `-${TraduccionBloqueCreditos[area]}: ${creditosBloque[area]} (${creditosEsperados})`;
  linea.onclick = () => { mostrarMateriasEnPopup(BloqueCreditos[area]) }
  linea.classList.add("paraClick");
  return linea;
}

function crearLineaAreaSubrayada(texto) {
  const linea = document.createElement("div");
  linea.innerText = texto;
  linea.classList.add("subrayado");
  return linea;
}

function crearLineaAreaSubrayadaConMargenAbajo(texto) {
  const linea = document.createElement("div");
  linea.innerText = texto;
  linea.classList.add("margen-inferior");
  linea.classList.add("subrayado");
  return linea;
}

function crearLineaAreaConMargenAbajo(area, creditosEsperados) {
  const linea = document.createElement("div");
  linea.innerText = `-${TraduccionBloqueCreditos[area]}: ${creditosBloque[area]} (${creditosEsperados})`;
  linea.onclick = () => { mostrarMateriasEnPopup(BloqueCreditos[area]) }
  linea.classList.add("paraClick");
  linea.classList.add("margen-inferior");
  return linea;
}

function crearLineaNegrita(nombre, textoDespues) {
  const container = document.createElement("div");
  const texto = document.createElement("span");
  texto.innerText = nombre;
  texto.classList.add("subrayado");
  texto.classList.add("negrita");
  const creditos = document.createElement("span");
  creditos.innerText = textoDespues;
  creditos.classList.add("negrita");
  container.append(texto);
  container.append(creditos);
  return container;
}

function crearLinea(texto) {
  const linea = document.createElement("div");
  linea.innerText = texto;
  return linea;
}

function crearLineaMargenAabajoSubrayadaSeparada(texto, final) {
  const linea = document.createElement("div");
  const lineaPrincipal = document.createElement("span");
  lineaPrincipal.innerText = texto;
  lineaPrincipal.classList.add("subrayado");
  const lineaFinal = document.createElement("span");
  lineaFinal.innerText = final;
  linea.append(lineaPrincipal);
  linea.append(lineaFinal);
  linea.classList.add("margen-inferior");
  return linea;
}

function verAreas() {
  const totBasicas = creditosBloque.creditosEnM + creditosBloque.creditosEnCE;
  const totBT = creditosBloque.creditosEnProg + creditosBloque.creditosEnAC_SO_RC + creditosBloque.creditosEnBD_SI + creditosBloque.creditosEnMN + creditosBloque.creditosEnIO + creditosBloque.creditosEnIS + creditosBloque.creditosEnTall_Pasa_Proy + creditosBloque.creditosEnGO + creditosBloque.creditosEnIAYR;
  const elementoPrincipal = document.createElement("div");
  elementoPrincipal.append(crearLineaAreaSubrayadaConMargenAbajo("Cantidad de créditos por Área"));
  elementoPrincipal.append(crearLineaNegrita("Materias Básicas", `: ${totBasicas} (${80})`));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnM, 70));
  elementoPrincipal.append(crearLineaAreaConMargenAbajo(BloqueCreditos.creditosEnCE, 10));
  elementoPrincipal.append(crearLineaNegrita("Básico-Tec,Técnicas e Int.", `: ${totBT} (${220})`));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnProg, 60));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnAC_SO_RC, 30));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnBD_SI, 10));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnMN, 8));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnIO, 10));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnIS, 10));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnTall_Pasa_Proy, 45));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnGO, 10));
  elementoPrincipal.append(crearLineaAreaConMargenAbajo(BloqueCreditos.creditosEnIAYR, 0));
  elementoPrincipal.append(crearLineaNegrita("Materias Complementarias", `: ${creditosBloque.creditosEnCHS} (${10})`));
  elementoPrincipal.append(crearLineaArea(BloqueCreditos.creditosEnCHS, 10));
  document.getElementById(idPopupAreas).innerHTML = "";
  document.getElementById(idPopupAreas).append(elementoPrincipal);
  openPopup(idPopupAreas);
}

function mostrarMateriasEnPopup(nombre){
  const elementoPrincipal = document.createElement("div");
  elementoPrincipal.append(crearLineaAreaSubrayadaConMargenAbajo(`Materias para ${TraduccionBloqueCreditos[nombre]}`));
  const lineaHechas = crearLineaAreaSubrayada("Materias ya hechas");
  const lineaDisponibles = crearLineaAreaSubrayada("Materias disponibles");
  const materiasDisponibles = document.createElement("div");
  const materiasHechas = document.createElement("div");
  Materias.forEach( (materia)=>{
    if ( materia.area == nombre ){
      if ( historialExoneradas.has(materia.nombre) ){
        materiasHechas.append(crearLinea(`-${materia.nombreCompleto}`))
      }else{
        materiasDisponibles.append(crearLinea(`-${materia.nombreCompleto}`))
      }
    }
  } )
  elementoPrincipal.append(lineaHechas);
  materiasHechas.classList.add("margen-inferior")
  elementoPrincipal.append(materiasHechas);
  elementoPrincipal.append(lineaDisponibles);
  elementoPrincipal.append(materiasDisponibles);
  document.getElementById(idPopupListaMaterias).innerHTML = "";
  document.getElementById(idPopupListaMaterias).append(elementoPrincipal);
  openPopup(idPopupListaMaterias);
}

function obtenerPesoDesdeRegla(regla) {
  if (!regla) return 0;

  if (regla.tipo === "predicado") {
    if (regla.id.startsWith("aprobada:") || regla.id.startsWith("exonerada:")) {
      const nombreMateria = regla.id.split(":")[1];
      const dep = encontrarMateriaPorNombre(nombreMateria);
      if (!dep) return 0;
      if (dep.peso === 0) asignarPesoMateria(dep);
      return dep.peso;
    }
    return 0;
  }

  if (regla.tipo === "todas" || regla.tipo === "alguna") {
    let valorMax = 0;
    regla.reglas.forEach( (reglaActual) => {
      let valorRegla = obtenerPesoDesdeRegla(reglaActual);
      if (valorRegla>valorMax) valorMax = valorRegla;
    } );
    return valorMax;
  }

  return 0;
}

function asignarPesoMateria(materia) {
  materia.peso = obtenerPesoDesdeRegla(materia.reglaHabilitacion) + 1;
}

function crearSeccionesParaMaterias() {
  const parent = document.getElementById(idSecciones);
  parent.querySelectorAll(".container-seccion").forEach(el => el.remove());
  for (let i = 1; i <= PG.peso; i++) {
    const containerDiv = document.createElement("div");
    containerDiv.className = "container-seccion";

    const seccionDiv = document.createElement("div");
    seccionDiv.className = "seccion-contenido";
    seccionDiv.id = `seccion-materias-${i}`;

    containerDiv.appendChild(seccionDiv);
    parent.appendChild(containerDiv);
  }
}

function asignarPesos() {
  Materias.forEach((materia) => {
    materia.peso = 0;
  });
  let maxTotal = 0;
  AGI.peso = 3;
  Pasan.peso = 4;
  TRE.peso = 2
  Materias.forEach((materia) => {
    if (materia.peso === 0) asignarPesoMateria(materia);
    if (materia.peso > maxTotal) maxTotal = materia.peso;
  });
}

function reglaDependeDeMateria(regla, codigoMateria, tipoBuscado) {
  if (!regla) return false;
  if (regla.tipo === "predicado") {
    return regla.id === `${tipoBuscado}:${codigoMateria}`;
  }
  if (regla.tipo === "todas" || regla.tipo === "alguna") {
    return regla.reglas.some((reglaActual) => reglaDependeDeMateria(reglaActual, codigoMateria, tipoBuscado));
  }
  if (regla.tipo === "negar") {
    return false;
  }
  return false;
}

function mostrarDeQueEsPrevia(nombreMateria) {
  let materiaACalcular = encontrarMateriaPorNombre(nombreMateria)
  let cont1 = 0;
  let cont2 = 0;
  const elementoFinal = document.createElement("div");
  const elementoAprobadas = document.createElement("div");
  const elementoExoneradas = document.createElement("div");
  Materias.forEach((materiaActual) => {
    if (reglaDependeDeMateria(materiaActual.reglaHabilitacion, materiaACalcular.nombre, "aprobada")) {
      if (cont1 === 0) {
        elementoAprobadas.append(crearLineaMargenAabajoSubrayadaSeparada(`La aprobación de ${materiaACalcular.nombreCompleto} es previa de`, ":"))
        cont1++;
      }
      elementoAprobadas.append(crearLinea(`-${materiaActual.nombreCompleto}`))
    }
  });
  if (cont1>0) {
    elementoAprobadas.classList.add("margen-inferior");
    elementoFinal.append(elementoAprobadas);
  }
  Materias.forEach((materiaActual) => {
    if (reglaDependeDeMateria(materiaActual.reglaHabilitacion, materiaACalcular.nombre, "exonerada")) {
      if (cont2 === 0) {
        elementoExoneradas.append(crearLineaMargenAabajoSubrayadaSeparada(`La exoneración de ${materiaACalcular.nombreCompleto} es previa de`, ":"))
        cont2++;
      }
      elementoExoneradas.append(crearLinea(`-${materiaActual.nombreCompleto}`))
    }
  });
  if (cont2>0) {
    elementoExoneradas.classList.add("margen-inferior");
    elementoFinal.append(elementoExoneradas);
  }
  if (cont1 + cont2 === 0) {
    elementoFinal.innerText = `${materiaACalcular.nombreCompleto} no es previa de ninguna materia en esta página.`
  }
  return elementoFinal;
}

let seScrolleo = false;

function crearBotonesMaterias(){
  Materias.sort((materia1, materia2) => {
    if (materia1.peso !== materia2.peso) {
        return materia1.peso - materia2.peso;
    }
    if (materia1.esOpcional !== materia2.esOpcional) {
        return (!materia1.esOpcional ? -1 : 1) - (!materia2.esOpcional ? -1 : 1);
    }
    return materia1.nombreCompleto.localeCompare(materia2.nombreCompleto);
  });
  Materias.forEach( (materia) => {

    var button = document.createElement("button");
    button.classList.add("boton-materia")
    button.textContent = `${materia.nombreCompleto} (${materia.creditos})` ;
    if (materia.esOpcional) {
      button.textContent += "*";
    }
    button.id = materia.nombre;

    if (!materia.se_da) {
      const menuIcon = document.createElement("img");
      menuIcon.width = 15;
      menuIcon.height = 15;
      menuIcon.src = "icons/ex-resized.webp";
      menuIcon.alt = "menu-icon";
      menuIcon.className = "icono ex-mat";
      button.prepend(menuIcon);
    }

    button.onclick = function() {
      seScrolleo = false;
      this.mouseIsDown = false;
      clearTimeout(this.idTimeout);
      toggleMateria(materia.nombre);
    };

    button.addEventListener("mousedown", function() {
      this.mouseIsDown = true;
      seScrolleo = false;
      this.idTimeout = setTimeout( () => {
        if(this.mouseIsDown && !seScrolleo) {
          popUpGeneral(materia.nombre, "previaDe");
        }
      }, 800);
    });

    button.addEventListener("mouseleave", function() {
      clearTimeout(this.idTimeout);
      this.mouseIsDown = false;
    });

    button.addEventListener("touchstart", function() {
      this.mouseIsDown = true;
      seScrolleo = false;
      this.idTimeout = setTimeout( () => {
        if(this.mouseIsDown && !seScrolleo) {
          popUpGeneral(materia.nombre, "previaDe");
        }
      }, 800);
    });

    button.addEventListener("touchmove", function() {
      clearTimeout(this.idTimeout);
      this.mouseIsDown = false;
    });

    let parent = document.getElementById(`seccion-materias-${materia.peso}`);
    parent.appendChild(button);

  } );

}

// Util solo para mobile, para poder hacer scroll apretando un boton de una materia sin que aparezca de que es previa

document.addEventListener("scroll", function() {
  seScrolleo = true;
});

// Funciones y eventos de manejo de tamaño de ventana

function checkWidth() {
  if (window.matchMedia("(min-width: 675px)").matches) {
    displayNone(idHamContainer);
    displayFlex(idNavbar);
  } else {
    displayFlex(idHamContainer);
    if (seleccionMenu) {
      this.document.getElementById(idCheckbox).checked = true;
      displayFlex(idNavbar);
    } else {
      this.document.getElementById(idCheckbox).checked = false;
      displayNone(idNavbar);
    }
  }
}

window.addEventListener("resize", function () {
  checkWidth();
});

function agregarCreditos() {
  const select = document.getElementById("select-agregar-creditos");
  select.innerHTML = "";
  for (const key of Object.keys(BloqueCreditos)) {
    const value = BloqueCreditos[key];
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = TraduccionBloqueCreditos[value] ?? value;
    select.appendChild(opt);
  }
  actualizarRegistros();
  openPopup(idPopupAjustarCreditos);
}

function actualizarRegistros() {
  const columnaArea = document.getElementById("columna-area")
  const columnaCreditos = document.getElementById("columna-creditos")
  const columnaFecha = document.getElementById("columna-eliminar")
  columnaArea.innerHTML = "";
  columnaCreditos.innerHTML = "";
  columnaFecha.innerHTML = "";
  const cabezalArea = document.createElement("div");
  cabezalArea.classList.add("entrada-area");
  cabezalArea.classList.add("cabezal");
  cabezalArea.textContent = "Área";
  const cabezalCreditos = document.createElement("div");
  cabezalCreditos.classList.add("entrada-creditos");
  cabezalCreditos.classList.add("cabezal");
  cabezalCreditos.textContent = "Créd.";
  const cabezalEliminar = document.createElement("div");
  cabezalEliminar.classList.add("entrada-eliminar");
  cabezalEliminar.classList.add("cabezal");
  columnaArea.appendChild(cabezalArea);
  columnaCreditos.appendChild(cabezalCreditos);
  columnaFecha.appendChild(cabezalEliminar);
  for (const [index, registro] of registros.entries()) {
    const { area, creditos } = registro;
    const divArea = document.createElement("div");
    divArea.classList.add("entrada-area");
    divArea.textContent = TraduccionBloqueCreditos[area];
    const divCreditos = document.createElement("div");
    divCreditos.classList.add("entrada-creditos");
    divCreditos.textContent = String(creditos);
    const divEliminar = document.createElement("div");
    divEliminar.classList.add("entrada-eliminar");
    const iconoBasura = document.createElement("img");
    iconoBasura.onclick = () => {
      registros.splice(index, 1);
      creditosPorArea.set(area, (creditosPorArea.get(area) ?? 0) - creditos);
      actualizarRegistros();
      reconstruirEstadoPagina();
    }
    iconoBasura.width = 15;
    iconoBasura.height = 15;
    iconoBasura.src = "icons/basura-resized.webp";
    iconoBasura.alt = "basura-icon";
    iconoBasura.id = "basura-icon";
    iconoBasura.className = "icono-basura";
    divEliminar.append(iconoBasura);
    columnaArea.appendChild(divArea);
    columnaCreditos.appendChild(divCreditos);
    columnaFecha.appendChild(divEliminar);
  }
  localStorage.setItem("registros", JSON.stringify(registros));
  localStorage.setItem("creditosPorArea", JSON.stringify(Array.from(creditosPorArea.entries())));
}

function eventoAjustarCreditos() {
  const area = document.getElementById("select-agregar-creditos").value;
  const creditos = Number(document.getElementById("input-agregar-creditos").value);
  if (creditos!=0) {
    if (!Number.isInteger(creditos)) {
      alert("Créditos debe ser un entero");
      return;
    }
    creditosPorArea.set(area, (creditosPorArea.get(area) ?? 0) + creditos);
    registros.push({ area, creditos });
    actualizarRegistros();
    reconstruirEstadoPagina();
  }  
}

// Inicio de pagina

function mostrarSeccionesQueCorrespondan() {
  for (let index = 0; index < PG.peso; index++) {
    const interno = document.getElementById(`seccion-materias-${index+1}`);
    const externo = interno.closest(".container-seccion");
    const listaBotones = interno.querySelectorAll(".boton-materia");
    const allHidden = Array.from(listaBotones).every(btn => {
      const estiloBoton = getComputedStyle(btn);
      return estiloBoton.display === "none";
    });
    externo.style.display = allHidden ? "none" : "flex";
  }
}

function rehacerPaginaSinEstado(){
  asignarPesos();
  crearSeccionesParaMaterias();
  crearBotonesMaterias();
  mostrarSeccionesQueCorrespondan();
}

function firstLoad() {
  rehacerPaginaSinEstado();
  if (localStorage.getItem(LocalStorageNombres.materiasExoneradas)||localStorage.getItem(LocalStorageNombres.materiasAprobadas)) {
    historialExoneradas = new Set(JSON.parse(localStorage.getItem(LocalStorageNombres.materiasExoneradas)));
    historialAprobadas = new Set(JSON.parse(localStorage.getItem(LocalStorageNombres.materiasAprobadas)));
  }
  if (localStorage.getItem(MI.nombre) == "true") {
    document.getElementById("mi-toggle-MI").checked = true;
    toggleMI();
  }
  if (localStorage.getItem(FC.nombre) == "true") {
    document.getElementById("mi-toggle-plan").checked = true;
    togglePlan();
  }
  if (localStorage.getItem(LocalStorageNombres.semestre)) {
    toggleBotones(localStorage.getItem(LocalStorageNombres.semestre));
  }
  if (localStorage.getItem("registros")) {
    registros.splice(0, registros.length, ...(JSON.parse(localStorage.getItem("registros") ?? "[]")));
    creditosPorArea.clear(), (JSON.parse(localStorage.getItem("creditosPorArea") ?? "[]")).forEach(([k,v]) => creditosPorArea.set(k,v));
  }
  reconstruirEstadoPagina();
  checkWidth();
}

firstLoad();