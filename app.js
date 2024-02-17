//agregar logica para ver cuando se activa y desactiva el PG

//comentar y revisar codigo

class Materia {

    constructor(nombre, creditos, previas, nombreCompleto){
        this.creditos = creditos;
        this.nombre = nombre;
        this.previas = previas;
        this.curso = `${nombre}Curso`
        this.estado = 0;
        this.nombreCompleto = nombreCompleto
    }

}

const CDIV = new Materia("CDIV", 13, [] , 'Cálculo DIV');
const CDIVV = new Materia("CDIVV", 13, [CDIV.curso],'Cálculo DIVV');
const MD1 = new Materia("MD1", 9, [], 'Matemática Discreta 1');
const P1 = new Materia("P1", 10, [], 'Programación 1');
const GAL1 = new Materia("GAL1", 9, [], 'Geometría y Álgebra Lineal 1')
const P2 = new Materia("P2", 12, [P1.curso], 'Programación 2');
const Ec = new Materia("Ec", 7, [], 'Economía')
const F1 = new Materia("F1", 10, [], 'Física 1')
const GAL2 = new Materia("GAL2", 9, [GAL1.curso], 'Geometría y Álgebra Lineal 2')
const PYE = new Materia("PYE", 10, [CDIVV.curso, GAL1, CDIV], 'Probabilidad y Estadistica')
const MD2 = new Materia("MD2", 9, [MD1.curso, GAL1.curso], 'Matemática Discreta 2') 
const LG = new Materia("LG", 12, [MD1.curso], 'Lógica') 
const MN = new Materia("MN", 8, [CDIVV, P1, GAL2, GAL1, CDIV], 'Métodos Numéricos') 
const P4 = new Materia("P4", 15, [GAL1, CDIV, MD1, P2], 'Programación 4') 
const IIO = new Materia("IIO", 10, [GAL2, PYE, CDIVV, CDIV, GAL1], 'Int. a la Investigación de Operaciones') 
const P3 = new Materia("P3", 15, [P2.curso, PYE.curso, P1, MD1], 'Programación 3') 
const AC = new Materia("AC", 12, [CDIV, LG.curso, P2.curso, P1, MD1], 'Arquitectura de Computadoras') 
const CV = new Materia("CV", 10, [CDIVV.curso, GAL1, CDIV], 'Cálculo Vectorial') 
const ED = new Materia("ED", 10, [GAL2,CDIVV.curso, GAL1, CDIV], 'Int. a las Ec. Diferenciales') 
const TL = new Materia("TL", 12, [P3.curso, CDIV, GAL1, LG, MD1], 'Teoría de Lenguajes') 
const FVC = new Materia("FVC", 5, [CV.curso, CDIVV], 'Funciones de Variable Compleja') 
const SO = new Materia("SO", 12, [AC.curso, GAL1, CDIV, P2, MD1], 'Sistemas Operativos')
const FO = new Materia("FO", 6, [IIO], 'Fundamentos de Optimización')
const OCA = new Materia("OCA", 10, [IIO], 'Optimización Continua y Aplicaciones') 
const FBD = new Materia("FBD", 15, [LG, P3, MD2], 'Fundamentos de Bases de Datos') 
const RC = new Materia("RC", 12, [P3, SO.curso, CDIV, AC.curso] , 'Redes de Computadoras')
const TP = new Materia("TP", 15, [P4], 'Taller de Programación') //Hay otra forma de poder cursar TP, P4.curso + P3 | Tengo que revisar como mostrarlo
const IIS = new Materia("IIS", 10, [TP.curso, FBD.curso, P4.curso], 'Int. a la Ingeniería de Software') 
const IPF = new Materia("IPF", 7, [TL, P2, LG, MD1], 'Int. a la Programación Funcional') 
const PL = new Materia("PL", 10, [TL, P3, MD2, LG], 'Programación Lógica') 
const PIS = new Materia("PIS", 15, [IIS.curso, P4], 'Proyecto de Ingeniería de Software') 
const AA = new Materia("AA", 12, [LG, PYE, P3.curso, FBD.curso, P4, MD2], 'Aprendizaje Automático') 
const AE = new Materia("AE", 10, [P4, PYE, IIO], 'Algoritmos Evolutivos') 
const ICG = new Materia("ICG", 10, [P3, P4, GAL2.curso, GAL1], 'Int. a la Computación Gráfica') 
const CGA = new Materia("CGA", 12, [ICG.curso], 'Computación Gráfica Avanzada') 
const CG = new Materia("CG", 10, [MD2, P3, MD1], 'Criptografía') 
const FSI = new Materia("FSI", 12, [SO, FBD, P3, LG, RC], 'Fundamentos de la Seguridad Informática') 
const Aux = new Materia("Aux", 4, []);
const MI = new Materia("MI", 4, [Aux], 'Matemática Inicial'); //hasta aca revise
const CTS = new Materia("CTS", 8, [], 'Ciencia, Tecnología y Sociedad');
const TRE = new Materia("TRE", 6, [P1], 'Taller de Robótica Educativa');
const F2 = new Materia("F2", 10, [F1.curso, CDIV.curso], 'Física 2');
const PG = new Materia("PG", 30, [P3, P4, TL, SO, IIO, IIS, AC, RC, TP, PIS, MN, FBD]) //falta agregar



//Revisar todos otra vez

let Materias = [MI, CDIV, CDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS, AA, AE, ICG, CGA, CG, FSI, CTS, TRE, F2];
let MateriasConOpcionales = [MI, CDIV, CDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS, AA, AE, ICG, CGA, CG, FSI, CTS, TRE, F2];
let MateriasSinOpcionales = [MI, MD1, CDIV, P1, GAL1, CDIVV, P2, GAL2, MD2, LG, PYE, MN, P4, TP, IIO, P3, AC, TL, SO, FBD, RC, IIS, IPF, PL, PIS]
let MateriasPrimero = [LG, P4, FVC, IIO, TL, SO, FO, ICG, CG,IIS, IPF, PL, AA, FSI, CTS, TRE];
let MateriasSegundo = [P2, MN, ED, TP, P3, AC, OCA, FBD, AE, RC, CGA, PIS];
let MateriasCalidadLibre = [F1, CDIV, CDIVV, CV, FVC, GAL1, GAL2, ED, MD1, MD2, PYE]
let MateriasPersona = [];
let creditos = 0;
let materias = 0;
let opcionales = true;
let semestreAct = "ambos";

function reset(){
    MateriasPersona = [];
    resetParrafos();
    actualizar();
}

function resetParrafos(){
    document.getElementById('S1').innerText = '';
    document.getElementById('S2').innerText = '';
    document.getElementById('S3').innerText = '';
    document.getElementById('S4').innerText = '';
    document.getElementById('S5').innerText = '';
    document.getElementById('S6').innerText = '';
    document.getElementById('S7').innerText = '';
    document.getElementById('S1').style.display = 'none';
    document.getElementById('S2').style.display = 'none';
    document.getElementById('S3').style.display = 'none';
    document.getElementById('S4').style.display = 'none';
    document.getElementById('S5').style.display = 'none';
    document.getElementById('S6').style.display = 'none';
    document.getElementById('S7').style.display = 'none';
}

function toggleOpcionales(){
    if (opcionales){
        Materias.forEach( (materia) => {
            document.getElementById(materia.nombre).style.display = "none";
        } )
        Materias = [...MateriasSinOpcionales];
        actualizar();
        opcionales = false;
    }else{
        Materias.forEach( (materia) => {
            document.getElementById(materia.nombre).style.display = "none";
        } )
        Materias = [...MateriasConOpcionales];
        actualizar();
        opcionales = true;
    }
}

function toggleMateria(nombre, seccion){

    let materiaActual = Materias.find( nombreAux => nombreAux.nombre == nombre );
    switch (materiaActual.estado) {
        case 0:
            indicarPrevias(nombre, seccion);
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

function indicarPrevias(nombre, seccion){

    let materiaAct = Materias.find( materia => materia.nombre == nombre )

    let MateriasQueFaltan = []
    
    materiaAct.previas.filter( (materia)=>{ 

        if (typeof(materia)=="string"){
            if (!MateriasPersona.find( elemento => elemento == materia)){
                let materiaAux = Materias.find( elemento => elemento.curso == materia )
                MateriasQueFaltan.push(` Curso ${materiaAux.nombreCompleto} `)
            }
        }else{
            if (!MateriasPersona.find( elemento => elemento == materia.nombre)){
                MateriasQueFaltan.push(` ${materia.nombreCompleto} `)
            }
            if (!MateriasPersona.find(elemento => elemento == materia.curso)){
                MateriasQueFaltan.push(` Curso ${materia.nombreCompleto} `)
            }
        }

        
    } )

    document.getElementById(seccion).style.display = "block"
    document.getElementById(seccion).innerText = `[Clic para cerrar] Para poder cursar ${materiaAct.nombreCompleto} hacen falta {${MateriasQueFaltan}}`;

}

function actualizar(){

    creditos = 0;
    materias = 0;

    Materias.forEach( (materia) => {

        document.getElementById(materia.nombre).style.display = "block";
        
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

    let porcentaje = Math.round((creditos/450)*100) 

    document.getElementById('titulo').textContent = `Materias: ${materias} | Créditos: ${creditos} (${porcentaje}%)`

    switch (semestreAct) {
        case "primero":
            primero();
            break;
    
        case "segundo":
            segundo();
            break;
        case "libre":
            libre();
            break;

        default:
            ambos();
            break;
    }

    localStorage.setItem('semestre', semestreAct);
    localStorage.setItem('materias', JSON.stringify(MateriasPersona))
    localStorage.setItem('MI', document.getElementById('MI').disabled)

}

function firstLoad(){
    if(localStorage.getItem('semestre')){
        semestreAct = localStorage.getItem('semestre');
    }
    if(localStorage.getItem('materias')){
        MateriasPersona = JSON.parse(localStorage.getItem('materias'))
    }
    document.getElementById('MI').disabled = true;
    if (localStorage.getItem('MI') == "false"){
        toggleMI();
    }
}

function toggleMI(){
    if (document.getElementById('MI').disabled == true){
        document.getElementById('MI').disabled = false;
        MI.previas = [];
        CDIV.previas = [MI];
        actualizar();
    }else{
        document.getElementById('MI').disabled = true;
        MI.previas = [Aux];
        CDIV.previas = [];
        actualizar();
    }
}

function primero(){
    document.getElementById('primero').style.backgroundColor = "lightskyblue";
    document.getElementById('segundo').style.backgroundColor = "white";
    document.getElementById('ambos').style.backgroundColor = "white";
    document.getElementById('libre').style.backgroundColor = "white";
    document.getElementById('activarMI').style.display = "block";

    Materias.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "block";
    } )
    MateriasSegundo.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "none";
    } )
    
    semestreAct = "primero";
    localStorage.setItem('semestre', semestreAct);

}

function segundo(){
    document.getElementById('primero').style.backgroundColor = "white";
    document.getElementById('segundo').style.backgroundColor = "lightskyblue";
    document.getElementById('ambos').style.backgroundColor = "white";
    document.getElementById('libre').style.backgroundColor = "white";
    document.getElementById('activarMI').style.display = "block";

    Materias.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "block";
    } )
    MateriasPrimero.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "none";
    } )

    semestreAct = "segundo";
    localStorage.setItem('semestre', semestreAct);

}

function ambos(){
    document.getElementById('primero').style.backgroundColor = "white";
    document.getElementById('segundo').style.backgroundColor = "white";
    document.getElementById('ambos').style.backgroundColor = "lightskyblue";
    document.getElementById('libre').style.backgroundColor = "white";
    document.getElementById('activarMI').style.display = "block";

    Materias.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "block";
    } )

    semestreAct = "ambos";
    localStorage.setItem('semestre', semestreAct);

}

function libre(){
    document.getElementById('primero').style.backgroundColor = "white";
    document.getElementById('segundo').style.backgroundColor = "white";
    document.getElementById('ambos').style.backgroundColor = "white";
    document.getElementById('libre').style.backgroundColor = "lightskyblue";
    document.getElementById('activarMI').style.display = "none";

    Materias.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "none";
    } )
    MateriasCalidadLibre.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "block";
    } )

    semestreAct = "libre";
    localStorage.setItem('semestre', semestreAct);

}

firstLoad();
actualizar();