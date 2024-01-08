let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let jugar = document.getElementById("jugar");

// Función para dibujar el fondo
const drawBackground = () => {
    ctx.fillStyle = "plum";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// La clase barra representa la plataforma controlada por el jugador
class Barra {
    constructor(canvas) {
        this.ancho = 110;
        this.altura = 10;
        this.velocidad = 30;
        this.resetearPosicion(canvas);
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, canvas.height - this.altura, this.ancho, this.altura);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    moverDerecha() {
        this.x += this.velocidad;
        if (this.x > canvas.width - this.ancho) {
            this.x = canvas.width - this.ancho;
        }
    }

    moverIzquierda() {
        this.x -= this.velocidad;
        if (this.x < 0) {
            this.x = 0;
        }
    }

    resetearPosicion(canvas) {
        this.x = (canvas.width - this.ancho) / 2;
    }
}

// La clase Bola representa la bola que rebota en el juego
class Bola {
    constructor(canvas, nivel) {
        // Tamaño de la bola
        this.radio = 10;
        // Si nivel es igual a 1, la bola se moverá horizontalmente a 4px, si no, se mueve a 3px (modificado)
        this.dx = nivel === 1 ? 3 : 4;  // Modificación de la velocidad de la bola
        // Velocidad vertical de la bola
        this.dy = -1;  // Modificación de la velocidad de la bola
        this.resetearPosicion(canvas);
    }

    dibujar(ctx, ballImage) {
        ctx.drawImage(ballImage, this.x - this.radio, this.y - this.radio, this.radio * 2, this.radio * 2);
    }

    resetearPosicion(canvas) {
        this.x = canvas.width / 2;
        this.y = canvas.height - 20;
    }
}

// La clase Ladrillo representa los bloques a romper
class Ladrillo {
    constructor(canvas, fila, columna) {
        this.ancho = 75;
        this.altura = 20;
        this.padding = 10;
        this.offsetTop = 30;
        this.offsetLeft = (canvas.width - (8 * (this.ancho + this.padding))) / 2;
        this.x = columna * (this.ancho + this.padding) + this.offsetLeft;
        this.y = fila * (this.altura + this.padding) + this.offsetTop;
        this.estado = 1;
        this.color = getRandomColor();
    }

    dibujar(ctx) {
        if (this.estado === 1) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.ancho, this.altura);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Función para obtener un color aleatorio entre azul y verde
function getRandomColor() {
    let colors = ["blue", "greenyellow"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Crea instancias de las clases
let barra = new Barra(canvas);
let nivel = 1;
let vidas = 3;
let resultadoMostrado = false;

let ladrillos = [];
let ballImage = new Image();
ballImage.src = "./assets/images/bola.png";
let bola = new Bola(canvas, nivel);

// Inicializa los ladrillos
const inicializarLadrillos = () => {
    for (let columna = 0; columna < 8; columna++) {
        ladrillos[columna] = [];
        for (let fila = 0; fila < 5; fila++) {
            ladrillos[columna][fila] = new Ladrillo(canvas, fila, columna);
        }
    }
}

inicializarLadrillos();

// Obtiene el botón de reiniciar y el elemento de resultado
let botonReiniciar = document.getElementById("restartButton");
let resultadoTexto = document.getElementById("result");

// Dibuja los ladrillos en el canvas
const dibujarLadrillos = () => {
    for (let columna = 0; columna < 8; columna++) {
        for (let fila = 0; fila < 5; fila++) {
            ladrillos[columna][fila].dibujar(ctx);
        }
    }
}

// Dibuja la cantidad de vidas restantes
const dibujarVidas = () => {
    document.getElementById("lives").innerHTML = "Vidas: " + vidas;
}

// Dibuja el nivel actual
const dibujarNivel = () => {
    document.getElementById("level").innerHTML = "Nivel: " + nivel;
}

// Función principal para dibujar el juego en cada fotograma
const dibujar = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    // Dibuja la barra
    barra.dibujar(ctx);

    // Dibuja la bola
    bola.dibujar(ctx, ballImage);

    dibujarLadrillos();

    
    dibujarVidas();

    dibujarNivel();

    // Mueve la bola
    bola.x += bola.dx;
    bola.y += bola.dy;

    // Rebote en los bordes laterales
    if (bola.x + bola.dx > canvas.width - bola.radio || bola.x + bola.dx < bola.radio) {
        bola.dx = -bola.dx;
    }

    // Rebote en el borde superior
    if (bola.y + bola.dy < bola.radio) {
        bola.dy = -bola.dy;
    } 
    // Colisión con la barra
    else if (bola.y + bola.dy > canvas.height - bola.radio) {
        if (bola.x > barra.x && bola.x < barra.x + barra.ancho) {
            bola.dy = -bola.dy;
        } 
        // Pierde una vida si no hay colisión con la barra
        else {
            vidas--;
            if (vidas === 0) {
                mostrarResultado("GAME OVER");
                return;
            }

        // Resetea la posición de la barra y la bola al perder una vida
        barra.resetearPosicion(canvas);
        bola.resetearPosicion(canvas);
        }
    }

    // Verifica cuántos ladrillos quedan
    let ladrillosRestantes = 0;
    for (let columna = 0; columna < 8; columna++) {
        for (let fila = 0; fila < 5; fila++) {
            let ladrillo = ladrillos[columna][fila];
            if (ladrillo.estado === 1) {
                ladrillosRestantes++;
                // Colisión con un ladrillo
                if (
                    bola.x > ladrillo.x &&
                    bola.x < ladrillo.x + ladrillo.ancho &&
                    bola.y > ladrillo.y &&
                    bola.y < ladrillo.y + ladrillo.altura
                ) {
                    bola.dy = -bola.dy;
                    ladrillo.estado = 0;
                }
            }
        }
    }

    // verifica si no quedan ladrillos
    if (ladrillosRestantes === 0) {
        if (nivel < 3) {
            // avanza al siguiente nivel
            avanzarNivel();
        } else {
            mostrarResultado("¡VICTORIA!");
        }
    }

    // API Web que informa al navegador que quieres realizar una
    // animación y solicita que el navegador programe el repintado 
    // de la ventana para el próximo ciclo de animación
    requestAnimationFrame(dibujar);
}

// Función para mostrar el resultado del juego
const mostrarResultado = (texto) => {
    resultadoTexto.innerHTML = texto;
    resultadoTexto.style.display = "block";
    resultadoMostrado = true;
    // Muestra el botón de reiniciar
    botonReiniciar.classList.remove("displayNone");
    botonReiniciar.style.display = "block";
    botonReiniciar.style.fontFamily = "retro";
}

// Función para avanzar al siguiente nivel
const avanzarNivel = () => {
    nivel++;
    // Resetea la posición de la bola y crea nuevos ladrillos
    bola.resetearPosicion(canvas);
    inicializarLadrillos();
    // Inicia el dibujo del juego
    dibujar();
}

// Función para reiniciar el juego
const reiniciarBoton = () => {
    nivel = 1;
    vidas = 3;
    resultadoTexto.style.display = "none";
    // Resetea la posición de la barra y la bola
    barra.resetearPosicion(canvas);
    bola.resetearPosicion(canvas);
    // Oculta el botón de reiniciar
    botonReiniciar.style.display = "none";
    // Inicializa los ladrillos
    inicializarLadrillos();
    // Inicia el dibujo del juego
    dibujar();
}

// Función para mover la barra con las teclas
const moverBarra = (e) => {
    if (e.key == "Right" || e.key == "ArrowRight") {
        barra.moverDerecha();
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        barra.moverIzquierda();
    }
}

// Función para empezar el juego al hacer clic en "Jugar"
const empezarJuego = () => {
    jugar.style.display = "none"
    dibujar();
}
document.addEventListener("keydown", moverBarra);
jugar.addEventListener("click", empezarJuego)
botonReiniciar.addEventListener("click", reiniciarBoton);
