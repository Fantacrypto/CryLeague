-- =====================================================
-- COPIA E INCOLLA QUESTO SQL SU SUPABASE
-- Vai su: Supabase → SQL Editor → New Query → Incolla → Run
-- =====================================================

-- Tabella squadre
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  squadra TEXT NOT NULL,
  cryptos JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella giornate
CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  data_inizio TIMESTAMPTZ NOT NULL,
  data_fine TIMESTAMPTZ NOT NULL,
  stato TEXT DEFAULT 'scheduled',
  start_prices JSONB,
  end_prices JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella punteggi per giornata
CREATE TABLE IF NOT EXISTS round_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  score DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, team_id)
);

-- Permessi pubblici (necessari per il funzionamento)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutti possono leggere teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Tutti possono inserire teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono eliminare teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Tutti possono leggere rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Tutti possono modificare rounds" ON rounds FOR ALL USING (true);

CREATE POLICY "Tutti possono leggere scores" ON round_scores FOR SELECT USING (true);
CREATE POLICY "Tutti possono modificare scores" ON round_scores FOR ALL USING (true);
