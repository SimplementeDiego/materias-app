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
  creditosEnOpcionales: "Materias Opcionales",
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
  creditosEnOpcionales : "creditosEnOpcionales",
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
const idPopupReset = "popup-reset";

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
  creditosEnOpcionales: 0,
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

let Materias = [];
let IC;
let CDIV;
let MD1;
let FC;
let MI;
let TRE;
let AGI;
let Pasan;
let PG;

const materiasPorNombre = new Map();
const nombresMateriasExcluidasInicialmente = new Set(["IC", "FC", "MI"]);

function reglaDesdeJson(regla) {
  if (!regla) return null;
  if (regla.tipo === "materiaAprobada") {
    return materiaAprobada(materiasPorNombre.get(regla.materia));
  }
  if (regla.tipo === "materiaExonerada") {
    return materiaExonerada(materiasPorNombre.get(regla.materia));
  }
  if (regla.tipo === "creditosMinimos") {
    return creditosMinimos(BloqueCreditos[regla.area], regla.cantidad);
  }
  if (regla.tipo === "todas") {
    return todas(...regla.reglas.map(reglaDesdeJson));
  }
  if (regla.tipo === "alguna") {
    return alguna(...regla.reglas.map(reglaDesdeJson));
  }
  if (regla.tipo === "negar") {
    return negar(reglaDesdeJson(regla.regla));
  }
  return null;
}

function actualizarMateriaDesdeJson(materia, datos) {
  const creditosPorArea = datos.creditosPorArea ?? [];
  materia.nombreCompleto = datos.nombreCompleto;
  materia.creditos = datos.creditos;
  materia.semestre = datos.semestre;
  materia.esOpcional = datos.esOpcional;
  materia.esLibre = datos.esLibre;
  materia.se_da = datos.seDa;
  materia.informacion = datos.informacion ?? [];
  materia.creditosPorArea = creditosPorArea;
  materia.area = creditosPorArea[0]?.area;
  materia.reglaHabilitacion = reglaDesdeJson(datos.reglaHabilitacion);
}

function guardarMateriasNecesarias() {
  IC = materiasPorNombre.get("IC");
  CDIV = materiasPorNombre.get("CDIV");
  MD1 = materiasPorNombre.get("MD1");
  FC = materiasPorNombre.get("FC");
  MI = materiasPorNombre.get("MI");
  TRE = materiasPorNombre.get("TRE");
  AGI = materiasPorNombre.get("AGI");
  Pasan = materiasPorNombre.get("Pasan");
  PG = materiasPorNombre.get("PG");
}

async function cargarMateriasDesdeJson() {
  const response = await fetch("./materias.json");
  const materiasJson = await response.json();
  materiasPorNombre.clear();
  materiasJson.forEach((datos) => {
    const area = datos.creditosPorArea?.[0]?.area;
    materiasPorNombre.set(
      datos.id,
      new Materia(
        datos.id,
        datos.creditos,
        null,
        datos.nombreCompleto,
        datos.semestre,
        datos.esOpcional,
        datos.esLibre,
        area,
        datos.informacion ?? []
      )
    );
  });
  materiasJson.forEach((datos) => {
    actualizarMateriaDesdeJson(materiasPorNombre.get(datos.id), datos);
  });
  guardarMateriasNecesarias();
  Materias = materiasJson.map((datos) => materiasPorNombre.get(datos.id)).filter((materia) => !nombresMateriasExcluidasInicialmente.has(materia.nombre));
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
    Materias = Materias.filter(materia => materia !== IC)
    historialAprobadas.delete(FC.nombre);
    historialExoneradas.delete(FC.nombre);
    historialAprobadas.delete(IC.nombre);
    historialExoneradas.delete(IC.nombre);
    Materias.push(MD1)
  } else {
    Materias = Materias.filter(materia => materia !== MD1)
    historialAprobadas.delete(MD1.nombre);
    historialExoneradas.delete(MD1.nombre);
    Materias.push(FC);
    Materias.push(IC);
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
  creditosBloque.creditosEnOpcionales = 0;
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

function borrarProgreso() {
  historialAprobadas.clear();
  historialExoneradas.clear();
  reconstruirEstadoPagina();
  closePopup();
}

function reset() {
  openPopup(idPopupReset);
}

function sumarCreditos(materia) {
  if (historialExoneradas.has(materia.nombre)) {
    const aportes = obtenerAportesMateria(materia);
    aportes.forEach(({ area, creditos }) => {
      creditosBloque.Total += creditos;
      creditosBloque[BloqueCreditos[area]] += creditos;
    });
  }
}

function obtenerAportesMateria(materia) {
  return materia.creditosPorArea?.length ? materia.creditosPorArea : [{ area: materia.area, creditos: materia.creditos }];
}

function materiaAportaEnArea(materia, areaBuscada) {
  return obtenerAportesMateria(materia).some(({ area }) => area === areaBuscada);
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
  obtenerAportesMateria(materiaAct).forEach(({ area, creditos }) => {
    const areaNormalizada = area;
    const line = document.createElement("div");
    line.innerText = `Aporta ${creditos} créditos en el área de ${TraduccionBloqueCreditos[areaNormalizada]}`;
    line.onclick = () => { mostrarMateriasEnPopup(areaNormalizada) };
    line.classList.add("paraClick");
    htmlFinal.append(line);
  });
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
  elementoPrincipal.append(crearLineaAreaConMargenAbajo(BloqueCreditos.creditosEnCHS, 10));
  elementoPrincipal.append(crearLineaNegrita("Materias Opcionales", `: ${creditosBloque.creditosEnOpcionales} (${0})`));
  elementoPrincipal.append(crearLineaAreaConMargenAbajo(BloqueCreditos.creditosEnOpcionales, 0));
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
    if (materiaAportaEnArea(materia, nombre)){
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

async function firstLoad() {
  await cargarMateriasDesdeJson();
  if (localStorage.getItem(LocalStorageNombres.materiasExoneradas)||localStorage.getItem(LocalStorageNombres.materiasAprobadas)) {
    historialExoneradas = new Set(JSON.parse(localStorage.getItem(LocalStorageNombres.materiasExoneradas)));
    historialAprobadas = new Set(JSON.parse(localStorage.getItem(LocalStorageNombres.materiasAprobadas)));
  }
  if (localStorage.getItem(MI.nombre) == "true") {
    document.getElementById("mi-toggle-MI").checked = true;
    if (Materias.includes(MI)) {
      Materias = Materias.filter(materia => materia !== MI)
      CDIV.reglaHabilitacion = null;
    } else {
      Materias.push(MI)
      CDIV.reglaHabilitacion = materiaExonerada(MI);
    }
  }
  if (localStorage.getItem(FC.nombre) == "true") {
    document.getElementById("mi-toggle-plan").checked = true;
    if (Materias.includes(FC)) {
      Materias = Materias.filter(materia => materia !== FC)
      Materias = Materias.filter(materia => materia !== IC)
      Materias.push(MD1)
    } else {
      Materias = Materias.filter(materia => materia !== MD1)
      Materias.push(FC);
      Materias.push(IC);
    }
  }
  if (localStorage.getItem("registros")) {
    registros.splice(0, registros.length, ...(JSON.parse(localStorage.getItem("registros") ?? "[]")));
    creditosPorArea.clear(), (JSON.parse(localStorage.getItem("creditosPorArea") ?? "[]")).forEach(([k,v]) => creditosPorArea.set(k,v));
  }
  rehacerPaginaSinEstado();
  reconstruirEstadoPagina();
  if (localStorage.getItem(LocalStorageNombres.semestre)) {
    toggleBotones(localStorage.getItem(LocalStorageNombres.semestre));
  }
  checkWidth();
}

firstLoad().catch((error) => {
  console.error("No se pudo cargar materias.json", error);
});

