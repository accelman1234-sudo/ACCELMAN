// ================= ADMIN ================= 
const ADMIN_USER = "admin";
const ADMIN_PASS = "CALUDIA4444";
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let indiceEditar = null;

// ================= LOGIN =================
function login() {
    const user = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("password").value.trim();

    if(user === ADMIN_USER && pass === ADMIN_PASS) { entrar(user); return; }

    const existe = usuarios.find(u => u.user === user && u.pass === pass);
    if(existe) { entrar(user); } 
    else { alert("Usuario o contraseña incorrectos"); }
}

function entrar(user) {
    document.getElementById("panel").style.display = "block";
    document.getElementById("login-panel").style.display = "none";
    mostrarProductosAdmin();
}

function cerrarSesion() {
    document.getElementById("panel").style.display = "none";
    document.getElementById("login-panel").style.display = "block";
}

// ================= PRODUCTOS =================
function agregarProducto() {
    const modelo = document.getElementById("modelo").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;
    const fotoInput = document.getElementById("foto");

    if(!modelo || !precio || !categoria || (indiceEditar === null && fotoInput.files.length === 0)){
        alert("Completa todos los campos obligatorios"); return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const producto = {
            modelo,
            precio,
            descripcion,
            categoria,
            foto: fotoInput.files.length > 0 ? reader.result : indiceEditar !== null ? productos[indiceEditar].foto : ""
        };

        if(indiceEditar !== null) { 
            productos[indiceEditar] = producto; 
            indiceEditar = null; 
        } else { 
            productos.push(producto); 
        }

        localStorage.setItem("productos", JSON.stringify(productos));
        limpiarFormulario();
        mostrarProductosAdmin();
        mostrarProductosCliente();
    };

    if(fotoInput.files.length > 0){ 
        reader.readAsDataURL(fotoInput.files[0]); 
    } else { 
        reader.onload(); 
    }
}

function limpiarFormulario() {
    document.getElementById("modelo").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("foto").value = "";
}

// ================= ADMIN - MOSTRAR PRODUCTOS =================
function mostrarProductosAdmin() {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";
    const categorias = ["Celulares","Cargadores","Fundas","Accesorios"];

    categorias.forEach(cat => {
        const productosCat = productos.filter(p => p.categoria===cat);
        if(productosCat.length===0) return;

        const titulo = document.createElement("h3");
        titulo.textContent = cat;
        titulo.style.color = "#ff6f61";
        titulo.style.marginBottom = "10px";
        contenedor.appendChild(titulo);

        const grid = document.createElement("div");
        grid.classList.add("categoria-container");

        productosCat.forEach((p,index) => {
            const card = document.createElement("div");
            card.classList.add("card");

            const img = document.createElement("img");
            img.src = p.foto;
            img.alt = p.modelo;

            const infoDiv = document.createElement("div");
            infoDiv.classList.add("info");
            infoDiv.innerHTML = `
                <h4>${p.modelo}</h4>
                <p>${p.precio ? "$"+p.precio : ""}</p>
                <p>${p.descripcion||""}</p>
            `;

            const botonesDiv = document.createElement("div");
            botonesDiv.classList.add("botones-card");

            const btnEditar = document.createElement("button");
            btnEditar.classList.add("btn-editar");
            btnEditar.textContent = "✏️ Editar";
            btnEditar.addEventListener("click", () => editarProducto(index));

            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("btn-borrar");
            btnBorrar.textContent = "🗑 Borrar";
            btnBorrar.addEventListener("click", () => borrarProducto(index));

            const btnWhatsApp = document.createElement("button");
            btnWhatsApp.classList.add("btn-whatsapp");
            btnWhatsApp.textContent = "📲 WhatsApp";
            btnWhatsApp.addEventListener("click", () => enviarWhatsApp(p.modelo, p.foto));

            botonesDiv.appendChild(btnEditar);
            botonesDiv.appendChild(btnBorrar);
            botonesDiv.appendChild(btnWhatsApp);

            card.appendChild(img);
            card.appendChild(infoDiv);
            card.appendChild(botonesDiv);
            grid.appendChild(card);
        });

        contenedor.appendChild(grid);
    });
}

function editarProducto(index){
    const p = productos[index];
    document.getElementById("modelo").value = p.modelo;
    document.getElementById("precio").value = p.precio;
    document.getElementById("descripcion").value = p.descripcion||"";
    document.getElementById("categoria").value = p.categoria;
    indiceEditar = index;
}

function borrarProducto(index){
    if(!confirm("¿Borrar este producto?")) return;
    productos.splice(index,1);
    localStorage.setItem("productos",JSON.stringify(productos));
    mostrarProductosAdmin();
    mostrarProductosCliente();
}

// ================= WHATSAPP =================
function enviarWhatsApp(modelo,foto){
    const mensaje=`Hola, me interesa este producto: ${modelo}\n${foto}`;
    window.open(`https://wa.me/5216146150041?text=${encodeURIComponent(mensaje)}`,"_blank");
}

// ================= CLIENTE =================
let busquedaCliente = "";
let ordenPrecioCliente = false;
let filtroCategoriaCliente = "";

const clientePanel = document.getElementById("cliente-panel");
const productosCliente = document.getElementById("productos-cliente");
const inputBusqueda = document.getElementById("busqueda-cliente");
const selectCategoria = document.getElementById("filtro-categoria-cliente");

// ================= FORMULARIO GITHUB =================
function limpiarFormularioGitHub() {
    document.getElementById("urlGitHub").value = "";
    document.getElementById("modeloGitHub").value = "";
    document.getElementById("precioGitHub").value = "";
    document.getElementById("categoriaGitHub").value = "";
    document.getElementById("descripcionGitHub").value = "";
}

// ================= INICIAL =================
document.addEventListener("DOMContentLoaded", () => {
    // ocultar formulario GitHub al inicio
    const formGitHub = document.getElementById("formGitHub");
    formGitHub.style.display = "none";

    // ======== CLIENTE ========
    document.getElementById("btnClienteInicio").addEventListener("click", () => {
        document.getElementById("login-panel").style.display = "none";
        clientePanel.style.display = "block";
        mostrarProductosCliente();
    });

    document.querySelector(".btn-cliente-regresar").addEventListener("click", () => {
        clientePanel.style.display = "none";
        document.getElementById("login-panel").style.display = "block";
        busquedaCliente = "";
        filtroCategoriaCliente = "";
        inputBusqueda.value = "";
        selectCategoria.value = "";
    });

    document.querySelector(".btn-cliente-buscar").addEventListener("click", () => {
        busquedaCliente = inputBusqueda.value.toLowerCase();
        mostrarProductosCliente();
    });

    document.querySelector(".btn-ordenar-cliente").addEventListener("click", () => {
        ordenPrecioCliente = !ordenPrecioCliente;
        mostrarProductosCliente();
    });

    selectCategoria.addEventListener("change", () => {
        filtroCategoriaCliente = selectCategoria.value;
        mostrarProductosCliente();
    });

    // ======== GITHUB ========
    document.getElementById("btnGitHub").addEventListener("click", () => {
        formGitHub.style.display = "block";
    });

    document.getElementById("cancelarGitHubBtn").addEventListener("click", () => {
        formGitHub.style.display = "none";
        limpiarFormularioGitHub();
    });

    document.getElementById("agregarGitHubBtn").addEventListener("click", () => {
        const url = document.getElementById("urlGitHub").value.trim();
        const modelo = document.getElementById("modeloGitHub").value.trim();
        const precio = document.getElementById("precioGitHub").value.trim();
        const categoria = document.getElementById("categoriaGitHub").value;
        const descripcion = document.getElementById("descripcionGitHub").value.trim();

        if (!url || !modelo || !precio || !categoria) {
            alert("Completa todos los campos obligatorios");
            return;
        }

        if(!url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            alert("El link debe ser directo a la imagen (.jpg, .png, .webp, etc.)");
            return;
        }

        const imgTest = new Image();
        imgTest.onload = () => {
            productos.push({ modelo, precio, categoria, descripcion, foto: url });
            localStorage.setItem("productos", JSON.stringify(productos));
            mostrarProductosAdmin();
            mostrarProductosCliente();
            formGitHub.style.display = "none";
            limpiarFormularioGitHub();
        };
        imgTest.onerror = () => alert("No se puede acceder a la imagen. Verifica el link.");
        imgTest.src = url;
    });

    // ======== MOSTRAR INICIAL ========
    mostrarProductosAdmin();
    mostrarProductosCliente();
});
