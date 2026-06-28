// revisar codigo

const LocalStorageNombres = Object.freeze({
  materiasAprobadas: "materiasAprobadas",
  materiasExoneradas: "materiasExoneradas",
  semestre : "semestre",
  vistaSeleccionada: "vistaSeleccionada",
  seleccionOpcionales: "seleccionOpcionales",
  planificacionSemestres: "planificacionSemestres",
  planificacionUsaEstadoActual: "planificacionUsaEstadoActual",
  planificacionExoneradasBase: "planificacionExoneradasBase"
});

const FirebaseConfig = Object.freeze({
  versionCdn: "12.15.0",
  coleccionUsuarios: "usuarios",
});

const Semestre = Object.freeze({
  PRIMERO: "primero",
  SEGUNDO: "segundo",
  AMBOS: "ambos",
  LIBRE: "libre"
});

const PeriodoPlanificado = Object.freeze({
  EXAMENES: "examenes"
});

const ResultadoPlanificado = Object.freeze({
  HABILITADA: "habilitada",
  CURSO: "curso",
  EXONERADA: "exonerada"
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
const idPopupImportarDatos = "popup-importar-datos";
const idPopupCuentaFirebase = "popup-cuenta-firebase";
const idPopupReset = "popup-reset";
const idVistaPlanificacion = "vista-planificacion";
const idSeccionInformacion = "seccion-informacion";
const idSeccionConfiguracion = "seccion-configuracion";
const idSeccionFiltros = "seccion-filtros";
const idBotonMaterias = "materias";
const idBotonPlanificacion = "planificacion";
const idInputBuscarMateria = "input-buscar-materia";
const idSelectFiltrarSemestre = "select-filtrar-semestre";
const idSelectFiltrarArea = "select-filtrar-area";
const idTextareaImportarDatos = "textarea-importar-datos";
const idFirebaseEstado = "firebase-estado";
const idFirebaseEmail = "firebase-email";
const idFirebasePassword = "firebase-password";
const idBotonFirebaseLogout = "boton-firebase-logout";
const idFirebaseAuthForm = "firebase-auth-form";
const idFirebaseDecisionDatos = "firebase-decision-datos";

const registros = [];
const creditosPorArea = new Map();
let historialAprobadas = new Set();
let historialExoneradas = new Set();
let planificacionSemestres = [];
let planificacionExoneradasBase = new Set();
let planificacionUsaEstadoActual = true;
let seleccionOpcionales = true;
let seleccionMenu = false;
let seleccionSemestre = Semestre.AMBOS;
let seleccionNavbar = idBotonMaterias;
let vistaPlanificacionActiva = false;
let valorBarra = BarraPopup.Previas;
let popUpActual = idPopupMateria;
let filtroTextoMateria = "";
let filtroAreaMateria = "";
let timeoutMensajeUsuario;
let firebaseInicializacionPromesa = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseUsuario = null;
let firebaseApi = {};
let firebaseCargandoDatosRemotos = false;
let firebaseGuardadoProgramado = null;
let firebaseDatosRemotosPendientes = null;
let firebaseResolucionDatosPendiente = false;
let localStorageBloqueado = false;
let avisoLocalStorageMostrado = false;

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
  guardarLocalStorage(MI.nombre, Materias.includes(MI));
  reconstruirEstadoPagina();
  renderizarPlanificacionSiActiva();
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
  guardarLocalStorage(FC.nombre, Materias.includes(FC));
  reconstruirEstadoPagina();
  renderizarPlanificacionSiActiva();
}

function toggleOpcionales() {
  seleccionOpcionales = document.getElementById("mi-toggle-opcionales").checked;
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
  guardarLocalStorage(LocalStorageNombres.seleccionOpcionales, JSON.stringify(seleccionOpcionales));
  programarGuardadoFirebase();
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

function obtenerIdNavbarValido(idBoton) {
  if (Object.values(Semestre).includes(idBoton)) return idBotonMaterias;
  const idsValidos = [idBotonMaterias, idBotonPlanificacion];
  return idsValidos.includes(idBoton) ? idBoton : idBotonMaterias;
}

function obtenerIdSemestreValido(idBoton) {
  return Object.values(Semestre).includes(idBoton) ? idBoton : Semestre.AMBOS;
}

function cambiarClaseActivaEnNav(idBoton) {
  const idBotonValido = obtenerIdNavbarValido(idBoton);
  document.getElementById(seleccionNavbar)?.classList.remove(claseResaltarBotonEnNav);
  seleccionNavbar = idBotonValido;
  document.getElementById(seleccionNavbar).classList.add(claseResaltarBotonEnNav);
}

function mostrarVistaPlanificacion(activar) {
  vistaPlanificacionActiva = activar;
  const vistaPlanificacion = document.getElementById(idVistaPlanificacion);
  const toggleOpcionales = document.getElementById("mi-toggle-opcionales")?.closest(".container-item-config");
  const seccionesVisiblesEnPlanificacion = new Set([idVistaPlanificacion, idSeccionInformacion, idSeccionConfiguracion]);
  vistaPlanificacion.style.display = activar ? "flex" : "none";
  if (toggleOpcionales) {
    toggleOpcionales.style.display = activar ? "none" : "";
  }
  document.querySelectorAll(`#${idSecciones} > .container-seccion, #${idSecciones} > .container-seccion-estatico`).forEach((seccion) => {
    if (!seccionesVisiblesEnPlanificacion.has(seccion.id)) {
      seccion.style.display = activar ? "none" : "";
    }
  });
  if (!activar) {
    mostrarSeccionesQueCorrespondan();
  }
}

function seleccionarSemestre(idSemestre) {
  seleccionSemestre = obtenerIdSemestreValido(idSemestre);
  const selectSemestre = document.getElementById(idSelectFiltrarSemestre);
  if (selectSemestre) {
    selectSemestre.value = seleccionSemestre;
  }
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
  guardarLocalStorage(LocalStorageNombres.semestre, seleccionSemestre);
  programarGuardadoFirebase();
}

function actualizarFiltroSemestre() {
  seleccionarSemestre(document.getElementById(idSelectFiltrarSemestre).value);
}

function verMaterias() {
  cambiarClaseActivaEnNav(idBotonMaterias);
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarVistaPlanificacion(false);
  guardarLocalStorage(LocalStorageNombres.vistaSeleccionada, idBotonMaterias);
  programarGuardadoFirebase();
  closeNavIfMobile();
}

function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function materiaCumpleFiltroTexto(materia) {
  if (!filtroTextoMateria) return true;
  const textoMateria = normalizarTexto(`${materia.nombre} ${materia.nombreCompleto}`);
  return textoMateria.includes(filtroTextoMateria);
}

function materiaCumpleFiltroArea(materia) {
  return !filtroAreaMateria || materiaAportaEnArea(materia, filtroAreaMateria);
}

function actualizarFiltroMaterias() {
  filtroTextoMateria = normalizarTexto(document.getElementById(idInputBuscarMateria).value.trim());
  filtroAreaMateria = document.getElementById(idSelectFiltrarArea).value;
  mostrarBotonesDeMateriasQueCorresponda();
  mostrarSeccionesQueCorrespondan();
}

function cargarOpcionesFiltroAreas() {
  const select = document.getElementById(idSelectFiltrarArea);
  select.innerHTML = "";
  const opcionTodas = document.createElement("option");
  opcionTodas.value = "";
  opcionTodas.textContent = "Todas";
  select.appendChild(opcionTodas);
  Object.values(BloqueCreditos).forEach((area) => {
    if (area === BloqueCreditos.Total) return;
    const option = document.createElement("option");
    option.value = area;
    option.textContent = TraduccionBloqueCreditos[area] ?? area;
    select.appendChild(option);
  });
}

function isMateriaValid(materia) {
  let semestreLibre = (seleccionSemestre==Semestre.LIBRE && materia.esLibre);
  let semestreAmbos = (seleccionSemestre==Semestre.AMBOS);
  let semestrePrimero = (seleccionSemestre==Semestre.PRIMERO && (materia.semestre==Semestre.PRIMERO || materia.semestre==Semestre.AMBOS))
  let semestreSegundo = (seleccionSemestre==Semestre.SEGUNDO && (materia.semestre==Semestre.SEGUNDO || materia.semestre==Semestre.AMBOS))
  let opcionales = (seleccionOpcionales || !materia.esOpcional);
  return (semestreLibre || semestreAmbos || semestrePrimero || semestreSegundo) && opcionales && materiaCumpleFiltroTexto(materia) && materiaCumpleFiltroArea(materia);
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

function mostrarErrorLocalStorage(error) {
  localStorageBloqueado = true;
  console.error("No se pudo acceder a localStorage", error);
  if (avisoLocalStorageMostrado) return;
  avisoLocalStorageMostrado = true;
  mostrarMensajeUsuario("Tu navegador está bloqueando el almacenamiento local. Permití datos del sitio o abrí la página en otro navegador.");
}

function crearErrorLocalStorageBloqueado() {
  const error = new Error("El navegador está bloqueando el almacenamiento local. No se puede guardar el estado local en Firebase.");
  error.code = "localStorage/bloqueado";
  return error;
}

function leerLocalStorage(clave) {
  try {
    return window.localStorage.getItem(clave);
  } catch (error) {
    mostrarErrorLocalStorage(error);
    return null;
  }
}

function guardarLocalStorage(clave, valor) {
  try {
    window.localStorage.setItem(clave, String(valor));
    return true;
  } catch (error) {
    mostrarErrorLocalStorage(error);
    return false;
  }
}

function eliminarLocalStorage(clave) {
  try {
    window.localStorage.removeItem(clave);
    return true;
  } catch (error) {
    mostrarErrorLocalStorage(error);
    return false;
  }
}

function leerJsonLocalStorage(nombre, valorPorDefecto) {
  const guardado = leerLocalStorage(nombre);
  if (!guardado) return valorPorDefecto;
  try {
    return JSON.parse(guardado);
  } catch (error) {
    return valorPorDefecto;
  }
}

function obtenerClavesLocalStorageRelevantes() {
  return [
    ...Object.values(LocalStorageNombres),
    "registros",
    "creditosPorArea",
    MI?.nombre ?? "MI",
    FC?.nombre ?? "FC",
  ];
}

function crearBackupLocalStorage() {
  const datos = {};
  obtenerClavesLocalStorageRelevantes().forEach((clave) => {
    const valor = leerLocalStorage(clave);
    if (valor !== null) {
      datos[clave] = valor;
    }
  });
  return {
    aplicacion: "materias-app",
    version: 1,
    exportadoEn: new Date().toISOString(),
    datos,
  };
}

function copiarTextoAlClipboard(texto) {
  const copiarConTextarea = () => {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    const copiado = document.execCommand("copy");
    textarea.remove();
    return copiado ? Promise.resolve() : Promise.reject(new Error("No se pudo copiar."));
  };

  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(texto).catch(copiarConTextarea);
  }

  return copiarConTextarea();
}

function mostrarMensajeUsuario(texto) {
  let mensaje = document.getElementById("mensaje-usuario");
  if (!mensaje) {
    mensaje = document.createElement("div");
    mensaje.id = "mensaje-usuario";
    mensaje.classList.add("mensaje-usuario");
    mensaje.setAttribute("role", "status");
    mensaje.setAttribute("aria-live", "polite");
    document.body.append(mensaje);
  }

  mensaje.textContent = texto;
  mensaje.classList.add("visible");
  clearTimeout(timeoutMensajeUsuario);
  timeoutMensajeUsuario = setTimeout(() => {
    mensaje.classList.remove("visible");
  }, 3000);
}

function firebaseConfigEsValida() {
  const config = window.firebaseConfig;
  return Boolean(
    config &&
    typeof config === "object" &&
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    !config.apiKey.includes("TU_")
  );
}

function actualizarVistaCuentaFirebase(textoEstado = "", esError = false) {
  const estado = document.getElementById(idFirebaseEstado);
  const form = document.getElementById(idFirebaseAuthForm);
  const botonLogout = document.getElementById(idBotonFirebaseLogout);
  const decisionDatos = document.getElementById(idFirebaseDecisionDatos);

  if (!estado || !form || !botonLogout) return;

  estado.classList.toggle("error", esError);
  if (decisionDatos) {
    decisionDatos.style.display = firebaseResolucionDatosPendiente ? "flex" : "none";
  }

  if (!firebaseConfigEsValida()) {
    estado.textContent = "Firebase no configurado. Completá firebase-config.js para habilitar cuentas.";
    estado.classList.add("error");
    form.style.display = "none";
    botonLogout.style.display = "none";
    if (decisionDatos) decisionDatos.style.display = "none";
    return;
  }

  if (firebaseUsuario) {
    estado.textContent = textoEstado || `Sesión iniciada como ${firebaseUsuario.email}.`;
    form.style.display = "none";
    botonLogout.style.display = "block";
    return;
  }

  estado.textContent = textoEstado || "Ingresá con tu email para sincronizar el avance entre dispositivos.";
  form.style.display = "flex";
  botonLogout.style.display = "none";
}

function normalizarDatosStorage(datos) {
  const datosNormalizados = {};
  obtenerClavesLocalStorageRelevantes().forEach((clave) => {
    if (!Object.prototype.hasOwnProperty.call(datos, clave)) {
      datosNormalizados[clave] = null;
      return;
    }

    const valor = datos[clave];
    datosNormalizados[clave] = valor === null || typeof valor === "string"
      ? valor
      : JSON.stringify(valor);
  });
  return datosNormalizados;
}

function datosStorageSonIguales(datosA, datosB) {
  return JSON.stringify(normalizarDatosStorage(datosA)) === JSON.stringify(normalizarDatosStorage(datosB));
}

function mostrarDecisionDatosFirebase(datosRemotos) {
  firebaseDatosRemotosPendientes = datosRemotos;
  firebaseResolucionDatosPendiente = true;
  actualizarVistaCuentaFirebase("Hay datos guardados en la base de datos. Elegí con cuáles querés continuar.");
  openPopup(idPopupCuentaFirebase);
}

function obtenerMensajeErrorFirebase(error, accion) {
  const mensajes = {
    "auth/email-already-in-use": "Ese email ya tiene una cuenta. Probá ingresar en vez de crearla.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/invalid-email": "El email ingresado no es válido.",
    "auth/missing-password": "Ingresá la contraseña.",
    "auth/network-request-failed": "No se pudo conectar con Firebase. Revisá tu conexión.",
    "auth/operation-not-allowed": "El ingreso con email y contraseña no está habilitado en Firebase.",
    "auth/too-many-requests": "Demasiados intentos. Esperá un momento y probá de nuevo.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/wrong-password": "La contraseña es incorrecta.",
  };

  return mensajes[error?.code] ?? `No se pudo ${accion}.`;
}

function obtenerDetalleError(error) {
  if (!error) return "Sin detalle.";
  const partes = [];
  if (error.code) partes.push(`Código: ${error.code}`);
  if (error.name) partes.push(`Nombre: ${error.name}`);
  if (error.message) partes.push(`Mensaje: ${error.message}`);
  return partes.length ? partes.join(" | ") : String(error);
}

function obtenerMensajeErrorConDetalle(mensaje, error) {
  return `${mensaje} ${obtenerDetalleError(error)}`;
}

async function inicializarFirebase() {
  if (!firebaseConfigEsValida()) {
    actualizarVistaCuentaFirebase();
    return false;
  }

  if (firebaseInicializacionPromesa) {
    return firebaseInicializacionPromesa;
  }

  firebaseInicializacionPromesa = Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FirebaseConfig.versionCdn}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FirebaseConfig.versionCdn}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FirebaseConfig.versionCdn}/firebase-firestore.js`),
  ]).then(([appModule, authModule, firestoreModule]) => {
    const app = appModule.initializeApp(window.firebaseConfig);
    firebaseAuth = authModule.getAuth(app);
    firebaseDb = firestoreModule.getFirestore(app);
    firebaseApi = {
      createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
      doc: firestoreModule.doc,
      getDoc: firestoreModule.getDoc,
      onAuthStateChanged: authModule.onAuthStateChanged,
      serverTimestamp: firestoreModule.serverTimestamp,
      setDoc: firestoreModule.setDoc,
      signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
      signOut: authModule.signOut,
    };
    firebaseApi.onAuthStateChanged(firebaseAuth, manejarCambioSesionFirebase);
    actualizarVistaCuentaFirebase();
    return true;
  }).catch((error) => {
    firebaseInicializacionPromesa = null;
    console.error("No se pudo inicializar Firebase", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorConDetalle("No se pudo inicializar Firebase.", error), true);
    return false;
  });

  return firebaseInicializacionPromesa;
}

async function manejarCambioSesionFirebase(usuario) {
  firebaseUsuario = usuario;
  actualizarVistaCuentaFirebase();

  if (!usuario) {
    firebaseDatosRemotosPendientes = null;
    firebaseResolucionDatosPendiente = false;
    actualizarVistaCuentaFirebase();
    return;
  }
  if (!firebaseDb || !firebaseApi.getDoc) return;

  firebaseCargandoDatosRemotos = true;
  try {
    const referencia = firebaseApi.doc(firebaseDb, FirebaseConfig.coleccionUsuarios, usuario.uid);
    const snapshot = await firebaseApi.getDoc(referencia);
    const datosRemotos = snapshot.exists() ? obtenerDatosImportados(snapshot.data()?.datos) : null;

    if (datosRemotos && datosImportadosTieneClavesReconocidas(datosRemotos)) {
      if (datosStorageSonIguales(datosRemotos, crearBackupLocalStorage().datos)) {
        actualizarVistaCuentaFirebase(`Sesión iniciada como ${usuario.email}. Datos sincronizados.`);
      } else {
        mostrarDecisionDatosFirebase(datosRemotos);
      }
    } else {
      await guardarDatosFirebase(true);
      actualizarVistaCuentaFirebase(`Sesión iniciada como ${usuario.email}. Datos locales guardados.`);
    }
  } catch (error) {
    console.error("No se pudieron sincronizar los datos de Firebase", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorConDetalle("No se pudieron sincronizar los datos de Firebase.", error), true);
  } finally {
    firebaseCargandoDatosRemotos = false;
  }
}

function abrirCuentaFirebase() {
  actualizarVistaCuentaFirebase();
  openPopup(idPopupCuentaFirebase);
  inicializarFirebase();
}

function obtenerEmailFirebase() {
  const email = document.getElementById(idFirebaseEmail).value.trim();

  if (!email) {
    actualizarVistaCuentaFirebase("Ingresá el email.", true);
    return "";
  }

  return email;
}

function obtenerCredencialesFirebase() {
  const email = obtenerEmailFirebase();
  const password = document.getElementById(idFirebasePassword).value;

  if (!email) return null;

  if (!password) {
    actualizarVistaCuentaFirebase("Ingresá la contraseña.", true);
    return null;
  }

  return { email, password };
}

async function iniciarSesionFirebase(event) {
  event?.preventDefault();
  const inicializado = await inicializarFirebase();
  if (!inicializado) return;

  const credenciales = obtenerCredencialesFirebase();
  if (!credenciales) return;

  try {
    await firebaseApi.signInWithEmailAndPassword(firebaseAuth, credenciales.email, credenciales.password);
  } catch (error) {
    console.error("No se pudo iniciar sesión", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorFirebase(error, "iniciar sesión"), true);
  }
}

async function crearCuentaFirebase() {
  const inicializado = await inicializarFirebase();
  if (!inicializado) return;

  const credenciales = obtenerCredencialesFirebase();
  if (!credenciales) return;

  try {
    await firebaseApi.createUserWithEmailAndPassword(firebaseAuth, credenciales.email, credenciales.password);
  } catch (error) {
    console.error("No se pudo crear la cuenta", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorFirebase(error, "crear la cuenta"), true);
  }
}

async function cerrarSesionFirebase() {
  const inicializado = await inicializarFirebase();
  if (!inicializado || !firebaseAuth) return;

  try {
    firebaseDatosRemotosPendientes = null;
    firebaseResolucionDatosPendiente = false;
    await firebaseApi.signOut(firebaseAuth);
    firebaseUsuario = null;
    actualizarVistaCuentaFirebase("Sesión cerrada.");
  } catch (error) {
    console.error("No se pudo cerrar sesión", error);
    actualizarVistaCuentaFirebase("No se pudo cerrar sesión.", true);
  }
}

async function usarDatosLocalesFirebase() {
  const datosRemotosPendientes = firebaseDatosRemotosPendientes;
  firebaseDatosRemotosPendientes = null;
  firebaseResolucionDatosPendiente = false;
  actualizarVistaCuentaFirebase(`Sesión iniciada como ${firebaseUsuario.email}. Guardando datos locales...`);

  try {
    await guardarDatosFirebase(true);
    actualizarVistaCuentaFirebase(`Sesión iniciada como ${firebaseUsuario.email}. Datos locales guardados.`);
  } catch (error) {
    firebaseDatosRemotosPendientes = datosRemotosPendientes;
    firebaseResolucionDatosPendiente = true;
    console.error("No se pudieron guardar los datos locales en Firebase", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorConDetalle("No se pudieron guardar los datos locales en Firebase.", error), true);
  }
}

async function usarDatosRemotosFirebase() {
  const datosRemotos = firebaseDatosRemotosPendientes;
  if (!datosRemotos) return;

  firebaseDatosRemotosPendientes = null;
  firebaseResolucionDatosPendiente = false;
  firebaseCargandoDatosRemotos = true;

  try {
    aplicarDatosImportadosEnLocalStorage(datosRemotos);
    await recargarEstadoDesdeStorage();
    actualizarVistaCuentaFirebase(`Sesión iniciada como ${firebaseUsuario.email}. Datos de la base cargados.`);
  } catch (error) {
    firebaseDatosRemotosPendientes = datosRemotos;
    firebaseResolucionDatosPendiente = true;
    console.error("No se pudieron cargar los datos de Firebase", error);
    actualizarVistaCuentaFirebase(obtenerMensajeErrorConDetalle("No se pudieron cargar los datos de la base.", error), true);
  } finally {
    firebaseCargandoDatosRemotos = false;
  }
}

async function guardarDatosFirebase(forzar = false) {
  if ((firebaseCargandoDatosRemotos || firebaseResolucionDatosPendiente) && !forzar) return;
  if (!firebaseUsuario || !firebaseDb || !firebaseApi.setDoc) return;

  const backup = crearBackupLocalStorage();
  if (localStorageBloqueado) {
    throw crearErrorLocalStorageBloqueado();
  }
  const referencia = firebaseApi.doc(firebaseDb, FirebaseConfig.coleccionUsuarios, firebaseUsuario.uid);
  await firebaseApi.setDoc(referencia, {
    aplicacion: backup.aplicacion,
    version: backup.version,
    datos: backup.datos,
    actualizadoEn: firebaseApi.serverTimestamp(),
  }, { merge: true });
  actualizarVistaCuentaFirebase(`Sesión iniciada como ${firebaseUsuario.email}. Datos sincronizados.`);
}

function programarGuardadoFirebase() {
  if (firebaseResolucionDatosPendiente) return;
  if (firebaseCargandoDatosRemotos || !firebaseUsuario || !firebaseDb || !firebaseApi.setDoc) return;

  clearTimeout(firebaseGuardadoProgramado);
  firebaseGuardadoProgramado = setTimeout(() => {
    guardarDatosFirebase().catch((error) => {
      console.error("No se pudieron guardar los datos en Firebase", error);
      actualizarVistaCuentaFirebase(obtenerMensajeErrorConDetalle("No se pudieron guardar los datos en Firebase.", error), true);
      mostrarMensajeUsuario("No se pudieron guardar los datos en Firebase.");
    });
  }, 600);
}

function copiarDatosAlClipboard() {
  const texto = JSON.stringify(crearBackupLocalStorage(), null, 2);
  copiarTextoAlClipboard(texto)
    .then(() => {
      closeNavIfMobile();
      mostrarMensajeUsuario("Datos copiados.");
    })
    .catch(() => {
      mostrarMensajeUsuario("No se pudieron copiar los datos.");
    });
}

function abrirImportarDatos() {
  document.getElementById(idTextareaImportarDatos).value = "";
  openPopup(idPopupImportarDatos);
}

function obtenerDatosImportados(jsonImportado) {
  if (!jsonImportado || typeof jsonImportado !== "object" || Array.isArray(jsonImportado)) {
    return null;
  }
  const datos = jsonImportado.datos ?? jsonImportado.localStorage ?? jsonImportado;
  return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : null;
}

function datosImportadosTieneClavesReconocidas(datosImportados) {
  const clavesRelevantes = obtenerClavesLocalStorageRelevantes();
  return clavesRelevantes.some((clave) => (
    Object.prototype.hasOwnProperty.call(datosImportados, clave)
  ));
}

function aplicarDatosImportadosEnLocalStorage(datosImportados) {
  let datosAplicados = true;
  obtenerClavesLocalStorageRelevantes().forEach((clave) => {
    if (Object.prototype.hasOwnProperty.call(datosImportados, clave)) {
      const valor = datosImportados[clave];
      if (valor === null) {
        datosAplicados = eliminarLocalStorage(clave) && datosAplicados;
      } else {
        datosAplicados = guardarLocalStorage(clave, typeof valor === "string" ? valor : JSON.stringify(valor)) && datosAplicados;
      }
    } else {
      datosAplicados = eliminarLocalStorage(clave) && datosAplicados;
    }
  });
  if (!datosAplicados) {
    throw new Error("No se pudo escribir en el almacenamiento local.");
  }
}

function ocultarPopupActual() {
  [
    idPopupMateria,
    idPopupRespuestas,
    idPopupAreas,
    idPopupListaMaterias,
    idPopupAjustarCreditos,
    idPopupImportarDatos,
    idPopupCuentaFirebase,
    idPopupReset
  ].forEach((idPopup) => {
    const popup = document.getElementById(idPopup);
    if (popup) popup.style.display = "none";
  });
  closePopup();
  popUpActual = idPopupMateria;
}

function reiniciarEstadoEnMemoria() {
  registros.splice(0, registros.length);
  creditosPorArea.clear();
  historialAprobadas = new Set();
  historialExoneradas = new Set();
  planificacionSemestres = [];
  planificacionExoneradasBase = new Set();
  planificacionUsaEstadoActual = true;
  seleccionOpcionales = true;
  seleccionMenu = false;
  seleccionSemestre = Semestre.AMBOS;
  seleccionNavbar = idBotonMaterias;
  vistaPlanificacionActiva = false;
  valorBarra = BarraPopup.Previas;
  filtroTextoMateria = "";
  filtroAreaMateria = "";

  document.getElementById(idCheckbox).checked = false;
  document.getElementById(idHam).classList.remove("abierto");
  document.getElementById("mi-toggle-MI").checked = false;
  document.getElementById("mi-toggle-plan").checked = false;
  document.getElementById("mi-toggle-opcionales").checked = true;
  document.getElementById(idInputBuscarMateria).value = "";
  document.getElementById(idSelectFiltrarArea).value = "";
  document.getElementById(idTextareaImportarDatos).value = "";
  document.getElementById(idBotonMaterias).classList.remove(claseResaltarBotonEnNav);
  document.getElementById(idBotonPlanificacion).classList.remove(claseResaltarBotonEnNav);
  document.getElementById(BarraPopup.Previas).classList.remove(claseResaltarBotonEnNav);
  document.getElementById(BarraPopup.PreviaDe).classList.remove(claseResaltarBotonEnNav);
  document.getElementById(BarraPopup.Informacion).classList.remove(claseResaltarBotonEnNav);
  document.getElementById(idSeccionInformacion).open = true;
  document.getElementById(idSeccionConfiguracion).open = true;
  document.getElementById(idSeccionFiltros).open = true;
}

async function recargarEstadoDesdeStorage() {
  ocultarPopupActual();
  reiniciarEstadoEnMemoria();
  await firstLoad();
}

async function cargarDatosDesdeJson() {
  const texto = document.getElementById(idTextareaImportarDatos).value.trim();
  if (!texto) {
    mostrarMensajeUsuario("Ingresá el JSON a cargar.");
    return;
  }

  let datosImportados;
  try {
    datosImportados = obtenerDatosImportados(JSON.parse(texto));
  } catch (error) {
    mostrarMensajeUsuario("El JSON ingresado no es válido.");
    return;
  }

  if (!datosImportados) {
    mostrarMensajeUsuario("El JSON ingresado no tiene el formato esperado.");
    return;
  }

  if (!datosImportadosTieneClavesReconocidas(datosImportados)) {
    mostrarMensajeUsuario("El JSON no contiene datos reconocidos para cargar.");
    return;
  }

  try {
    aplicarDatosImportadosEnLocalStorage(datosImportados);
    await recargarEstadoDesdeStorage();
    programarGuardadoFirebase();
    mostrarMensajeUsuario("Datos cargados.");
  } catch (error) {
    console.error("No se pudieron cargar los datos", error);
    mostrarMensajeUsuario("No se pudieron cargar los datos.");
  }
}

function esRegistroCreditoValido(registro) {
  return registro &&
    typeof registro.area === "string" &&
    Number.isFinite(registro.creditos);
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
      if (!materia) {
        auxHistorialExoneradas.delete(nombreMateria);
        huboCambio = true;
        return;
      }
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
    if (materia) sumarCreditos(materia);
  });
}

function calcularCreditosSinCreditosManuales() {
  resetCreditos();
  historialExoneradas.forEach((nombreMateria) => {
    let materia = encontrarMateriaPorNombre(nombreMateria);
    if (materia) sumarCreditos(materia);
  });
}

function reconstruirEstadoPagina() {
  reconstruyoEstadoValido();
  calcularCreditos();
  Materias.forEach((materia) => { establecerEstadoBotonMateria(materia); });
  actualizarCreditosTitulo();
  guardarLocalStorage(LocalStorageNombres.materiasExoneradas, JSON.stringify(Array.from(historialExoneradas.values())));
  guardarLocalStorage(LocalStorageNombres.materiasAprobadas, JSON.stringify(Array.from(historialAprobadas.values())));
  programarGuardadoFirebase();
}

function renderizarPlanificacionSiActiva() {
  if (vistaPlanificacionActiva) {
    renderizarPlanificacion();
  }
}

function borrarProgreso() {
  historialAprobadas.clear();
  historialExoneradas.clear();
  registros.splice(0, registros.length);
  creditosPorArea.clear();
  planificacionSemestres = [];
  planificacionExoneradasBase.clear();
  planificacionUsaEstadoActual = true;
  seleccionOpcionales = true;
  guardarPlanificacion();
  guardarLocalStorage(LocalStorageNombres.seleccionOpcionales, JSON.stringify(seleccionOpcionales));
  actualizarRegistros();
  reconstruirEstadoPagina();
  renderizarPlanificacionSiActiva();
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

function calcularCreditosMateria(materia) {
  return obtenerAportesMateria(materia).reduce((total, { creditos }) => total + creditos, 0);
}

function textoBotonMateria(materia) {
  let texto = `${materia.nombreCompleto} (${calcularCreditosMateria(materia)})`;
  if (materia.esOpcional) {
    texto += "*";
  }
  return texto;
}

function calcularCreditosMaterias(nombresMaterias) {
  return nombresMaterias.reduce((total, nombreMateria) => {
    const materia = encontrarMateriaPorNombre(nombreMateria);
    return materia ? total + calcularCreditosMateria(materia) : total;
  }, 0);
}

function calcularCreditosBasePlanificacion() {
  if (planificacionUsaEstadoActual) return creditosBloque.Total;
  return calcularCreditosMaterias(Array.from(planificacionExoneradasBase.values()));
}

function calcularCreditosPlanHastaSemestre(indiceSemestre) {
  let total = calcularCreditosBasePlanificacion();
  for (let i = 0; i <= indiceSemestre; i++) {
    const semestrePlanificado = planificacionSemestres[i];
    total += calcularCreditosMaterias(
      obtenerNombresExoneradasPlanificadas(semestrePlanificado?.materias ?? [], semestrePlanificado?.semestre)
    );
  }
  return total;
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

function guardarPlanificacion() {
  guardarLocalStorage(LocalStorageNombres.planificacionSemestres, JSON.stringify(planificacionSemestres));
  guardarLocalStorage(LocalStorageNombres.planificacionUsaEstadoActual, JSON.stringify(planificacionUsaEstadoActual));
  guardarLocalStorage(LocalStorageNombres.planificacionExoneradasBase, JSON.stringify(Array.from(planificacionExoneradasBase.values())));
  programarGuardadoFirebase();
}

function cargarPlanificacionDesdeStorage() {
  const planificacion = leerJsonLocalStorage(LocalStorageNombres.planificacionSemestres, []);
  const exoneradasBase = leerJsonLocalStorage(LocalStorageNombres.planificacionExoneradasBase, []);
  planificacionSemestres = Array.isArray(planificacion) ? planificacion : [];
  planificacionUsaEstadoActual = leerJsonLocalStorage(LocalStorageNombres.planificacionUsaEstadoActual, true) !== false;
  planificacionExoneradasBase = new Set(Array.isArray(exoneradasBase) ? exoneradasBase : []);
}

function esPeriodoExamenesPlanificado(periodo) {
  return periodo === PeriodoPlanificado.EXAMENES;
}

function normalizarSemestrePlanificado(semestre) {
  if (esPeriodoExamenesPlanificado(semestre)) return PeriodoPlanificado.EXAMENES;
  return semestre === Semestre.SEGUNDO ? Semestre.SEGUNDO : Semestre.PRIMERO;
}

function textoSemestrePlanificado(semestre) {
  if (esPeriodoExamenesPlanificado(semestre)) return "Período de exámenes";
  return semestre === Semestre.SEGUNDO ? "Semestre Par" : "Semestre Impar";
}

function tituloPeriodoPlanificado(semestre) {
  if (esPeriodoExamenesPlanificado(semestre)) return "Período de exámenes";
  return "Semestre";
}

function materiaSeDictaEnSemestrePlanificado(materia, semestre) {
  if (!materia || materia.se_da === false) return false;
  if (esPeriodoExamenesPlanificado(semestre)) return true;
  return materia.semestre === Semestre.AMBOS || materia.semestre === semestre;
}

function obtenerNombreMateriaPlanificada(materiaPlanificada) {
  return typeof materiaPlanificada === "string" ? materiaPlanificada : materiaPlanificada?.nombre;
}

function obtenerResultadoMateriaPlanificada(materiaPlanificada, semestre) {
  if (typeof materiaPlanificada === "string") return ResultadoPlanificado.EXONERADA;
  if (materiaPlanificada?.resultado === ResultadoPlanificado.EXONERADA) return ResultadoPlanificado.EXONERADA;
  if (esPeriodoExamenesPlanificado(semestre)) return ResultadoPlanificado.HABILITADA;
  return materiaPlanificada?.resultado === ResultadoPlanificado.CURSO
    ? ResultadoPlanificado.CURSO
    : ResultadoPlanificado.HABILITADA;
}

function crearMateriaPlanificada(nombreMateria, semestre, resultado = ResultadoPlanificado.HABILITADA) {
  return {
    nombre: nombreMateria,
    resultado: obtenerResultadoMateriaPlanificada({ resultado }, semestre)
  };
}

function normalizarMateriaPlanificada(materiaPlanificada, semestre) {
  const nombre = obtenerNombreMateriaPlanificada(materiaPlanificada);
  if (!nombre) return null;
  return crearMateriaPlanificada(nombre, semestre, obtenerResultadoMateriaPlanificada(materiaPlanificada, semestre));
}

function obtenerNombresMateriasPlanificadas(materias = []) {
  return materias.map(obtenerNombreMateriaPlanificada).filter(Boolean);
}

function obtenerNombresExoneradasPlanificadas(materias = [], semestre) {
  return materias
    .filter((materiaPlanificada) => obtenerResultadoMateriaPlanificada(materiaPlanificada, semestre) === ResultadoPlanificado.EXONERADA)
    .map(obtenerNombreMateriaPlanificada)
    .filter(Boolean);
}

function aplicarMateriaAlContextoPlanificacion(materiaPlanificada, semestre, aprobadas, exoneradas, yaConsideradas) {
  const nombreMateria = obtenerNombreMateriaPlanificada(materiaPlanificada);
  if (!nombreMateria) return;
  const resultado = obtenerResultadoMateriaPlanificada(materiaPlanificada, semestre);
  if (resultado === ResultadoPlanificado.CURSO || resultado === ResultadoPlanificado.EXONERADA) {
    aprobadas.add(nombreMateria);
  }
  if (resultado === ResultadoPlanificado.EXONERADA) {
    exoneradas.add(nombreMateria);
  }
  yaConsideradas?.add(nombreMateria);
}

function ejecutarConEstadoTemporal(aprobadas, exoneradas, incluirCreditosActuales, callback) {
  const historialAprobadasAnterior = historialAprobadas;
  const historialExoneradasAnterior = historialExoneradas;
  const creditosBloqueAnterior = { ...creditosBloque };
  historialAprobadas = new Set(aprobadas);
  historialExoneradas = new Set(exoneradas);
  if (incluirCreditosActuales) {
    calcularCreditos();
  } else {
    calcularCreditosSinCreditosManuales();
  }
  try {
    return callback();
  } finally {
    historialAprobadas = historialAprobadasAnterior;
    historialExoneradas = historialExoneradasAnterior;
    creditosBloque = creditosBloqueAnterior;
  }
}

function materiaHabilitadaParaPlan(materia, aprobadas, exoneradas, incluirCreditosActuales = true) {
  if (!materia) return false;
  return ejecutarConEstadoTemporal(aprobadas, exoneradas, incluirCreditosActuales, () => evaluarRegla(materia.reglaHabilitacion).cumple);
}

function materiaHabilitadaParaExamen(materia, aprobadas, exoneradas, incluirCreditosActuales = true) {
  if (!materia) return false;
  const tieneCurso = aprobadas.has(materia.nombre) || exoneradas.has(materia.nombre);
  if (!materia.esLibre && !tieneCurso) return false;
  return materiaHabilitadaParaPlan(materia, aprobadas, exoneradas, incluirCreditosActuales);
}

function obtenerAprobadasBasePlanificacion() {
  if (planificacionUsaEstadoActual) return new Set(historialAprobadas);
  return new Set(planificacionExoneradasBase);
}

function obtenerExoneradasBasePlanificacion() {
  if (planificacionUsaEstadoActual) return new Set(historialExoneradas);
  return new Set(planificacionExoneradasBase);
}

function normalizarExoneradasBasePlanificacion() {
  if (planificacionUsaEstadoActual) return;
  const pendientes = new Set(planificacionExoneradasBase);
  const aprobadas = new Set();
  const exoneradas = new Set();
  let huboCambio = true;

  while (huboCambio) {
    huboCambio = false;
    Array.from(pendientes.values()).forEach((nombreMateria) => {
      const materia = encontrarMateriaPorNombre(nombreMateria);
      if (!materia) {
        pendientes.delete(nombreMateria);
        huboCambio = true;
        return;
      }
      if (materiaHabilitadaParaPlan(materia, aprobadas, exoneradas, false)) {
        aprobadas.add(nombreMateria);
        exoneradas.add(nombreMateria);
        pendientes.delete(nombreMateria);
        huboCambio = true;
      }
    });
  }

  planificacionExoneradasBase = exoneradas;
}

function obtenerContextoPlanificacion(indiceSemestre) {
  const aprobadas = obtenerAprobadasBasePlanificacion();
  const exoneradas = obtenerExoneradasBasePlanificacion();
  exoneradas.forEach((nombreMateria) => aprobadas.add(nombreMateria));
  const yaConsideradas = new Set([...aprobadas, ...exoneradas]);

  for (let i = 0; i < indiceSemestre; i++) {
    const semestrePlanificado = planificacionSemestres[i];
    (semestrePlanificado?.materias ?? []).forEach((materiaPlanificada) => {
      aplicarMateriaAlContextoPlanificacion(materiaPlanificada, semestrePlanificado?.semestre, aprobadas, exoneradas, yaConsideradas);
    });
  }

  return { aprobadas, exoneradas, yaConsideradas };
}

function normalizarPlanificacion() {
  const planificacionNormalizada = [];
  const aprobadas = obtenerAprobadasBasePlanificacion();
  const exoneradas = obtenerExoneradasBasePlanificacion();
  exoneradas.forEach((nombreMateria) => aprobadas.add(nombreMateria));
  const yaConsideradas = new Set([...aprobadas, ...exoneradas]);
  const incluirCreditosActuales = planificacionUsaEstadoActual;

  planificacionSemestres.forEach((semestrePlanificado) => {
    const semestre = normalizarSemestrePlanificado(semestrePlanificado?.semestre);
    const materias = Array.isArray(semestrePlanificado?.materias) ? semestrePlanificado.materias : [];
    const materiasValidas = [];
    const nombresValidos = new Set();

    materias.forEach((materiaPlanificada) => {
      const materiaNormalizada = normalizarMateriaPlanificada(materiaPlanificada, semestre);
      const nombreMateria = materiaNormalizada?.nombre;
      const materia = encontrarMateriaPorNombre(nombreMateria);
      if (!materia || nombresValidos.has(nombreMateria)) {
        return;
      }
      const esExamen = esPeriodoExamenesPlanificado(semestre);
      const materiaValidaParaPeriodo = esExamen
        ? !exoneradas.has(nombreMateria) && materiaHabilitadaParaExamen(materia, aprobadas, exoneradas, incluirCreditosActuales)
        : !yaConsideradas.has(nombreMateria) && materiaHabilitadaParaPlan(materia, aprobadas, exoneradas, incluirCreditosActuales);
      if (!materiaValidaParaPeriodo) {
        return;
      }
      materiasValidas.push(materiaNormalizada);
      nombresValidos.add(nombreMateria);
    });

    materiasValidas.forEach((materiaPlanificada) => {
      aplicarMateriaAlContextoPlanificacion(materiaPlanificada, semestre, aprobadas, exoneradas, yaConsideradas);
    });

    planificacionNormalizada.push({
      semestre,
      materias: materiasValidas,
      abierto: semestrePlanificado?.abierto !== false,
      elegirMateriasAbierto: semestrePlanificado?.elegirMateriasAbierto === true,
      mostrarMateriasNoDictadas: semestrePlanificado?.mostrarMateriasNoDictadas === true,
      mostrarOpcionales: semestrePlanificado?.mostrarOpcionales !== false,
    });
  });

  planificacionSemestres = planificacionNormalizada;
}

function obtenerMateriasDisponiblesParaPlan(indiceSemestre) {
  const semestrePlanificado = planificacionSemestres[indiceSemestre];
  const seleccionadasActuales = new Set(obtenerNombresMateriasPlanificadas(semestrePlanificado?.materias ?? []));
  const { aprobadas, exoneradas, yaConsideradas } = obtenerContextoPlanificacion(indiceSemestre);
  const esExamen = esPeriodoExamenesPlanificado(semestrePlanificado?.semestre);
  const incluirCreditosActuales = planificacionUsaEstadoActual;

  return Materias.filter((materia) => (
    !seleccionadasActuales.has(materia.nombre) &&
    (
      esExamen
        ? !exoneradas.has(materia.nombre) && materiaHabilitadaParaExamen(materia, aprobadas, exoneradas, incluirCreditosActuales)
        : !yaConsideradas.has(materia.nombre) && materiaHabilitadaParaPlan(materia, aprobadas, exoneradas, incluirCreditosActuales)
    )
  )).sort((materia1, materia2) => materia1.nombreCompleto.localeCompare(materia2.nombreCompleto));
}

function crearBotonPlanificador(texto, color, onClick, ariaLabel = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("boton-planificador");
  button.textContent = texto;
  button.style.background = color;
  button.onclick = onClick;
  if (ariaLabel) {
    button.setAttribute("aria-label", ariaLabel);
  }
  return button;
}

function cambiarUsoEstadoActualPlanificacion(usarEstadoActual) {
  planificacionUsaEstadoActual = usarEstadoActual;
  renderizarPlanificacion();
}

function renderizarToggleEstadoPlanificador() {
  const container = document.createElement("div");
  container.classList.add("planificador-bloque", "container-item-config", "planificador-toggle-estado");

  const label = document.createElement("label");
  label.htmlFor = "toggle-estado-actual-planificador";
  label.textContent = "Usar estado actual";

  const switchLabel = document.createElement("label");
  switchLabel.classList.add("switch");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = "toggle-estado-actual-planificador";
  input.classList.add("switch-input");
  input.checked = planificacionUsaEstadoActual;
  input.onchange = () => cambiarUsoEstadoActualPlanificacion(input.checked);

  const slider = document.createElement("span");
  slider.classList.add("switch-slider");
  slider.setAttribute("aria-hidden", "true");

  switchLabel.append(input);
  switchLabel.append(slider);
  container.append(label);
  container.append(switchLabel);

  return container;
}

function renderizarToggleMateriasNoDictadasPlanificador(indiceSemestre, mostrarMateriasNoDictadas) {
  const container = document.createElement("div");
  container.classList.add("container-item-config", "planificador-toggle-no-dictadas");

  const idToggle = `toggle-no-dictadas-planificador-${indiceSemestre}`;
  const label = document.createElement("label");
  label.htmlFor = idToggle;
  label.textContent = "Mostrar materias fuera del período o sin inscripción";

  const switchLabel = document.createElement("label");
  switchLabel.classList.add("switch");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = idToggle;
  input.classList.add("switch-input");
  input.checked = mostrarMateriasNoDictadas;
  input.onchange = () => {
    if (planificacionSemestres[indiceSemestre]) {
      planificacionSemestres[indiceSemestre].mostrarMateriasNoDictadas = input.checked;
      renderizarPlanificacion();
    }
  };

  const slider = document.createElement("span");
  slider.classList.add("switch-slider");
  slider.setAttribute("aria-hidden", "true");

  switchLabel.append(input);
  switchLabel.append(slider);
  container.append(label);
  container.append(switchLabel);

  return container;
}

function renderizarToggleOpcionalesPlanificador(indiceSemestre, mostrarOpcionales) {
  const container = document.createElement("div");
  container.classList.add("container-item-config", "planificador-toggle-opcionales");

  const idToggle = `toggle-opcionales-planificador-${indiceSemestre}`;
  const label = document.createElement("label");
  label.htmlFor = idToggle;
  label.textContent = "Mostrar opcionales";

  const switchLabel = document.createElement("label");
  switchLabel.classList.add("switch");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = idToggle;
  input.classList.add("switch-input");
  input.checked = mostrarOpcionales;
  input.onchange = () => {
    if (planificacionSemestres[indiceSemestre]) {
      planificacionSemestres[indiceSemestre].mostrarOpcionales = input.checked;
      renderizarPlanificacion();
    }
  };

  const slider = document.createElement("span");
  slider.classList.add("switch-slider");
  slider.setAttribute("aria-hidden", "true");

  switchLabel.append(input);
  switchLabel.append(slider);
  container.append(label);
  container.append(switchLabel);

  return container;
}

function renderizarExoneradasPlanificador() {
  const detalles = document.createElement("details");
  detalles.classList.add("planificador-bloque");
  const aprobadasBase = obtenerAprobadasBasePlanificacion();
  const exoneradasBase = obtenerExoneradasBasePlanificacion();
  const incluirCreditosActuales = planificacionUsaEstadoActual;

  const resumen = document.createElement("summary");
  resumen.textContent = `Materias exoneradas (${exoneradasBase.size})`;
  detalles.append(resumen);

  const lista = document.createElement("div");
  lista.classList.add("planificador-lista-botones");

  Materias.forEach((materia) => {
    const estaExonerada = exoneradasBase.has(materia.nombre);
    const estaAprobada = aprobadasBase.has(materia.nombre);
    const habilitada = estaAprobada || materiaHabilitadaParaPlan(materia, aprobadasBase, exoneradasBase, incluirCreditosActuales);
    const color = estaExonerada ? colorExonerada : (estaAprobada ? colorAprobada : (habilitada ? colorHabilitada : colorDeshabilitada));
    const button = crearBotonPlanificador(textoBotonMateria(materia), color, () => toggleExoneradaPlanificador(materia.nombre));
    button.disabled = !habilitada && !estaExonerada && !estaAprobada;
    lista.append(button);
  });

  detalles.append(lista);
  return detalles;
}

function crearSelectorSemestrePlanificado(indiceSemestre, semestreActual) {
  const select = document.createElement("select");
  select.classList.add("selector-planificador");
  select.setAttribute("aria-label", "Tipo de período planificado");

  [Semestre.PRIMERO, Semestre.SEGUNDO, PeriodoPlanificado.EXAMENES].forEach((semestre) => {
    const option = document.createElement("option");
    option.value = semestre;
    option.textContent = textoSemestrePlanificado(semestre);
    option.selected = semestre === semestreActual;
    select.append(option);
  });

  select.onchange = () => cambiarSemestrePlanificado(indiceSemestre, select.value);
  return select;
}

function obtenerColorResultadoPlanificado(resultado) {
  if (resultado === ResultadoPlanificado.CURSO) return colorAprobada;
  if (resultado === ResultadoPlanificado.EXONERADA) return colorExonerada;
  return colorHabilitada;
}

function obtenerSiguienteResultadoPlanificado(resultado, semestre) {
  if (esPeriodoExamenesPlanificado(semestre)) {
    return resultado === ResultadoPlanificado.EXONERADA
      ? ResultadoPlanificado.HABILITADA
      : ResultadoPlanificado.EXONERADA;
  }

  if (resultado === ResultadoPlanificado.HABILITADA) return ResultadoPlanificado.CURSO;
  if (resultado === ResultadoPlanificado.CURSO) return ResultadoPlanificado.EXONERADA;
  return ResultadoPlanificado.HABILITADA;
}

function renderizarSemestrePlanificado(semestrePlanificado, indiceSemestre) {
  const container = document.createElement("details");
  container.classList.add("planificador-semestre");
  container.open = semestrePlanificado.abierto !== false;
  container.ontoggle = () => {
    if (planificacionSemestres[indiceSemestre]) {
      planificacionSemestres[indiceSemestre].abierto = container.open;
      guardarPlanificacion();
    }
  };

  const summary = document.createElement("summary");
  summary.classList.add("planificador-summary");
  const materiasPlanificadas = Array.isArray(semestrePlanificado.materias) ? semestrePlanificado.materias : [];
  const cantidadMaterias = materiasPlanificadas.length;
  const cantidadCreditos = calcularCreditosMaterias(obtenerNombresExoneradasPlanificadas(materiasPlanificadas, semestrePlanificado.semestre));
  const totalCreditos = calcularCreditosPlanHastaSemestre(indiceSemestre);
  summary.textContent = `${tituloPeriodoPlanificado(semestrePlanificado.semestre)} (${cantidadMaterias} materias, ${cantidadCreditos} créditos, total ${totalCreditos})`;
  container.append(summary);

  const encabezado = document.createElement("div");
  encabezado.classList.add("planificador-encabezado");

  const botonEliminar = crearBotonPlanificador("Eliminar", colorDeshabilitada, () => eliminarSemestrePlanificado(indiceSemestre));
  encabezado.append(crearSelectorSemestrePlanificado(indiceSemestre, semestrePlanificado.semestre));
  if (indiceSemestre === 0 && planificacionUsaEstadoActual) {
    encabezado.append(crearBotonPlanificador("Aplicar al estado actual", colorAprobada, aplicarPrimerPeriodoPlanificadoAlEstadoActual));
  }
  encabezado.append(renderizarToggleOpcionalesPlanificador(
    indiceSemestre,
    semestrePlanificado.mostrarOpcionales !== false
  ));
  encabezado.append(renderizarToggleMateriasNoDictadasPlanificador(
    indiceSemestre,
    semestrePlanificado.mostrarMateriasNoDictadas === true
  ));
  encabezado.append(botonEliminar);
  container.append(encabezado);

  container.append(crearLineaAreaSubrayada("Seleccionadas"));
  const seleccionadas = document.createElement("div");
  seleccionadas.classList.add("planificador-lista-botones");
  if (materiasPlanificadas.length === 0) {
    seleccionadas.append(crearLinea("Sin materias seleccionadas."));
  } else {
    materiasPlanificadas.forEach((materiaPlanificada) => {
      const nombreMateria = obtenerNombreMateriaPlanificada(materiaPlanificada);
      const materia = encontrarMateriaPorNombre(nombreMateria);
      if (!materia) return;
      const resultado = obtenerResultadoMateriaPlanificada(materiaPlanificada, semestrePlanificado.semestre);
      const seDicta = materiaSeDictaEnSemestrePlanificado(materia, semestrePlanificado.semestre);
      const textoMateria = textoBotonMateria(materia);
      const color = obtenerColorResultadoPlanificado(resultado);
      const fila = document.createElement("div");
      fila.classList.add("planificador-materia-seleccionada");
      const button = crearBotonPlanificador(textoMateria, color, () => avanzarResultadoMateriaPlanificada(indiceSemestre, nombreMateria));
      const textoEliminar = `Eliminar ${materia.nombreCompleto} de la planificación`;
      const botonEliminar = crearBotonPlanificador("X", colorDeshabilitada, () => quitarMateriaPlanificada(indiceSemestre, nombreMateria), textoEliminar);
      botonEliminar.classList.add("boton-planificador-eliminar");
      botonEliminar.title = textoEliminar;
      if (!seDicta) {
        button.classList.add("materia-fuera-semestre");
        button.title = "Fuera del período seleccionado o sin inscripción en Bedelías.";
      }
      fila.append(button);
      fila.append(botonEliminar);
      seleccionadas.append(fila);
    });
  }
  container.append(seleccionadas);

  const elegirMaterias = document.createElement("details");
  elegirMaterias.classList.add("planificador-elegir-materias");
  elegirMaterias.open = semestrePlanificado.elegirMateriasAbierto === true;
  elegirMaterias.ontoggle = (event) => {
    event.stopPropagation();
    if (planificacionSemestres[indiceSemestre]) {
      planificacionSemestres[indiceSemestre].elegirMateriasAbierto = elegirMaterias.open;
      guardarPlanificacion();
    }
  };

  const resumenElegirMaterias = document.createElement("summary");
  resumenElegirMaterias.classList.add("planificador-summary");
  resumenElegirMaterias.textContent = "Elegir materias";
  elegirMaterias.append(resumenElegirMaterias);

  const listaElegirMaterias = document.createElement("div");
  listaElegirMaterias.classList.add("planificador-lista-botones");
  const mostrarMateriasNoDictadas = semestrePlanificado.mostrarMateriasNoDictadas === true;
  const mostrarOpcionales = semestrePlanificado.mostrarOpcionales !== false;
  const materiasDisponibles = obtenerMateriasDisponiblesParaPlan(indiceSemestre).filter((materia) => (
    (mostrarOpcionales || !materia.esOpcional) &&
    (mostrarMateriasNoDictadas || materiaSeDictaEnSemestrePlanificado(materia, semestrePlanificado.semestre))
  ));
  if (materiasDisponibles.length === 0) {
    listaElegirMaterias.append(crearLinea("No hay materias habilitadas para agregar."));
  } else {
    materiasDisponibles.forEach((materia) => {
      const seDicta = materiaSeDictaEnSemestrePlanificado(materia, semestrePlanificado.semestre);
      const textoMateria = textoBotonMateria(materia);
      const button = crearBotonPlanificador(
        textoMateria,
        colorHabilitada,
        () => agregarMateriaPlanificada(indiceSemestre, materia.nombre),
        `Agregar ${textoMateria} a la planificación`
      );
      if (!seDicta) {
        button.classList.add("materia-fuera-semestre");
        button.title = "Fuera del período seleccionado o sin inscripción en Bedelías.";
      }
      listaElegirMaterias.append(button);
    });
  }
  elegirMaterias.append(listaElegirMaterias);
  container.append(elegirMaterias);

  return container;
}

function renderizarPlanificacion() {
  normalizarExoneradasBasePlanificacion();
  normalizarPlanificacion();
  guardarPlanificacion();

  const contenedor = document.getElementById(idVistaPlanificacion);
  contenedor.innerHTML = "";

  const titulo = document.createElement("div");
  titulo.classList.add("titulo-popup");
  titulo.textContent = "Planificación de semestres";
  contenedor.append(titulo);
  contenedor.append(renderizarToggleEstadoPlanificador());
  contenedor.append(renderizarExoneradasPlanificador());

  const botonAgregarSemestre = crearBotonPlanificador("Agregar período", "lightgray", agregarSemestrePlanificado);
  contenedor.append(botonAgregarSemestre);

  const contenedorSemestres = document.createElement("div");
  contenedorSemestres.classList.add("planificador-bloque");
  if (planificacionSemestres.length === 0) {
    contenedorSemestres.append(crearLinea("No hay semestres planificados."));
  } else {
    planificacionSemestres.forEach((semestrePlanificado, indiceSemestre) => {
      contenedorSemestres.append(renderizarSemestrePlanificado(semestrePlanificado, indiceSemestre));
    });
  }
  contenedor.append(contenedorSemestres);
}

function verPlanificacion() {
  cambiarClaseActivaEnNav(idBotonPlanificacion);
  mostrarVistaPlanificacion(true);
  renderizarPlanificacion();
  guardarLocalStorage(LocalStorageNombres.vistaSeleccionada, idBotonPlanificacion);
  programarGuardadoFirebase();
  closeNavIfMobile();
}

function agregarSemestrePlanificado() {
  const ultimoSemestre = planificacionSemestres[planificacionSemestres.length - 1]?.semestre;
  const proximoSemestre = ultimoSemestre === Semestre.PRIMERO ? Semestre.SEGUNDO : Semestre.PRIMERO;
  planificacionSemestres.push({ semestre: proximoSemestre, materias: [], abierto: true, mostrarOpcionales: true });
  renderizarPlanificacion();
}

function eliminarSemestrePlanificado(indiceSemestre) {
  planificacionSemestres.splice(indiceSemestre, 1);
  renderizarPlanificacion();
}

function aplicarPrimerPeriodoPlanificadoAlEstadoActual() {
  const primerPeriodo = planificacionSemestres[0];
  if (!primerPeriodo) return;

  (primerPeriodo.materias ?? []).forEach((materiaPlanificada) => {
    const nombreMateria = obtenerNombreMateriaPlanificada(materiaPlanificada);
    const resultado = obtenerResultadoMateriaPlanificada(materiaPlanificada, primerPeriodo.semestre);
    if (!nombreMateria || resultado === ResultadoPlanificado.HABILITADA) return;

    historialAprobadas.add(nombreMateria);
    if (resultado === ResultadoPlanificado.EXONERADA) {
      historialExoneradas.add(nombreMateria);
    }
  });

  planificacionSemestres.shift();
  reconstruirEstadoPagina();
  renderizarPlanificacion();
}

function cambiarSemestrePlanificado(indiceSemestre, semestre) {
  planificacionSemestres[indiceSemestre].semestre = normalizarSemestrePlanificado(semestre);
  renderizarPlanificacion();
}

function avanzarResultadoMateriaPlanificada(indiceSemestre, nombreMateria) {
  const semestrePlanificado = planificacionSemestres[indiceSemestre];
  if (!semestrePlanificado) return;

  semestrePlanificado.materias = semestrePlanificado.materias.map((materiaPlanificada) => (
    obtenerNombreMateriaPlanificada(materiaPlanificada) === nombreMateria
      ? crearMateriaPlanificada(
        nombreMateria,
        semestrePlanificado.semestre,
        obtenerSiguienteResultadoPlanificado(
          obtenerResultadoMateriaPlanificada(materiaPlanificada, semestrePlanificado.semestre),
          semestrePlanificado.semestre
        )
      )
      : materiaPlanificada
  ));
  renderizarPlanificacion();
}

function agregarMateriaPlanificada(indiceSemestre, nombreMateria) {
  const semestre = planificacionSemestres[indiceSemestre]?.semestre;
  planificacionSemestres[indiceSemestre].materias.push(crearMateriaPlanificada(nombreMateria, semestre));
  renderizarPlanificacion();
}

function quitarMateriaPlanificada(indiceSemestre, nombreMateria) {
  planificacionSemestres[indiceSemestre].materias = planificacionSemestres[indiceSemestre].materias.filter((materia) => (
    obtenerNombreMateriaPlanificada(materia) !== nombreMateria
  ));
  renderizarPlanificacion();
}

function toggleExoneradaPlanificador(nombreMateria) {
  if (!planificacionUsaEstadoActual) {
    if (planificacionExoneradasBase.has(nombreMateria)) {
      planificacionExoneradasBase.delete(nombreMateria);
    } else {
      planificacionExoneradasBase.add(nombreMateria);
    }
    renderizarPlanificacion();
    return;
  }

  if (historialExoneradas.has(nombreMateria)) {
    historialExoneradas.delete(nombreMateria);
    historialAprobadas.delete(nombreMateria);
  } else {
    historialAprobadas.add(nombreMateria);
    historialExoneradas.add(nombreMateria);
  }
  reconstruirEstadoPagina();
  renderizarPlanificacion();
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
  elementoPrincipal.append(crearLineaNegrita("Básico-Tec, Técnicas e Int.", `: ${totBT} (${220})`));
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
  AGI.peso = 3;
  Pasan.peso = 4;
  TRE.peso = 2
  Materias.forEach((materia) => {
    if (materia.peso === 0) asignarPesoMateria(materia);
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
    button.textContent = textoBotonMateria(materia);
    button.id = materia.nombre;

    if (!materia.se_da) {
      const menuIcon = document.createElement("img");
      menuIcon.width = 15;
      menuIcon.height = 15;
      menuIcon.src = "icons/ex-resized.webp";
      menuIcon.alt = "No aparece inscripción en Bedelías";
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
}, true);

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
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.classList.add("boton-eliminar-registro");
    botonEliminar.setAttribute("aria-label", `Eliminar ajuste de ${creditos} créditos en ${TraduccionBloqueCreditos[area]}`);
    botonEliminar.onclick = () => {
      registros.splice(index, 1);
      creditosPorArea.set(area, (creditosPorArea.get(area) ?? 0) - creditos);
      actualizarRegistros();
      reconstruirEstadoPagina();
      renderizarPlanificacionSiActiva();
    }
    const iconoBasura = document.createElement("img");
    iconoBasura.width = 15;
    iconoBasura.height = 15;
    iconoBasura.src = "icons/basura-resized.webp";
    iconoBasura.alt = "Eliminar registro";
    iconoBasura.className = "icono-basura";
    botonEliminar.append(iconoBasura);
    divEliminar.append(botonEliminar);
    columnaArea.appendChild(divArea);
    columnaCreditos.appendChild(divCreditos);
    columnaFecha.appendChild(divEliminar);
  }
  guardarLocalStorage("registros", JSON.stringify(registros));
  guardarLocalStorage("creditosPorArea", JSON.stringify(Array.from(creditosPorArea.entries())));
  programarGuardadoFirebase();
}

function eventoAjustarCreditos() {
  const area = document.getElementById("select-agregar-creditos").value;
  const creditos = Number(document.getElementById("input-agregar-creditos").value);
  if (creditos!=0) {
    if (!Number.isInteger(creditos)) {
      mostrarMensajeUsuario("Créditos debe ser un entero.");
      return;
    }
    creditosPorArea.set(area, (creditosPorArea.get(area) ?? 0) + creditos);
    registros.push({ area, creditos });
    actualizarRegistros();
    reconstruirEstadoPagina();
    renderizarPlanificacionSiActiva();
  }  
}

// Inicio de pagina

function mostrarSeccionesQueCorrespondan() {
  if (vistaPlanificacionActiva) return;
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
  if (vistaPlanificacionActiva) {
    mostrarVistaPlanificacion(true);
  } else {
    mostrarSeccionesQueCorrespondan();
  }
}

async function firstLoad() {
  await cargarMateriasDesdeJson();
  cargarOpcionesFiltroAreas();
  cargarPlanificacionDesdeStorage();
  const materiasExoneradasGuardadas = leerJsonLocalStorage(LocalStorageNombres.materiasExoneradas, []);
  const materiasAprobadasGuardadas = leerJsonLocalStorage(LocalStorageNombres.materiasAprobadas, []);
  seleccionOpcionales = leerJsonLocalStorage(LocalStorageNombres.seleccionOpcionales, true) !== false;
  document.getElementById("mi-toggle-opcionales").checked = seleccionOpcionales;
  historialExoneradas = new Set(Array.isArray(materiasExoneradasGuardadas) ? materiasExoneradasGuardadas : []);
  historialAprobadas = new Set(Array.isArray(materiasAprobadasGuardadas) ? materiasAprobadasGuardadas : []);
  if (leerLocalStorage(MI.nombre) == "true") {
    document.getElementById("mi-toggle-MI").checked = true;
    if (Materias.includes(MI)) {
      Materias = Materias.filter(materia => materia !== MI)
      CDIV.reglaHabilitacion = null;
    } else {
      Materias.push(MI)
      CDIV.reglaHabilitacion = materiaExonerada(MI);
    }
  }
  if (leerLocalStorage(FC.nombre) == "true") {
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
  const registrosGuardados = leerJsonLocalStorage("registros", []);
  const creditosPorAreaGuardados = leerJsonLocalStorage("creditosPorArea", []);
  const registrosValidos = Array.isArray(registrosGuardados) ? registrosGuardados.filter(esRegistroCreditoValido) : [];
  registros.splice(0, registros.length, ...registrosValidos);
  creditosPorArea.clear();
  if (Array.isArray(creditosPorAreaGuardados)) {
    creditosPorAreaGuardados.forEach((entrada) => {
      if (Array.isArray(entrada) && typeof entrada[0] === "string" && Number.isFinite(entrada[1])) {
        creditosPorArea.set(entrada[0], entrada[1]);
      }
    });
  }
  rehacerPaginaSinEstado();
  reconstruirEstadoPagina();
  normalizarPlanificacion();
  guardarPlanificacion();
  const semestreGuardado = leerLocalStorage(LocalStorageNombres.semestre);
  const vistaGuardadaRaw = leerLocalStorage(LocalStorageNombres.vistaSeleccionada);
  const semestreDesdeVistaAnterior = Object.values(Semestre).includes(vistaGuardadaRaw) ? vistaGuardadaRaw : null;
  seleccionarSemestre(semestreGuardado ?? semestreDesdeVistaAnterior ?? Semestre.AMBOS);
  if (vistaGuardadaRaw === idBotonPlanificacion) {
    verPlanificacion();
  } else {
    verMaterias();
  }
  checkWidth();
  inicializarFirebase();
}

firstLoad().catch((error) => {
  console.error("No se pudo cargar materias.json", error);
});

