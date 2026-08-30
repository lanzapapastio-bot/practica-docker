const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'quickorder',
  password: process.env.DB_PASSWORD || 'quickorder123',
  database: process.env.DB_NAME || 'quickorder_db',
});

async function waitForDb(retries = 20, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Conexion a la base de datos establecida.');
      return;
    } catch (err) {
      console.log(`Esperando base de datos... intento ${i}/${retries}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error('No se pudo conectar a la base de datos.');
  process.exit(1);
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const totalProductos = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
    const precioPromedio = await pool.query('SELECT ROUND(AVG(precio),2) AS promedio FROM productos');
    const masEconomico = await pool.query('SELECT * FROM productos ORDER BY precio ASC LIMIT 1');
    const masCostoso = await pool.query('SELECT * FROM productos ORDER BY precio DESC LIMIT 1');
    const tresEconomicos = await pool.query('SELECT * FROM productos ORDER BY precio ASC LIMIT 3');
    const cincoMasVendidos = await pool.query('SELECT * FROM productos ORDER BY unidades_vendidas DESC LIMIT 5');
    const stockTotal = await pool.query('SELECT SUM(stock)::int AS stock_total FROM productos');

    res.json({
      total_productos: totalProductos.rows[0].total,
      precio_promedio: precioPromedio.rows[0].promedio,
      producto_mas_economico: masEconomico.rows[0],
      producto_mas_costoso: masCostoso.rows[0],
      tres_mas_economicos: tresEconomicos.rows,
      cinco_mas_vendidos: cincoMasVendidos.rows,
      stock_total: stockTotal.rows[0].stock_total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular el dashboard' });
  }
});

const PORT = process.env.PORT || 5000;
waitForDb().then(() => {
  app.listen(PORT, () => console.log(`Backend escuchando en el puerto ${PORT}`));
});
