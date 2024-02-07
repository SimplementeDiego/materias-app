class Materia {

    constructor(nombre, creditos, previas){
        this.creditos = creditos;
        this.nombre = nombre;
        this.previas = previas;
    }

}

const CalculoDIV = new Materia("CalculoDIV", 13, []);
const CalculoDIVV = new Materia("CalculoDIVV", 13, [CalculoDIV]);
const MD1 = new Materia("MD1", 9, []);
const P1 = new Materia("P1", 10, []);
const GAL1 = new Materia("GAL1", 9, [])
const P2 = new Materia("P2", 12, [P1]);
const Ec = new Materia("Ec", 7, [])
const F1 = new Materia("F1", 10, [])
const GAL2 = new Materia("GAL2", 9, [GAL1])
const PYE = new Materia("PYE", 10, [CalculoDIVV, GAL1])
const MD2 = new Materia("MD2", 9, [MD1])
const LG = new Materia("LG", 12, [MD1])
const MN = new Materia("MN", 8, [CalculoDIVV, P1, GAL2])
const P4 = new Materia("P4", 15, [GAL1, CalculoDIV, MD1, P2])
const IIO = new Materia("IIO", 10, [GAL2, PYE])
const P3 = new Materia("P3", 15, [P2, PYE])
const AC = new Materia("AC", 12, [CalculoDIV, LG, P2])
const CV = new Materia("CV", 10, [CalculoDIVV, GAL1])
const ED = new Materia("ED", 10, [GAL2,CalculoDIVV])
const TL = new Materia("TL", 12, [P3, CalculoDIV, GAL1])
const FVC = new Materia("FVC", 5, [CV])
const SO = new Materia("SO", 12, [AC, GAL1])
const FO = new Materia("FO", 6, [IIO])
const OCA = new Materia("OCA", 6, [IIO])
const FBD = new Materia("FBD", 15, [LG, P3, MD2])
const RC = new Materia("RC", 12, [P3, SO])
const TP = new Materia("TP", 15, [P4])
const IIS = new Materia("IIS", 10, [TP, FBD])
const IPF = new Materia("IPF", 7, [TL, P2, LG])
const PL = new Materia("PL", 10, [TL, P3, MD2, LG])
const PIS = new Materia("PIS", 15, [IIS])

const Materias = [CalculoDIV, CalculoDIVV, P1, GAL1, MD1, P2, Ec, F1, GAL2, PYE, MD2, LG, MN, P4, IIO, P3, AC, CV, ED, TL, FVC, SO, FO, OCA, FBD, RC, TP, IIS, IPF, PL, PIS];
let MateriasPersona = [];
let creditos = 0;

function reset(){
    MateriasPersona = [];
    actualizar();
}

function toggleMateria(nombre){

    if (!MateriasPersona.find( nombreAux => nombreAux == nombre )){
        MateriasPersona.push(nombre);
        actualizar();
    }else{
        MateriasPersona.splice(MateriasPersona.indexOf(nombre), 1);
        actualizar();
    }

}

function actualizar(){

    Materias.forEach( (materia) => {
        
        let estanTodas = true;

        materia.previas.forEach( (previa) => {
            estanTodas = MateriasPersona.includes(previa.nombre) && estanTodas;
        });

        if (estanTodas){

            document.getElementById(materia.nombre).disabled = false;
            document.getElementById(materia.nombre).style.background = "lightcoral";

        }else{

            if (MateriasPersona.includes(materia.nombre)){
                MateriasPersona.splice(MateriasPersona.indexOf(materia.nombre), 1);
            }
            document.getElementById(materia.nombre).disabled = true;
            document.getElementById(materia.nombre).style.background = "gray";

        }

    });

    creditos = 0;

    MateriasPersona.forEach( (materia) => {
        document.getElementById(materia).style.background = "lightgreen";
        let buscarMateria = Materias.find( materiaAux => materiaAux.nombre == materia )
        if (buscarMateria){
            creditos += buscarMateria.creditos;
        }
    });

    document.getElementById('titulo').textContent = `Materias | Créditos: ${creditos}`

}

actualizar();