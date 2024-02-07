//falta ver Matematica Inicial
//agregar logica para ver cuando se activa y desactiva el PG

class Materia {

    constructor(nombre, creditos, previas){
        this.creditos = creditos;
        this.nombre = nombre;
        this.previas = previas;
        this.curso = `${nombre}Curso`
        this.estado = 0;
    }

}

const CalculoDIV = new Materia("CalculoDIV", 13, []);
const CalculoDIVV = new Materia("CalculoDIVV", 13, [CalculoDIV.curso]);
const MD1 = new Materia("MD1", 9, []);
const P1 = new Materia("P1", 10, []);
const GAL1 = new Materia("GAL1", 9, [])
const P2 = new Materia("P2", 12, [P1.curso]);
const Ec = new Materia("Ec", 7, [])
const F1 = new Materia("F1", 10, [])
const GAL2 = new Materia("GAL2", 9, [GAL1.curso])
const PYE = new Materia("PYE", 10, [CalculoDIVV.curso, GAL1, CalculoDIV])
const MD2 = new Materia("MD2", 9, [MD1.curso, GAL1.curso]) 
const LG = new Materia("LG", 12, [MD1.curso]) 
const MN = new Materia("MN", 8, [CalculoDIVV, P1, GAL2, GAL1, CalculoDIV]) 
const P4 = new Materia("P4", 15, [GAL1, CalculoDIV, MD1, P2]) 
const IIO = new Materia("IIO", 10, [GAL2, PYE, CalculoDIVV, CalculoDIV, GAL1]) 
const P3 = new Materia("P3", 15, [P2.curso, PYE.curso, P1, MD1]) 
const AC = new Materia("AC", 12, [CalculoDIV, LG.curso, P2.curso, P1, MD1]) 
const CV = new Materia("CV", 10, [CalculoDIVV.curso, GAL1, CalculoDIV]) 
const ED = new Materia("ED", 10, [GAL2,CalculoDIVV.curso, GAL1, CalculoDIV]) 
const TL = new Materia("TL", 12, [P3.curso, CalculoDIV, GAL1, LG, MD1]) 
const FVC = new Materia("FVC", 5, [CV.curso, CalculoDIVV]) 
const SO = new Materia("SO", 12, [AC.curso, GAL1, CalculoDIV, P2, MD1])
const FO = new Materia("FO", 6, [IIO])
const OCA = new Materia("OCA", 10, [IIO]) 
const FBD = new Materia("FBD", 15, [LG, P3, MD2]) 
const RC = new Materia("RC", 12, [P3, SO.curso, CalculoDIV, AC.curso])
const TP = new Materia("TP", 15, [P4]) //Hay otra forma de poder cursar TP, P4.curso + P3 | Tengo que revisar como mostrarlo
const IIS = new Materia("IIS", 10, [TP.curso, FBD.curso, P4.curso]) 
const IPF = new Materia("IPF", 7, [TL, P2, LG, MD1]) 
const PL = new Materia("PL", 10, [TL, P3, MD2, LG]) 
const PIS = new Materia("PIS", 15, [IIS.curso, P4]) 
const AA = new Materia("AA", 12, [LG, PYE, P3.curso, FBD.curso, P4, MD2]) 
const AE = new Materia("AE", 10, [P4, PYE, IIO]) 
const ICG = new Materia("ICG", 10, [P3, P4, GAL2.curso, GAL1]) 
const CGA = new Materia("CGA", 12, [ICG.curso]) 
const CG = new Materia("CG", 10, [MD2, P3, MD1]) 
const FSI = new Materia("FSI", 12, [SO, FBD, P3, LG, RC]) //hasta aca revise
const PG = new Materia("PG", 30, [P3, P4, TL, SO, IIO, IIS, AC, RC, TP, PIS, MN, FBD]) //falta agregar

//Revisar todos otra vez

let Materias = [CalculoDIV, CalculoDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS, AA, AE, ICG, CGA, CG, FSI];
const MateriasConOpcionales = [CalculoDIV, CalculoDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS, AA, AE, ICG, CGA, CG, FSI];
const MateriasSinOpcionales = [MD1, CalculoDIV, P1, GAL1, CalculoDIVV, P2, GAL2, MD2, LG, PYE, MN, P4, TP, IIO, P3, AC, TL, SO, FBD, RC, IIS, IPF, PL, PIS]
const MateriasPrimero = [LG, P4, FVC, IIO, TL, SO, FO, ICG, CG,IIS, IPF, PL, AA, FSI];
const MateriasSegundo = [P2, MN, ED, TP, P3, AC, OCA, FBD, AE, RC, CGA, PIS];
let MateriasPersona = [];
let creditos = 0;
let opcionales = true;
let semestreAct = "ambos";

function reset(){
    MateriasPersona = [];
    actualizar();
}

function toggleOpcionales(){
    if (opcionales){
        Materias.forEach( (materia) => {
            document.getElementById(materia.nombre).style.display = "none";
        } )
        Materias = MateriasSinOpcionales;
        actualizar();
        opcionales = false;
    }else{
        Materias.forEach( (materia) => {
            document.getElementById(materia.nombre).style.display = "none";
        } )
        Materias = MateriasConOpcionales;
        actualizar();
        opcionales = true;
    }
    
}

function toggleMateria(nombre){

    let materiaActual = Materias.find( nombreAux => nombreAux.nombre == nombre );
    switch (materiaActual.estado) {
        case 0:
            
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

function actualizar(){

    creditos = 0;

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
                //creditos += materia.creditos;
                materia.estado = 2;
            }
            if (MateriasPersona.find(elemento => elemento == materia.nombre)){
                document.getElementById(materia.nombre).style.background = "lightgreen";
                creditos += materia.creditos;
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
            document.getElementById(materia.nombre).disabled = true;
            document.getElementById(materia.nombre).style.background = "gray";

        }

    });

    document.getElementById('titulo').textContent = `Materias | Créditos: ${creditos}`

    switch (semestreAct) {
        case "primero":
            primero();
            break;
    
        case "segundo":
            segundo();
            break;

        default:
            ambos();
            break;
    }

    localStorage.setItem('semestre', semestreAct);
    localStorage.setItem('materias', JSON.stringify(MateriasPersona))

}

function firstLoad(){
    if(localStorage.getItem('semestre')){
        semestreAct = localStorage.getItem('semestre');
    }
    if(localStorage.getItem('materias')){
        MateriasPersona = JSON.parse(localStorage.getItem('materias'))
    }
}

function primero(){
    document.getElementById('primero').style.backgroundColor = "lightskyblue"
    document.getElementById('segundo').style.backgroundColor = "white"
    document.getElementById('ambos').style.backgroundColor = "white"

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
    document.getElementById('primero').style.backgroundColor = "white"
    document.getElementById('segundo').style.backgroundColor = "lightskyblue"
    document.getElementById('ambos').style.backgroundColor = "white"

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
    document.getElementById('primero').style.backgroundColor = "white"
    document.getElementById('segundo').style.backgroundColor = "white"
    document.getElementById('ambos').style.backgroundColor = "lightskyblue"

    Materias.forEach( (materia) => {
        document.getElementById(materia.nombre).style.display = "block";
    } )

    semestreAct = "ambos";
    localStorage.setItem('semestre', semestreAct);

}

firstLoad();
actualizar();