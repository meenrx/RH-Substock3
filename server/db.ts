import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('substock.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      disp_no TEXT NOT NULL,
      drug_id TEXT NOT NULL,
      drug_name TEXT NOT NULL,
      lot_no TEXT,
      exp_date TEXT,
      pack_size INTEGER DEFAULT 1,
      qty INTEGER NOT NULL,
      price_per_unit REAL DEFAULT 0,
      department TEXT DEFAULT 'substock',
      user TEXT,
      transaction_type TEXT NOT NULL CHECK(transaction_type IN ('IN', 'OUT', 'ADJUST')),
      reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Formulary Table (Hospital Account)
  db.exec(`
    CREATE TABLE IF NOT EXISTS formulary (
      drug_id TEXT PRIMARY KEY,
      drug_name TEXT NOT NULL,
      min_stock INTEGER DEFAULT 0,
      cabinet TEXT,
      reorder_point INTEGER DEFAULT 0,
      shelf_location TEXT,
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE'))
    )
  `);

  // Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Audit Trail
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      user TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Expiry Ignore List
  db.exec(`
    CREATE TABLE IF NOT EXISTS expiry_ignore (
      drug_id TEXT,
      lot_no TEXT,
      PRIMARY KEY (drug_id, lot_no)
    )
  `);

  console.log('Database initialized successfully');
  seedData();
}

function seedData() {
  const stmt = db.prepare('SELECT count(*) as count FROM formulary');
  const result = stmt.get() as { count: number };
  
  if (result.count === 0) {
    console.log('Seeding initial data...');
    const insertFormulary = db.prepare(`
      INSERT INTO formulary (drug_id, drug_name, min_stock, cabinet, reorder_point, shelf_location)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const drugs = [
      ['D001', 'Paracetamol 500mg', 1000, 'A1', 500, '1-A'],
      ['D002', 'Amoxicillin 500mg', 500, 'A2', 200, '1-B'],
      ['D003', 'Omeprazole 20mg', 800, 'B1', 300, '2-A'],
      ['D004', 'Metformin 500mg', 1000, 'B2', 400, '2-B'],
      ['D005', 'Amlodipine 5mg', 600, 'C1', 200, '3-A'],
    ];

    drugs.forEach(drug => insertFormulary.run(...drug));

    // Seed some transactions
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (date, disp_no, drug_id, drug_name, lot_no, exp_date, pack_size, qty, price_per_unit, user, transaction_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    const pastDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

    insertTransaction.run(today, '68001', 'D001', 'Paracetamol 500mg', 'L001', nextYear, 100, 5000, 0.5, 'Admin', 'IN');
    insertTransaction.run(today, '68002', 'D002', 'Amoxicillin 500mg', 'L002', nextYear, 50, 2000, 1.2, 'Admin', 'IN');
    insertTransaction.run(today, '68003', 'D003', 'Omeprazole 20mg', 'L003', pastDate, 100, 500, 0.8, 'Admin', 'IN'); // Expired
  }
}

export { db };
