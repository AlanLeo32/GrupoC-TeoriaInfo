const { hasSubscribers } = require("diagnostics_channel");
const fs = require("fs");
let N;                                                                      //cantidad de mjs
let M;                                                                      //longitud de mjs


/** FUNCIONES */
function leeArchivo(prob, canal) {
    let archivo = process.argv[2];
    N = process.argv[3];
    M = process.argv[4];

    try {
        let palabras = []
        let contenido = fs.readFileSync(archivo, 'ASCII');                  //leo todo el archivo
        let lineas = contenido.split('\n');                                 //me quedo con las palabras
        lineas.forEach(element => {
            element = element.replace('\r', '')
            palabras = palabras.concat(element.split(' '))
        });

        for (let k=0; k<palabras.length; k++) {
            switch (k) {
                case 0: prob[0] = palabras[k];
                    break;
                case 1: prob[1] = palabras[k];
                    break;
                case 2: canal[0][0] = palabras[k];
                    break;
                case 3: canal[0][1] = palabras[k];
                    break;
                case 4: canal[1][0] = palabras[k];
                    break;
                case 5: canal[1][1] = palabras[k];
                    break;            
            }
        }
      
    }
    catch (error){
        console.error("Error al leer el archivo", error);
    }
}
//ecuacion 2
function calculoProbDeUnCanal(probB,prob,canal){
    probB[0]=prob[0]*canal[0][0]+prob[1]*canal[1][0];
    probB[1]=prob[0]*canal[0][1]+prob[1]*canal[1][1];

}
//ecuacion 3
function calculoProbConociendoLlegada(probB,prob,canal,probArespectoB){
    probArespectoB[0][0]=(prob[0]*canal[0][0])/probB[0];
    probArespectoB[0][1]=(prob[0]*canal[0][1])/probB[1];
    probArespectoB[1][0]=(prob[1]*canal[1][0])/probB[0];
    probArespectoB[1][1]=(prob[1]*canal[1][1])/probB[1];
}
//ecuacion 4
function calculoProbSucesosSimultaneos(prob,canal,probSuceso){
    probSuceso[0][0]=prob[0]*canal[0][0];
    probSuceso[0][1]=prob[0]*canal[0][1];
    probSuceso[1][0]=prob[1]*canal[1][0];
    probSuceso[1][1]=prob[1]*canal[1][1];
}
function Equivocacion(probSuceso,probArespectoB,canal,equivocacion){
    // equivocacion 0 es H[A/B]   equivocacion 1 es H[B/A]
    equivocacion[0]=probSuceso[0][0]*Math.log2(1/probArespectoB[0][0])+probSuceso[0][1]*Math.log2(1/probArespectoB[0][1])+probSuceso[1][0]*Math.log2(1/probArespectoB[1][0])+probSuceso[1][1]*Math.log2(1/probArespectoB[1][1]);
    equivocacion[1]=probSuceso[0][0]*Math.log2(1/canal[0][0])+probSuceso[0][1]*Math.log2(1/canal[0][1])+probSuceso[1][0]*Math.log2(1/canal[1][0])+probSuceso[1][1]*Math.log2(1/canal[1][1]);
}
function entropiaAPriori(probabilidad){
    return probabilidad[0]*Math.log2(1/probabilidad[0])+probabilidad[1]*Math.log2(1/probabilidad[1]);
}
function informacionMutua(entropia,equivocacion){
    return entropia-equivocacion;
}
function entropiaAPosteriori(probArespectoB,canal,hAposteriori){
    //H(A/b1)     H(A/b2)
    hAposteriori[0][0]=probArespectoB[0][0]*Math.log2(1/probArespectoB[0][0])+probArespectoB[1][0]*Math.log2(1/probArespectoB[1][0]);
    hAposteriori[0][1]=probArespectoB[0][1]*Math.log2(1/probArespectoB[0][1])+probArespectoB[1][1]*Math.log2(1/probArespectoB[1][1]);

     //H(B/a1)     H(B/a2)
    hAposteriori[1][0]=canal[0][0]*Math.log2(1/canal[0][0])+canal[0][1]*Math.log2(1/canal[0][1]);
    hAposteriori[1][1]=canal[1][0]*Math.log2(1/canal[1][0])+canal[1][1]*Math.log2(1/canal[1][1]);
}
/** PROGRAMA PRINCIPAL */
let prob = [];                                                              //vector de probabildiades de la fuente
let canal = [[],[]];                                                        //matriz del canal
let probB=[];
let probSuceso=[[],[]];
let probArespectoB=[[],[]];
let equivocacion=[[],[]];
let hAposteriori=[[],[]];
let hFuente,hLlegada;
leeArchivo(prob, canal);
console.log(prob);
console.log(canal);
console.log(N);
console.log(M);
calculoProbDeUnCanal(probB,prob,canal);
console.log(probB);

calculoProbConociendoLlegada(probB,prob,canal,probArespectoB);
console.log(probArespectoB);

calculoProbSucesosSimultaneos(prob,canal,probSuceso);
console.log(probSuceso);
Equivocacion(probSuceso,probArespectoB,canal,equivocacion);
console.log("Equivocacion de A con respecto a B "+equivocacion[0]+"\nEquivocacion de B con respecto a A "+equivocacion[1]);
hFuente=entropiaAPriori(prob);
hLlegada=entropiaAPriori(probB);
console.log("Entropia a Priori de A---->"+hFuente);
console.log("Entropia a Posteriori de B---->"+hLlegada);
//Las informaciones deberias ser iguales
console.log("Informacion mutua I(A,B)---->"+informacionMutua(hFuente,equivocacion[0]));
console.log("Informacion mutua I(B,A)---->"+informacionMutua(hLlegada,equivocacion[1]));

entropiaAPosteriori(probArespectoB,canal,hAposteriori);
console.log("Entropia a posteriori A/b1--->"+hAposteriori[0][0]+"\nEntropia a posteriori A/b2--->"+hAposteriori[0][1]+"\nEntropia a posteriori B/a1--->"+hAposteriori[1][0]+"\nEntropia a posteriori B/a2--->"+hAposteriori[1][1]);
