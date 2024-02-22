//comentar y revisar codigo

class Materia {

    constructor(nombre, creditos, previas, nombreCompleto, semestre, opcional, libre){
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
    }

}

const CDIV = new Materia("CDIV", 13, [] , 'Cálculo DIV', 'ambos', 'no', 'si');
const CDIVV = new Materia("CDIVV", 13, [CDIV.curso],'Cálculo DIVV', 'ambos', 'no', 'si');
const MD1 = new Materia("MD1", 9, [], 'Matemática Discreta 1', 'ambos', 'no', 'si');
const P1 = new Materia("P1", 10, [], 'Programación 1', 'ambos', 'no', 'no');
const GAL1 = new Materia("GAL1", 9, [], 'Geometría y Álgebra Lineal 1', 'ambos', 'no', 'si')
const P2 = new Materia("P2", 12, [P1.curso], 'Programación 2', 'primero', 'no', 'no');
const Ec = new Materia("Ec", 7, [], 'Economía', 'segundo', 'si', 'no')
const F1 = new Materia("F1", 10, [], 'Física 1', 'ambos', 'si', 'si')
const GAL2 = new Materia("GAL2", 9, [GAL1.curso], 'Geometría y Álgebra Lineal 2', 'ambos', 'no', 'si')
const PYE = new Materia("PYE", 10, [CDIVV.curso, GAL1, CDIV], 'Probabilidad y Estadistica', 'ambos', 'no', 'si')
const MD2 = new Materia("MD2", 9, [MD1.curso, GAL1.curso], 'Matemática Discreta 2', 'ambos', 'no', 'si') 
const LG = new Materia("LG", 12, [MD1.curso], 'Lógica', 'primero', 'no', 'no') 
const MN = new Materia("MN", 8, [CDIVV, P1, GAL2, GAL1, CDIV], 'Métodos Numéricos', 'segundo', 'no', 'no') 
const P4 = new Materia("P4", 15, [GAL1, CDIV, MD1, P2], 'Programación 4', 'primero', 'no', 'no') 
const IIO = new Materia("IIO", 10, [GAL2, PYE, CDIVV, CDIV, GAL1], 'Int. a la Investigación de Operaciones', 'primero', 'no', 'no') 
const P3 = new Materia("P3", 15, [P2.curso, PYE.curso, P1, MD1], 'Programación 3', 'segundo', 'no', 'no') 
const AC = new Materia("AC", 12, [CDIV, LG.curso, P2.curso, P1, MD1], 'Arquitectura de Computadoras', 'segundo', 'no', 'no') 
const CV = new Materia("CV", 10, [CDIVV.curso, GAL1, CDIV], 'Cálculo Vectorial', 'ambos', 'si', 'si') 
const ED = new Materia("ED", 10, [GAL2,CDIVV.curso, GAL1, CDIV], 'Int. a las Ec. Diferenciales', 'segundo', 'si', 'si') 
const TL = new Materia("TL", 12, [P3.curso, CDIV, GAL1, LG, MD1], 'Teoría de Lenguajes', 'primero', 'no', 'no') 
const FVC = new Materia("FVC", 5, [CV.curso, CDIVV], 'Funciones de Variable Compleja', 'primero', 'si', 'si') 
const SO = new Materia("SO", 12, [AC.curso, GAL1, CDIV, P2, MD1], 'Sistemas Operativos', 'primero', 'no', 'no')
const FO = new Materia("FO", 6, [IIO], 'Fundamentos de Optimización', 'primero', 'si', 'no')
const OCA = new Materia("OCA", 10, [IIO], 'Optimización Continua y Aplicaciones', 'segundo', 'si', 'no') 
const FBD = new Materia("FBD", 15, [LG, P3, MD2], 'Fundamentos de Bases de Datos', 'segundo', 'no', 'no') 
const RC = new Materia("RC", 12, [P3, SO.curso, CDIV, AC.curso] , 'Redes de Computadoras', 'segundo', 'no', 'no')
const TP = new Materia("TP", 15, [P4], 'Taller de Programación', 'segundo', 'no', 'no') //Hay otra forma de poder cursar TP, P4.curso + P3 | Tengo que revisar como mostrarlo
const IIS = new Materia("IIS", 10, [TP.curso, FBD.curso, P4.curso], 'Int. a la Ingeniería de Software', 'primero', 'no', 'no') 
const IPF = new Materia("IPF", 7, [TL, P2, LG, MD1], 'Int. a la Programación Funcional', 'primero', 'no', 'no') // No aparecio en inscripcion del primer semestre
const PL = new Materia("PL", 10, [TL, P3, MD2, LG], 'Programación Lógica', 'primero', 'no', 'no') 
const PIS = new Materia("PIS", 15, [IIS.curso, P4], 'Proyecto de Ingeniería de Software', 'segundo', 'no', 'no') 
const AA = new Materia("AA", 12, [LG, PYE, P3.curso, FBD.curso, P4, MD2], 'Aprendizaje Automático', 'primero', 'si', 'no') // No aparecio en inscripcion del primer semestre
const AE = new Materia("AE", 10, [P4, PYE, IIO], 'Algoritmos Evolutivos', 'segundo', 'si', 'no') 
const ICG = new Materia("ICG", 10, [P3, P4, GAL2.curso, GAL1], 'Int. a la Computación Gráfica', 'primero', 'si', 'no') 
const CGA = new Materia("CGA", 12, [ICG.curso], 'Computación Gráfica Avanzada', 'segundo', 'si', 'no') 
const CG = new Materia("CG", 10, [MD2, P3, MD1], 'Criptografía', 'primero', 'si', 'no') // No aparecio en inscripcion del primer semestre
const FSI = new Materia("FSI", 12, [SO, FBD, P3, LG, RC], 'Fundamentos de la Seguridad Informática', 'primero', 'si', 'no') 
const Aux = new Materia("Aux", 4, []);
const MI = new Materia("MI", 4, [Aux], 'Matemática Inicial', 'ambos', 'no', 'no');
const CTS = new Materia("CTS", 8, [], 'Ciencia, Tecnología y Sociedad', 'primero', 'si', 'no');
const TRE = new Materia("TRE", 6, [P1], 'Taller de Robótica Educativa', 'primero', 'si', 'no');
const F2 = new Materia("F2", 10, [F1.curso, CDIV.curso], 'Física 2', 'ambos', 'si', 'no');

//Revisar todos otra vez

let Materias = [MI, CDIV, CDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS, AA, AE, ICG, CGA, CG, FSI, CTS, TRE, F2];

let MateriasPersona = [];
let creditos = 0;
let materias = 0;
let opcionales = true;
let seleccion = false;
let semestreAct = "ambos";

function reset(){
    MateriasPersona = [];
    actualizar();
}

function toggleOpcionales(){
    if (opcionales){
        opcionales = false;
        actualizar();
    }else{
        opcionales = true;
        actualizar();
    }
}

function toggleMateria(nombre){

    let materiaActual = Materias.find( nombreAux => nombreAux.nombre == nombre );
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

function indicarPrevias(nombre){

    let materiaAct = Materias.find( materia => materia.nombre == nombre )

    let Exonerar = [];
    let Salvar = [];
    let SalvarFinal = [];
    
    materiaAct.previas.filter( (materia)=>{ 

        if (typeof(materia)=="string"){
            if (!MateriasPersona.find( elemento => elemento == materia)){
                let materiaAux = Materias.find( elemento => elemento.curso == materia );
                Salvar.push(materiaAux);
            }
        }else{
            if (!MateriasPersona.find( elemento => elemento == materia.nombre)){
                Exonerar.push(materia);
            }
            if (!MateriasPersona.find(elemento => elemento == materia.curso)){
                Salvar.push(materia);
            }
        }

        
    } )

    let texto = `Para poder cursar ${materiaAct.nombreCompleto} se necesita:<br/><br/>`;

    if (Exonerar.length>0){
        texto += `<u>Exonerar</u>:<br/><br/>`
    }
    Exonerar.forEach( (materia)=>{
        texto += `-${materia.nombreCompleto}<br/>`
    } )

    

   
    Salvar.forEach( (materia)=>{
        if (!Exonerar.find(elemento => elemento == materia)){
            SalvarFinal.push(materia);
        }
    } )
    if (SalvarFinal.length>0){
        if (Exonerar.length>0){
            texto += `<br/>`
        }
        texto += `<u>Salvar curso de</u>:<br/><br/>`
    }
    SalvarFinal.forEach( (materia)=>{
        if (!Exonerar.find(elemento => elemento == materia)){
            texto += `-${materia.nombreCompleto}<br/>`
        }
    } )

    document.getElementById('popup-text').innerHTML = texto;
    openPopup();

}

function actualizar(){

    creditos = 0;
    materias = 0;

    Materias.forEach( (materia) => {

        if (opcionales == true){

                switch (semestreAct) {
                    case "primero":
                        if (materia.semestre == "primero" || materia.semestre == "ambos"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;
        
                    case "segundo":
                        if (materia.semestre == "segundo" || materia.semestre == "ambos"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;
                    case "libre":
                        if (materia.libre == "si"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;

                    default:
                        document.getElementById(materia.nombre).style.display = "block";
                        break;
                }

        }else{
            if (materia.opcional == "no"){
                switch (semestreAct) {
                    case "primero":
                        if (materia.semestre == "primero" || materia.semestre == "ambos"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;
        
                    case "segundo":
                        if (materia.semestre == "segundo" || materia.semestre == "ambos"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;
                    case "libre":
                        if (materia.libre == "si"){ document.getElementById(materia.nombre).style.display = "block"; }else{ document.getElementById(materia.nombre).style.display = "none"; }
                        break;

                    default:
                        document.getElementById(materia.nombre).style.display = "block";
                        break;
                }
            }else{
                document.getElementById(materia.nombre).style.display = "none";
            }
        }

        let estanTodas = true;

        materia.previas.forEach( (previa) => {
            estanTodas = (MateriasPersona.includes(previa.nombre)||MateriasPersona.includes(previa)) && estanTodas;
        });

        if (estanTodas){

            if (!MateriasPersona.find(elemento => elemento == materia.nombre) || !MateriasPersona.find( elemento => elemento == materia.curso )){
                document.getElementById(materia.nombre).disabled = false;
                document.getElementById(materia.nombre).style.background = "lightcoral";
                materia.estado = 1;
            }
            if (MateriasPersona.find( elemento => elemento == materia.curso )){
                document.getElementById(materia.nombre).style.background = "lightblue";
                materia.estado = 2;
            }
            if (MateriasPersona.find(elemento => elemento == materia.nombre)){
                document.getElementById(materia.nombre).style.background = "lightgreen";
                creditos += materia.creditos;
                materias += 1;
                materia.estado = 3;
            }      

        }else{

            if (MateriasPersona.includes(materia.nombre)){
                MateriasPersona.splice(MateriasPersona.indexOf(materia.nombre), 1);
            }
            if (MateriasPersona.includes(materia.curso)){
                MateriasPersona.splice(MateriasPersona.indexOf(materia.curso), 1);
            }
            materia.estado = 0;
            document.getElementById(materia.nombre).style.background = "gray";

        }

    });

    document.getElementById('titulo').textContent = `Materias | Créditos: ${creditos}`

    if (opcionales){
        document.getElementById('op').innerHTML = "Opcionales: Si"
    }else{
        document.getElementById('op').innerHTML = "Opcionales: No"
    }
    
    localStorage.setItem('materias', JSON.stringify(MateriasPersona))

}

function checkWidth(){
    if (window.matchMedia("(min-width: 675px)").matches) {
        this.document.getElementById('checkbox-container').style.display = "none";
        document.getElementById('navbar').style.display = "flex"
    } else {
        this.document.getElementById('checkbox-container').style.display = "flex";
        if (seleccion){
            this.document.getElementById('checkbox').checked = true;
            document.getElementById('navbar').style.display = "flex"
        }else{
            this.document.getElementById('checkbox').checked = false;
            document.getElementById('navbar').style.display = "none"
        }
    }
}

function openPopup() {
    document.getElementById("boxPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("boxPopup").style.display = "none";
}

function toggleMI(){
    if (document.getElementById('MI').disabled == true){
        document.getElementById('MI').disabled = false;
        MI.previas = [];
        CDIV.previas = [MI];
    }else{
        document.getElementById('MI').disabled = true;
        MI.previas = [Aux];
        CDIV.previas = [];
    }
    actualizar();
    localStorage.setItem('MI', document.getElementById('MI').disabled)
}

function toggleBotones(valor){

    semestreAct = valor;
    let colorSec = 'lightgrey'
    let colorPrin = 'lightskyblue'

    switch (valor) {
        case 'primero':
            document.getElementById('primero').style.backgroundColor = colorPrin;
            document.getElementById('segundo').style.backgroundColor = colorSec;
            document.getElementById('ambos').style.backgroundColor = colorSec;
            document.getElementById('libre').style.backgroundColor = colorSec;
            document.getElementById('activarMI').style.display = "block";
            break;
        case 'segundo':
            document.getElementById('primero').style.backgroundColor = colorSec;
            document.getElementById('segundo').style.backgroundColor = colorPrin;
            document.getElementById('ambos').style.backgroundColor = colorSec;
            document.getElementById('libre').style.backgroundColor = colorSec;
            document.getElementById('activarMI').style.display = "block";
            break;
        case 'ambos':
            document.getElementById('primero').style.backgroundColor = colorSec;
            document.getElementById('segundo').style.backgroundColor = colorSec;
            document.getElementById('ambos').style.backgroundColor = colorPrin;
            document.getElementById('libre').style.backgroundColor = colorSec;
            document.getElementById('activarMI').style.display = "block";
            break;
        case 'libre':
            document.getElementById('primero').style.backgroundColor = colorSec;
            document.getElementById('segundo').style.backgroundColor = colorSec;
            document.getElementById('ambos').style.backgroundColor = colorSec;
            document.getElementById('libre').style.backgroundColor = colorPrin;
            document.getElementById('activarMI').style.display = "none";
            break;
    
        default:
            break;
    }
    actualizar();
    localStorage.setItem('semestre', semestreAct);
}

function toggleMenu(){
    if (document.getElementById('checkbox').checked){
        document.getElementById('navbar').style.display = "flex"
        seleccion = !seleccion;
    }else{
        document.getElementById('navbar').style.display = "none"
        seleccion = !seleccion;
    }
}

function aviso(){

    let texto = `<h2><u>Aviso</u></h2><br/>`
    texto += `Esta página fue inspirada de Malla Curricular.<br/><br/>`
    texto += `El objetivo de crearla fue:<br/><br/>`
    texto += `- Agregar materias opcionales<br/>`
    texto += `- Ver materias que se dictan por semestre<br/>`
    texto += `- Pestaña con calidad de libre<br/>`
    texto += `- Mantenerla actualizada<br/>`
    texto += `- Hacer un proyecto divertido y útil<br/><br/>`
    texto += `Todo el código es único.`
    document.getElementById('popup-text').innerHTML = texto;
    openPopup();
    
}

function firstLoad(){
    if(localStorage.getItem('materias')){
        MateriasPersona = JSON.parse(localStorage.getItem('materias'))
    }
    document.getElementById('MI').disabled = true;
    if (localStorage.getItem('MI') == "false"){
        toggleMI();
    }
    if(localStorage.getItem('semestre')){
        semestreAct = localStorage.getItem('semestre');
        toggleBotones(semestreAct);
    }
    checkWidth();
    aviso();
}

firstLoad();

window.addEventListener("resize", function() {
    checkWidth();
})

window.onclick = function (event) {
    var modal = document.getElementById('boxPopup');
    if (event.target == modal) {
        closePopup();
    }
}


