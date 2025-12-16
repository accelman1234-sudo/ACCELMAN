// ================= ADMIN ================= 
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let indiceEditar = null;

// LOGIN
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

// AGREGAR USUARIO
function agregarUsuarioManual() {
    const user = document.getElementById("nuevoUsuario").value.trim();
    const pass = document.getElementById("nuevaPassword").value.trim();
    if(!user || !pass) { alert("Completa usuario y contraseña"); return; }
    if(user === ADMIN_USER || usuarios.find(u => u.user === user)) { alert("Usuario ya existe"); return; }

    usuarios.push({user, pass});
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Usuario agregado");

    document.getElementById("nuevoUsuario").value = "";
    document.getElementById("nuevaPassword").value = "";
}

// AGREGAR / EDITAR PRODUCTO
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

// MOSTRAR PRODUCTOS ADMIN
function mostrarProductosAdmin() {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";
    const categorias = ["Celulares","Cargadores","Fundas","Accesorios"];

    categorias.forEach(cat => {
        const productosCat = productos.filter(p => p.categoria===cat);
        if(productosCat.length===0) return;

        // Título categoría
        const titulo = document.createElement("h3");
        titulo.textContent = cat;
        titulo.style.color = "#ff6f61";
        titulo.style.marginBottom = "10px";
        contenedor.appendChild(titulo);

        // Grid de productos
        const grid = document.createElement("div");
        grid.classList.add("categoria-container");

        productosCat.forEach((p,index) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <img src="${p.foto}" alt="${p.modelo}">
                <div class="info">
                    <h4>${p.modelo}</h4>
                    <p>$${p.precio}</p>
                    <p>${p.descripcion||""}</p>
                </div>
                <button class="btn-editar" onclick="editarProducto(${index})">✏️ Editar</button>
                <button class="btn-borrar" onclick="borrarProducto(${index})">🗑 Borrar</button>
                <button class="btn-whatsapp" onclick="enviarWhatsApp('${p.modelo}','${p.foto}')">📲 WhatsApp</button>
            `;
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
}

// EXPORTAR EXCEL
function exportarExcel(){
    if(productos.length===0){ alert("No hay productos"); return; }
    let csv = "Categoria,Modelo,Precio,Descripcion,WhatsApp\n";
    productos.forEach(p=>{
        csv+=`"${p.categoria}","${p.modelo}","${p.precio}","${p.descripcion}","https://wa.me/5216146150041"\n`;
    });
    const blob = new Blob([csv], {type:"text/csv"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download="catalogo_productos.csv";
    link.click();
}

// WhatsApp
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

// ================= FUNCIONES =================
function mostrarProductosCliente() {
    productosCliente.innerHTML = "";
    let categorias = ["Celulares", "Cargadores", "Fundas", "Accesorios"];
    if (filtroCategoriaCliente) categorias = [filtroCategoriaCliente];

    categorias.forEach(cat => {
        let productosCat = productos.filter(p => p.categoria === cat);

        if (busquedaCliente) {
            productosCat = productosCat.filter(p => p.modelo.toLowerCase().includes(busquedaCliente));
        }

        productosCat.sort((a, b) => ordenPrecioCliente ? b.precio - a.precio : a.precio - b.precio);
        if (productosCat.length === 0) return;

        const h3 = document.createElement("h3");
        h3.textContent = cat;
        h3.style.color = "#ff6f61";
        h3.style.marginTop = "20px";
        h3.style.marginBottom = "10px";
        productosCliente.appendChild(h3);

        const grid = document.createElement("div");
        grid.classList.add("categoria-container");

        productosCat.forEach(p => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <img src="${p.foto}" alt="${p.modelo}">
                <div class="info">
                    <h4>${p.modelo}</h4>
                    <p>$${p.precio}</p>
                    <p>${p.descripcion||""}</p>
                </div>
                <button class="btn-whatsapp" onclick="enviarWhatsApp('${p.modelo}','${p.foto}')">📲 WhatsApp</button>
            `;
            grid.appendChild(card);
        });

        productosCliente.appendChild(grid);
    });
}

// ================= EVENTOS CLIENTE =================
document.addEventListener("DOMContentLoaded", () => {
    // Botón cliente desde login
    document.getElementById("btnClienteInicio").addEventListener("click", () => {
        document.getElementById("login-panel").style.display = "none";
        clientePanel.style.display = "block";
        busquedaCliente = "";
        filtroCategoriaCliente = "";
        ordenPrecioCliente = false;
        inputBusqueda.value = "";
        selectCategoria.value = "";
        mostrarProductosCliente();
    });

    // Botón regresar
    const btnRegresar = document.querySelector(".btn-cliente-regresar");
    if (btnRegresar) {
        btnRegresar.addEventListener("click", () => {
            clientePanel.style.display = "none";
            document.getElementById("login-panel").style.display = "block";
            busquedaCliente = "";
            filtroCategoriaCliente = "";
            ordenPrecioCliente = false;
            inputBusqueda.value = "";
            selectCategoria.value = "";
        });
    }

    // Botón buscar
    const btnBuscar = document.querySelector(".btn-cliente-buscar");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            busquedaCliente = inputBusqueda.value.toLowerCase();
            mostrarProductosCliente();
        });
    }

    // Botón ordenar
    const btnOrdenar = document.querySelector(".btn-cliente-ordenar");
    if (btnOrdenar) {
        btnOrdenar.addEventListener("click", () => {
            ordenPrecioCliente = !ordenPrecioCliente;
            mostrarProductosCliente();
        });
    }

    // Filtro de categoría
    if (selectCategoria) {
        selectCategoria.addEventListener("change", () => {
            filtroCategoriaCliente = selectCategoria.value;
            mostrarProductosCliente();
        });
    }
});

// ================= DATOS INICIALES =================
if(productos.length===0){
    productos=[
        { modelo:"iPhone 14", precio:25000, descripcion:"Celular Apple", categoria:"Celulares", foto:"iphone14.jpg" },
        { modelo:"Cargador Rápido", precio:450, descripcion:"Cargador USB", categoria:"Cargadores", foto:"cargador.jpg" },
        { modelo:"Funda Galaxy", precio:350, descripcion:"Funda protectora", categoria:"Fundas", foto:"funda.jpg" },
        { modelo:"Audífonos Bluetooth", precio:1200, descripcion:"Inalámbricos", categoria:"Accesorios", foto:"audifonos.jpg" }
    ];
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Mostrar admin al cargar
document.addEventListener("DOMContentLoaded", mostrarProductosAdmin);
