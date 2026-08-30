let productosGlobal = [];

async function cargarProductos() {
  const res = await fetch('/api/productos');
  productosGlobal = await res.json();
  renderTabla(productosGlobal);
}

function renderTabla(productos) {
  const tbody = document.querySelector('#tabla-productos tbody');
  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td><span class="badge">${p.categoria}</span></td>
      <td>Bs. ${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.unidades_vendidas}</td>
    </tr>`).join('');
  document.getElementById('contador').textContent = `${productos.length} productos`;
}

document.getElementById('buscador').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtrados = productosGlobal.filter(p =>
    p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
  );
  renderTabla(filtrados);
});

async function cargarDashboard() {
  const res = await fetch('/api/dashboard');
  const d = await res.json();

  document.getElementById('dashboard-cards').innerHTML = `
    <div class="stat-card"><div class="icon">&#128230;</div><h3>Total productos</h3><p>${d.total_productos}</p></div>
    <div class="stat-card"><div class="icon">&#128181;</div><h3>Precio promedio</h3><p>Bs. ${d.precio_promedio}</p></div>
    <div class="stat-card"><div class="icon">&#127991;&#65039;</div><h3>Mas economico</h3><p style="font-size:15px">${d.producto_mas_economico.nombre}</p></div>
    <div class="stat-card"><div class="icon">&#128142;</div><h3>Mas costoso</h3><p style="font-size:15px">${d.producto_mas_costoso.nombre}</p></div>
    <div class="stat-card"><div class="icon">&#128200;</div><h3>Stock total</h3><p>${d.stock_total}</p></div>
  `;

  document.querySelector('#tabla-economicos tbody').innerHTML =
    d.tres_mas_economicos.map(p => `<tr><td>${p.nombre}</td><td>Bs. ${Number(p.precio).toFixed(2)}</td></tr>`).join('');

  document.querySelector('#tabla-vendidos tbody').innerHTML =
    d.cinco_mas_vendidos.map(p => `<tr><td>${p.nombre}</td><td>${p.unidades_vendidas}</td></tr>`).join('');
}

cargarProductos();
cargarDashboard();
