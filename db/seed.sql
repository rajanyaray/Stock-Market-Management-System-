-- Seed sample stocks data
INSERT INTO stocks (symbol, name, current_price) VALUES
  ('RELIANCE', 'Reliance Industries', 2850.50),
  ('TCS', 'Tata Consultancy Services', 3650.75),
  ('INFY', 'Infosys Limited', 1890.25),
  ('WIPRO', 'Wipro Limited', 550.80),
  ('HDFC', 'HDFC Bank Limited', 1825.60),
  ('ICICI', 'ICICI Bank Limited', 980.40),
  ('SBIN', 'State Bank of India', 645.15),
  ('LT', 'Larsen & Toubro', 2950.30),
  ('MARUTI', 'Maruti Suzuki', 9850.20),
  ('BAJAJ', 'Bajaj Auto', 4520.75)
ON CONFLICT (symbol) DO NOTHING;
