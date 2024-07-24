//comentar y revisar codigo

class Materia {
  constructor(
    nombre,
    creditos,
    previas,
    nombreCompleto,
    semestre,
    opcional,
    libre,
    area
  ) {
    this.creditos = creditos;
    this.nombre = nombre;
    this.previas = previas;
    this.curso = `${nombre}Curso`;
    this.estado = 0;
    this.nombreCompleto = nombreCompleto;
    this.prioridad = 0;
    this.semestre = semestre;
    this.opcional = opcional;
    this.libre = libre;
    this.area = area;
  }
}

const CDIV = new Materia("CDIV", 13, [], "Cálculo DIV", "ambos", "no", "si", "creditosEnM");
const CDIVV = new Materia("CDIVV", 13, [CDIV.curso], "Cálculo DIVV", "ambos", "no", "si", "creditosEnM");
const MD1 = new Materia("MD1", 9, [], "Matemática Discreta 1", "ambos", "no", "si", "creditosEnM");
const P1 = new Materia("P1", 10, [], "Programación 1", "ambos", "no", "no", "creditosEnProg");
const GAL1 = new Materia("GAL1", 9, [], "Geometría y Álgebra Lineal 1", "ambos", "no", "si", "creditosEnM");
const P2 = new Materia("P2", 12, [P1.curso], "Programación 2", "ambos", "no", "no", "creditosEnProg");
const Ec = new Materia("Ec", 7, [], "Economía", "segundo", "si", "no", "creditosEnCHS");
const F1 = new Materia("F1", 10, [], "Física 1", "ambos", "si", "si", "creditosEnCE");
const GAL2 = new Materia("GAL2", 9, [GAL1.curso], "Geometría y Álgebra Lineal 2", "ambos", "no", "si", "creditosEnM");
const AAL = new Materia( "AAL",  9,  [GAL2.curso, CDIV], "Aplicaciones del Álgebra Lineal", "segundo", "si",  "no", "creditosEnMN");
const PYE = new Materia("PYE",  10, [CDIVV.curso, GAL1, CDIV], "Probabilidad y Estadistica",  "ambos",  "no", "si",  "creditosEnM");
const ITI = new Materia("ITI", 8, [PYE], "Introducción a la Teoría de la Información", "primero", "si", "no", "creditosEnM");
const MD2 = new Materia("MD2", 9, [MD1.curso, GAL1.curso], "Matemática Discreta 2", "ambos", "no", "si", "creditosEnM");
const LG = new Materia("LG", 12, [MD1.curso], "Lógica", "primero", "no", "no", "creditosEnM");
const MN = new Materia("MN", 8, [CDIVV, P1, GAL2, GAL1, CDIV], "Métodos Numéricos", "segundo", "no", "no", "creditosEnMN");
const P4 = new Materia("P4",  15, [GAL1, CDIV, MD1, P2], "Programación 4", "primero", "no", "no", "creditosEnProg");
const IIO = new Materia("IIO", 10, [GAL2, PYE, CDIVV, CDIV, GAL1], "Int. a la Investigación de Operaciones", "primero", "no", "no", "creditosEnIO");
const P3 = new Materia("P3", 15, [P2.curso, PYE.curso, P1, MD1], "Programación 3", "segundo", "no", "no", "creditosEnProg");
const ALN = new Materia("ALN", 9, [P3, MN], "Álgebra Lineal Numérica", "segundo", "si", "no", "creditosEnMN");
const AC = new Materia("AC", 12, [CDIV, LG.curso, P2.curso, P1, MD1], "Arquitectura de Computadoras", "segundo", "no", "no", "creditosEnAC_SO_RC");
const CDPGEUPG = new Materia("CDPGEUPG", 10, [P4.curso, AC, P3], "Computación de propósito general en unidades de procesamiento gráfico", "primero", "si", "no", "creditosEnAC_SO_RC");
const CV = new Materia("CV", 10, [CDIVV.curso, GAL1, CDIV], "Cálculo Vectorial", "ambos", "si", "si", "creditosEnM");
const ED = new Materia("ED", 10, [GAL2, CDIVV.curso, GAL1, CDIV], "Int. a las Ec. Diferenciales", "segundo", "si", "si", "creditosEnM");
const TL = new Materia("TL", 12, [P3.curso, CDIV, GAL1, LG, MD1], "Teoría de Lenguajes", "primero", "no", "no", "creditosEnProg");
const FVC = new Materia("FVC", 5, [CV.curso, CDIVV], "Funciones de Variable Compleja", "primero", "si", "si", "creditosEnM");
const SO = new Materia("SO", 12, [AC.curso, GAL1, CDIV, P2, MD1], "Sistemas Operativos", "primero", "no", "no", "creditosEnAC_SO_RC");
const FO = new Materia("FO", 6, [IIO], "Fundamentos de Optimización", "primero", "si", "no", "creditosEnIO");
const OCA = new Materia("OCA", 10, [IIO], "Optimización Continua y Aplicaciones", "segundo", "si", "no", "creditosEnIO");
const FBD = new Materia("FBD", 15, [LG, P3, MD2], "Fundamentos de Bases de Datos", "segundo", "no", "no", "creditosEnBD_SI");
const RC = new Materia("RC", 12, [P3, SO.curso, CDIV, AC.curso], "Redes de Computadoras", "segundo", "no", "no", "creditosEnAC_SO_RC");
const TSI = new Materia("TSI", 10, [RC.curso, FBD, P3], "Taller de Seguridad Informática", "segundo", "si", "no", "creditosEnTall_Pasa_Proy");
const ADAR = new Materia("ADAR", 8, [P3, RC], "Análisis y Diseño de Al. Dis. en Redes", "segundo", "si", "no", "creditosEnAC_SO_RC");
const CAP = new Materia("CAP", 10, [P4.curso, RC.curso, SO.curso, AC.curso], "Computación de alta performance", "primero", "si", "no", "creditosEnAC_SO_RC");
const TP = new Materia("TP", 15, [P3, P4.curso], "Taller de Programación", "segundo", "no", "no", "creditosEnTall_Pasa_Proy");
const IIS = new Materia("IIS", 10, [TP.curso, FBD.curso, P4.curso], "Int. a la Ingeniería de Software", "primero", "no", "no", "creditosEnIS");
const PF = new Materia("PF", 10, [TL, P2, LG, MD1], "Programación Funcional", "segundo", "no", "no", "creditosEnProg");
const PL = new Materia("PL", 10, [TL, P3, MD2, LG], "Programación Lógica", "primero", "no", "no", "creditosEnProg");
const PIS = new Materia("PIS", 15, [IIS.curso, P4], "Proyecto de Ingeniería de Software", "segundo", "no", "no", "creditosEnTall_Pasa_Proy");
const AA = new Materia("AA", 12, [LG, PYE, P3.curso, FBD.curso, P4, MD2], "Aprendizaje Automático", "segundo", "si", "no", "creditosEnIAYR");
const AE = new Materia("AE", 10, [P4, PYE, IIO], "Algoritmos Evolutivos", "segundo", "si", "no", "creditosEnIO");
const ICG = new Materia("ICG", 10, [P3, P4, GAL2.curso, GAL1], "Int. a la Computación Gráfica", "primero", "si", "no", "creditosEnProg");
const CGA = new Materia("CGA", 12, [ICG.curso], "Computación Gráfica Avanzada", "segundo", "si", "no", "creditosEnProg");
const FSI = new Materia("FSI", 12, [SO, FBD, P3, LG, RC], "Fundamentos de la Seguridad Informática", "primero", "si", "no", "creditosEnAC_SO_RC");
const Aux = new Materia("Aux", 0, [], "", "", "", "", "");
const MI = new Materia("MI", 4, [Aux], "Matemática Inicial", "ambos", "no", "no", "creditosEnM");
const CTS = new Materia("CTS", 8, [], "Ciencia, Tecnología y Sociedad", "primero", "si", "no", "creditosEnCHS");
const TRE = new Materia("TRE", 6, [P1], "Taller de Robótica Educativa", "primero", "si", "no", "creditosEnTall_Pasa_Proy");
const F2 = new Materia("F2", 10, [F1.curso, CDIV.curso], "Física 2", "ambos", "si", "no", "creditosEnCE");
const AGI = new Materia("AGI", 5, [Aux], "Administración General para Ingenieros", "primero", "si", "no", "creditosEnGO");
const PAI = new Materia("PAI", 5, [AGI.curso], "Práctica de Administración para Ingenieros", "segundo", "si", "no", "creditosEnGO");
const PCIC = new Materia("PCIC", 3, [], "Políticas Científicas en Inf. y Comp.", "segundo", "si", "no", "creditosEnCHS");
const ASS = new Materia("ASS", 10, [AGI, PAI, RC.curso, SO.curso, FBD.curso, IIS.curso, AC.curso], "Administración y Seguridad de Sistemas", "primero", "si", "no", "creditosEnBD_SI");
const Pasan = new Materia("Pasan", 10, [Aux], "Pasantía", "primero", "si", "no", "creditosEnTall_Pasa_Proy");
const PG = new Materia("PG", 30, [Aux], "Proyecto de Grado", "ambos", "no", "no", "creditosEnTall_Pasa_Proy");

//Revisar todos otra vez

let Materias = [
  MI,
  CDIV,
  CDIVV,
  P1,
  GAL1,
  MD1,
  P2,
  Ec,
  F1,
  GAL2,
  AAL,
  PYE,
  ITI,
  MD2,
  LG,
  MN,
  P4,
  IIO,
  P3,
  ALN,
  CDPGEUPG,
  AC,
  CV,
  ED,
  TL,
  FVC,
  SO,
  FO,
  OCA,
  FBD,
  RC,
  TSI,
  ADAR,
  CAP,
  TP,
  IIS,
  PF,
  PL,
  PIS,
  AA,
  AE,
  ICG,
  CGA,
  FSI,
  CTS,
  TRE,
  F2,
  PCIC,
  AGI,
  PAI,
  Pasan,
  ASS,
  PG,
];

let MateriasPersona = [];
let materias = 0;
let opcionales = true;
let seleccion = false;
let semestreAct = "ambos";

//Cumplir areas

let creditosBloque = {
  creditosEnM: 0, // 70              | MI + MD1 + CDIV + GAL1 + CDIVV + GAL2 + MD2 + PYE + LOG = 88
  creditosEnCE: 0, // 10             | F1 = 10
  creditosEnProg: 0, // 60           | P1 + P2 + P3 + P4 + TL = 64
  creditosEnAC_SO_RC: 0, // 30       | AC + SO + RC = 36
  creditosEnBD_SI: 0, // 10          | FBD = 15
  creditosEnMN: 0, // 8              | MN = 8
  creditosEnIO: 0, // 10             | IIO = 10
  creditosEnIS: 0, // 10             | IIS = 10
  creditosEnTall_Pasa_Proy: 0, // 45 | PG + PIS + TP = 60
  creditosEnGO: 0, // 10             | AGI + PAI = 10
  creditosEnIAYR: 0, // 0            |
  creditosEnCHS: 0, // 10            | EC + PCIC = 10
  Total: 0,
};

// Total = 331 - faltan 139

function sumarCreditos(materia) {
  creditosBloque.Total += materia.creditos;
  switch (materia.area) {
    case "creditosEnM":
      creditosBloque.creditosEnM += materia.creditos;
      break;
    case "creditosEnCE":
      creditosBloque.creditosEnCE += materia.creditos;
      break;
    case "creditosEnProg":
      creditosBloque.creditosEnProg += materia.creditos;
      break;
    case "creditosEnAC_SO_RC":
      creditosBloque.creditosEnAC_SO_RC += materia.creditos;
      break;
    case "creditosEnBD_SI":
      creditosBloque.creditosEnBD_SI += materia.creditos;
      break;
    case "creditosEnMN":
      creditosBloque.creditosEnMN += materia.creditos;
      break;
    case "creditosEnIO":
      creditosBloque.creditosEnIO += materia.creditos;
      break;
    case "creditosEnIS":
      creditosBloque.creditosEnIS += materia.creditos;
      break;
    case "creditosEnTall_Pasa_Proy":
      creditosBloque.creditosEnTall_Pasa_Proy += materia.creditos;
      break;
    case "creditosEnGO":
      creditosBloque.creditosEnGO += materia.creditos;
      break;
    case "creditosEnCHS":
      creditosBloque.creditosEnCHS += materia.creditos;
      break;
    case "creditosEnIAYR":
      creditosBloque.creditosEnIAYR += materia.creditos;
      break;
    default:
      break;
  }
}

function reset() {
  MateriasPersona = [];
  actualizar();
}

function toggleOpcionales() {
  if (opcionales) {
    opcionales = false;
    actualizar();
  } else {
    opcionales = true;
    actualizar();
  }
}

function toggleMateria(nombre) {
  let materiaActual = Materias.find((nombreAux) => nombreAux.nombre == nombre);
  switch (materiaActual.estado) {
    case 0:
      indicarPrevias(nombre);
      break;
    case 1:
      MateriasPersona.push(materiaActual.curso);
      break;
    case 2:
      MateriasPersona.push(materiaActual.nombre);
      break;
    case 3:
      MateriasPersona.splice(MateriasPersona.indexOf(materiaActual.curso), 1);
      MateriasPersona.splice(MateriasPersona.indexOf(materiaActual.nombre), 1);
      break;
    default:
      break;
  }
  actualizar();
}

function indicarPrevias(nombre) {
  let materiaAct = Materias.find((materia) => materia.nombre == nombre);

  let Exonerar = [];
  let Salvar = [];
  let SalvarFinal = [];

  materiaAct.previas.filter((materia) => {
    if (typeof materia == "string") {
      if (!MateriasPersona.includes(materia)) {
        let materiaAux = Materias.find((elemento) => elemento.curso == materia);
        Salvar.push(materiaAux);
      }
    } else {
      if (!MateriasPersona.includes(materia.nombre)) {
        Exonerar.push(materia);
      }
      if (!MateriasPersona.includes(materia.curso)) {
        Salvar.push(materia);
      }
    }
  });

  let texto = `Para poder cursar ${materiaAct.nombreCompleto} te hace falta:<br/><br/>`;

  if (Exonerar.length > 0) {
    texto += `<u>Exonerar</u>:<br/><br/>`;
  }
  Exonerar.forEach((materia) => {
    texto += `-${materia.nombreCompleto}<br/>`;
  });

  Salvar.forEach((materia) => {
    if (!Exonerar.includes(materia)) {
      SalvarFinal.push(materia);
    }
  });
  if (SalvarFinal.length > 0) {
    if (Exonerar.length > 0) {
      texto += `<br/>`;
    }
    texto += `<u>Salvar curso de</u>:<br/><br/>`;
  }
  SalvarFinal.forEach((materia) => {
    if (!Exonerar.includes(materia)) {
      texto += `-${materia.nombreCompleto}<br/>`;
    }
  });

  if (materiaAct == AGI) {
    texto = `Para poder cursar ${materiaAct.nombreCompleto} se necesitan:<br/><br/>`;
    texto += `-140 créditos`;
  }

  if (materiaAct == Pasan) {
    texto = `Para poder validar ${materiaAct.nombreCompleto} se necesitan:<br/><br/>`;
    texto += `-200 créditos`;
  }

  if (materiaAct == TP) {
    texto = `Para poder cursar ${materiaAct.nombreCompleto} se necesita alguna de las siguientes:<br/><br/>`;
    texto += `<u>Opción 1</u>:<br/>`;
    texto += `-Exonerar Programación 3 y Salvar Curso Programación 4<br/><br/>`;
    texto += `<u>Opción 2</u>:<br/>`;
    texto += `-Exonerar Programación 4<br/>`;
  }

  if (materiaAct == PG) {
    texto = `Para poder cursar ${materiaAct.nombreCompleto} hay 3 opciones complejas.<br/><br/>`;
    texto += `Estas están contempladas, para mas información sobre cada una recomendamos averiguar con Bedelías.`;
  }
  openPopup(texto);

}


function displayBlock(elemento){
  document.getElementById(elemento).style.display = "block";
}
function displayNone(elemento){
  document.getElementById(elemento).style.display = "none";
}
function displayFlex(elemento){
  document.getElementById(elemento).style.display = "flex";
}

function actualizar() {
  creditosBloque = {
    creditosEnM: 0, // 70              | MI + MD1 + CDIV + GAL1 + CDIVV + GAL2 + MD2 + PYE + LOG = 88
    creditosEnCE: 0, // 10             | F1 = 10
    creditosEnProg: 0, // 60           | P1 + P2 + P3 + P4 + TL = 64
    creditosEnAC_SO_RC: 0, // 30       | AC + SO + RC = 36
    creditosEnBD_SI: 0, // 10          | FBD = 15
    creditosEnMN: 0, // 8              | MN = 8
    creditosEnIO: 0, // 10             | IIO = 10
    creditosEnIS: 0, // 10             | IIS = 10
    creditosEnTall_Pasa_Proy: 0, // 45 | PG + PIS + TP = 60
    creditosEnGO: 0, // 10             | AGI + PAI = 10
    creditosEnIAYR: 0,
    creditosEnCHS: 0, // 10            | EC + PCIC = 10
    Total: 0,
  };
  materias = 0;

  Materias.forEach((materia) => {
    if (opcionales == true) {
      switch (semestreAct) {
        case "primero":
          if (materia.semestre == "primero" || materia.semestre == "ambos") {
            displayBlock(materia.nombre);
          } else {
            displayNone(materia.nombre)
          }
          break;

        case "segundo":
          if (materia.semestre == "segundo" || materia.semestre == "ambos") {
            displayBlock(materia.nombre);
          } else {
            displayNone(materia.nombre);
          }
          break;
        case "libre":
          if (materia.libre == "si") {
            displayBlock(materia.nombre);
          } else {
            displayNone(materia.nombre);
          }
          break;

        default:
          displayBlock(materia.nombre);
          break;
      }
    } else {
      if (materia.opcional == "no") {
        switch (semestreAct) {
          case "primero":
            if (materia.semestre == "primero" || materia.semestre == "ambos") {
              displayBlock(materia.nombre);
            } else {
              displayNone(materia.nombre);
            }
            break;

          case "segundo":
            if (materia.semestre == "segundo" || materia.semestre == "ambos") {
              displayBlock(materia.nombre);
            } else {
              displayNone(materia.nombre);
            }
            break;
          case "libre":
            if (materia.libre == "si") {
              displayBlock(materia.nombre);
            } else {
              displayNone(materia.nombre);
            }
            break;

          default:
            displayBlock(materia.nombre);
            break;
        }
      } else {
        displayNone(materia.nombre);
      }
    }

    let estanTodas = true;

    materia.previas.forEach((previa) => {
      estanTodas =
        (MateriasPersona.includes(previa.nombre) ||
          MateriasPersona.includes(previa)) &&
        estanTodas;
    });

    if (materia == AGI && creditosBloque.Total >= 140) {
      estanTodas = true;
    }

    if (materia == Pasan && creditosBloque.Total >= 200) {
      estanTodas = true;
    }

    if (materia == TP && !estanTodas) {
      if (MateriasPersona.find((elemento) => elemento == "P4")) {
        estanTodas = true;
      }
    }

    if (materia == PG) {
      if (!estanTodas && creditosBloque.Total >= 380) {
        estanTodas = true;
      }

      if (!estanTodas && creditosBloque.Total >= 365) {
        const verificarSiEstan = ["P3Curso", "SOCurso", "IISCurso", "FBDCurso", "P4Curso", "TPCurso", "TLCurso", "PISCurso", "MNCurso"]
        estanTodas = verificarSiEstan.every(element => MateriasPersona.includes(element));
      }

      if (!estanTodas && creditosBloque.Total >= 330) {
        if (
          creditosBloque.creditosEnMN >= 8 &&
          creditosBloque.creditosEnProg >= 60 &&
          creditosBloque.creditosEnTall_Pasa_Proy >= 15 &&
          creditosBloque.creditosEnM >= 70 &&
          creditosBloque.creditosEnIS >= 10 &&
          creditosBloque.creditosEnIO >= 10 &&
          creditosBloque.creditosEnBD_SI >= 10 &&
          creditosBloque.creditosEnGO >= 10 &&
          creditosBloque.creditosEnAC_SO_RC >= 30 &&
          creditosBloque.creditosEnCHS >= 10
        ) {
          estanTodas = true;
        }
      }
    }

    if (estanTodas) {
      if (
        !MateriasPersona.find((elemento) => elemento == materia.nombre) ||
        !MateriasPersona.find((elemento) => elemento == materia.curso)
      ) {
        document.getElementById(materia.nombre).disabled = false;
        document.getElementById(materia.nombre).style.background = "lightcoral";
        materia.estado = 1;
      }
      if (MateriasPersona.find((elemento) => elemento == materia.curso)) {
        document.getElementById(materia.nombre).style.background = "lightblue";
        materia.estado = 2;
      }
      if (MateriasPersona.find((elemento) => elemento == materia.nombre)) {
        document.getElementById(materia.nombre).style.background = "lightgreen";
        sumarCreditos(materia);
        materias += 1;
        materia.estado = 3;
      }
    } else {
      if (MateriasPersona.includes(materia.nombre)) {
        MateriasPersona.splice(MateriasPersona.indexOf(materia.nombre), 1);
      }
      if (MateriasPersona.includes(materia.curso)) {
        MateriasPersona.splice(MateriasPersona.indexOf(materia.curso), 1);
      }
      materia.estado = 0;
      document.getElementById(materia.nombre).style.background = "gray";
    }
  });

  document.getElementById(
    "titulo"
  ).textContent = `Materias | Créditos: ${creditosBloque.Total}`;

  if (opcionales) {
    document.getElementById("op").innerHTML = "Opcionales: Si";
  } else {
    document.getElementById("op").innerHTML = "Opcionales: No";
  }

  localStorage.setItem("materias", JSON.stringify(MateriasPersona));
}

function checkWidth() {
  if (window.matchMedia("(min-width: 675px)").matches) {
    displayNone("checkbox-container");
    displayFlex("navbar");
  } else {
    displayFlex("checkbox-container");
    if (seleccion) {
      this.document.getElementById("checkbox").checked = true;
      displayFlex("navbar");
    } else {
      this.document.getElementById("checkbox").checked = false;
      displayNone("navbar");
    }
  }
}

function openPopup(texto) {
  document.getElementById("popup-text").innerHTML = texto;
  displayFlex("boxPopup");
  document.getElementById('cerrar-popup').focus();
}

function closePopup() {
  displayNone("boxPopup");
}

function toggleMI() {
  if (document.getElementById("MI").disabled == true) {
    document.getElementById("MI").disabled = false;
    MI.previas = [];
    CDIV.previas = [MI];
  } else {
    document.getElementById("MI").disabled = true;
    MI.previas = [Aux];
    CDIV.previas = [];
  }
  actualizar();
  localStorage.setItem("MI", document.getElementById("MI").disabled);
}

function cambiarColores(color1, color2, color3, color4){
  document.getElementById("primero").style.backgroundColor = color1;
  document.getElementById("segundo").style.backgroundColor = color2;
  document.getElementById("ambos").style.backgroundColor = color3;
  document.getElementById("libre").style.backgroundColor = color4;
}

function toggleBotones(valor) {
  semestreAct = valor;
  let colorSec = "lightgrey";
  let colorPrin = "lightskyblue";

  switch (valor) {
    case "primero":
      cambiarColores(colorPrin, colorSec, colorSec, colorSec);
      displayBlock("activarMI");
      break;
    case "segundo":
      cambiarColores(colorSec, colorPrin, colorSec, colorSec);
      displayBlock("activarMI");
      break;
    case "ambos":
      cambiarColores(colorSec, colorSec, colorPrin, colorSec);
      displayBlock("activarMI");
      break;
    case "libre":
      cambiarColores(colorSec, colorSec, colorSec, colorPrin);
      displayNone("activarMI");
      break;
    default:
      break;
  }
  actualizar();
  localStorage.setItem("semestre", semestreAct);
}

function toggleMenu() {
  if (document.getElementById("checkbox").checked) {
    displayFlex("navbar");
    seleccion = !seleccion;
  } else {
    displayNone("navbar")
    seleccion = !seleccion;
  }
}

function verAreas(){

    let texto = `<u>Cantidad de créditos por Área</u><br/><br/>`
    texto += `<b><u>Materias Básicas</u>: ${creditosBloque.creditosEnM + creditosBloque.creditosEnCE} (80)</b><br/>`
    texto += `-<span onclick="mostrarMaterias('m')">Matemática</span>: ${creditosBloque.creditosEnM} (70)<br/>`
    texto += `-<span onclick="mostrarMaterias('ce')">Ciencias Experimentales</span>: ${creditosBloque.creditosEnCE} (10)<br/><br/>`
    texto += `<b><u>Básico-Tec,Técnicas e Int.</u>: ${creditosBloque.creditosEnProg + creditosBloque.creditosEnAC_SO_RC + creditosBloque.creditosEnBD_SI + creditosBloque.creditosEnMN + creditosBloque.creditosEnIO + creditosBloque.creditosEnIS + creditosBloque.creditosEnTall_Pasa_Proy + creditosBloque.creditosEnGO + creditosBloque.creditosEnIAYR} (220)</b><br/>`
    texto += `-<span onclick="mostrarMaterias('p')">Programación</span>: ${creditosBloque.creditosEnProg} (60)<br/>`
    texto += `-<span onclick="mostrarMaterias('a')">Arq., S. OP., Redes de C.</span>: ${creditosBloque.creditosEnAC_SO_RC} (30)<br/>`
    texto += `-<span onclick="mostrarMaterias('b')">B. Datos y Sist. de I.</span>: ${creditosBloque.creditosEnBD_SI} (10)<br/>`
    texto += `-<span onclick="mostrarMaterias('cn')">Cálculo Numérico</span>: ${creditosBloque.creditosEnMN} (8)<br/>`
    texto += `-<span onclick="mostrarMaterias('i')">Investigación Operativa</span>: ${creditosBloque.creditosEnIO} (10)<br/>`
    texto += `-<span onclick="mostrarMaterias('is')">Ingeniería de Software</span>: ${creditosBloque.creditosEnIS} (10)<br/>`
    texto += `-<span onclick="mostrarMaterias('ai')">A. Integ., Tall., Pas. y Proy.</span>: ${creditosBloque.creditosEnTall_Pasa_Proy} (45)<br/>`
    texto += `-<span onclick="mostrarMaterias('go')">Gestión en Organizaciones</span>: ${creditosBloque.creditosEnGO} (10)<br/>`
    texto += `-<span onclick="mostrarMaterias('ia')">Int. Artificial y Robótica</span>: ${creditosBloque.creditosEnIAYR} (0)<br/><br/>`
    texto += `<b><u>Materias Complementarias</u>: ${creditosBloque.creditosEnCHS} (10)</b><br/>`
    texto += `-<span onclick="mostrarMaterias('ch')">Ciencias H. y S.</span>: ${creditosBloque.creditosEnCHS} (10)<br/>`
    openPopup(texto);

}

function mostrarMaterias(nombre){

  let area, nombreArea;

  switch (nombre) {
    case "m":
      area = "creditosEnM"
      nombreArea = "Matemática"
      break;
    case "ce":
      area = "creditosEnCE"
      nombreArea = "Ciencias Experimentales"
      break;
    case "p":
      area = "creditosEnProg"
      nombreArea = "Programación"
      break;
    case "a":
      area = "creditosEnAC_SO_RC"
      nombreArea = "Arq., S. OP., Redes de C."
      break;
    case "b":
      area = "creditosEnBD_SI"
      nombreArea = "B. Datos y Sist. de I."
      break;
    case "cn":
      area = "creditosEnMN"
      nombreArea = "Cálculo Numérico"
      break;
    case "i":
      area = "creditosEnIO"
      nombreArea = "Investigación Operativa"
      break;
    case "is":
      area = "creditosEnIS"
      nombreArea = "Ingeniería de Software"
      break;
    case "ai":
      area = "creditosEnTall_Pasa_Proy"
      nombreArea = "A. Integ., Tall., Pas. y Proy."
      break;
    case "go":
      area = "creditosEnGO"
      nombreArea = "Gestión en Organizaciones"
      break;
    case "ia":
      area = "creditosEnIAYR"
      nombreArea = "Int. Artificial y Robótica"
      break;
    case "ch":
      area = "creditosEnCHS"
      nombreArea = "Ciencias H. y S."
      break;
  
    default:
      break;
  }

  texto = `<u>Materias para ${nombreArea}</u>:<br/><br/>`;
  textoOcupadas = "<br/><u>Materias ya hechas</u>:<br/>"
  textoDisponible = "<u>Materias disponibles</u>:<br/>"

  Materias.forEach( (materia)=>{

    if ( materia.area == area ){
      if ( MateriasPersona.find((elemento) => elemento == materia.nombre) ){
        textoOcupadas += `-${materia.nombreCompleto}<br/>`;
      }else{
        textoDisponible += `-${materia.nombreCompleto}<br/>`;
      }

    }

  } )

  document.getElementById("popup-text").innerHTML = texto + textoDisponible + textoOcupadas;

}

function verMaterias(){
  texto = ``;
  cantidad = 0;
  Materias.forEach( (materia)=>{

    if ( MateriasPersona.find((elemento) => elemento == materia.nombre) ){
      texto += `-${materia.nombreCompleto}<br/>`;
      cantidad+=1;
    }

  } )
  openPopup(`<u>Materias hechas</u>: ${cantidad}<br/><br/>` + texto);
}

function firstLoad() {
  if (localStorage.getItem("materias")) {
    MateriasPersona = JSON.parse(localStorage.getItem("materias"));
  }
  document.getElementById("MI").disabled = true;
  if (localStorage.getItem("MI") == "false") {
    toggleMI();
  }
  if (localStorage.getItem("semestre")) {
    semestreAct = localStorage.getItem("semestre");
    toggleBotones(semestreAct);
  }
  if (!localStorage.getItem("semestre") && localStorage.getItem("MI") != "false"){
    actualizar();
  }
  checkWidth();
}

firstLoad();

window.addEventListener("resize", function () {
  checkWidth();
});

window.onclick = function (event) {
  var modal = document.getElementById("boxPopup");
  if (event.target == modal) {
    closePopup();
  }
};