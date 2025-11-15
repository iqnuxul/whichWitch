-- whichWitch Database Schema for Supabase
-- Updated with ancestor chain support

-- Works table: stores all registered works
CREATE TABLE works (
    work_id BIGINT PRIMARY KEY,
    creator_address TEXT NOT NULL,
    parent_id BIGINT DEFAULT 0,
    ancestors JSONB DEFAULT '[]'::jsonb, -- Array of ancestor creator addresses ["0x123...", "0x456..."]
    license_fee TEXT NOT NULL, -- stored as string to handle big numbers
    derivative_allowed BOOLEAN NOT NULL DEFAULT true,
    metadata_uri TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX idx_works_creator ON works(creator_address);
CREATE INDEX idx_works_parent ON works(parent_id);
CREATE INDEX idx_works_created_at ON works(created_at DESC);
CREATE INDEX idx_works_ancestors ON works USING GIN (ancestors); -- For querying ancestors

-- Authorizations table: tracks who is authorized for which works
CREATE TABLE authorizations (
    id SERIAL PRIMARY KEY,
    work_id BIGINT NOT NULL REFERENCES works(work_id),
    user_address TEXT NOT NULL,
    license_fee TEXT NOT NULL,
    granted_at TIMESTAMP NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    UNIQUE(work_id, user_address)
);

-- Indexes
CREATE INDEX idx_auth_user ON authorizations(user_address);
CREATE INDEX idx_auth_work ON authorizations(work_id);

-- Revenue distributions table: tracks all revenue splits
CREATE TABLE revenue_distributions (
    id SERIAL PRIMARY KEY,
    work_id BIGINT NOT NULL REFERENCES works(work_id),
    recipients JSONB NOT NULL, -- [{address, amount}]
    total_amount TEXT NOT NULL,
    distributed_at TIMESTAMP NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL
);

-- Indexes
CREATE INDEX idx_revenue_work ON revenue_distributions(work_id);
CREATE INDEX idx_revenue_distributed_at ON revenue_distributions(distributed_at DESC);

-- Tips table: tracks all tips
CREATE TABLE tips (
    id SERIAL PRIMARY KEY,
    tipper_address TEXT NOT NULL,
    creator_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    tipped_at TIMESTAMP NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL
);

-- Indexes
CREATE INDEX idx_tips_creator ON tips(creator_address);
CREATE INDEX idx_tips_tipper ON tips(tipper_address);

-- Withdrawals table: tracks all withdrawals
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    creator_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    withdrawn_at TIMESTAMP NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL
);

-- Indexes
CREATE INDEX idx_withdrawals_creator ON withdrawals(creator_address);

-- Sync status table: tracks last synced block
CREATE TABLE sync_status (
    id SERIAL PRIMARY KEY,
    contract_name TEXT UNIQUE NOT NULL,
    last_synced_block BIGINT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert initial sync status
INSERT INTO sync_status (contract_name, last_synced_block) VALUES
    ('CreationManager', 0),
    ('AuthorizationManager', 0),
    ('PaymentManager', 0);

-- Views for common queries

-- View: Works with derivative count
CREATE VIEW works_with_stats AS
SELECT 
    w.*,
    COUNT(DISTINCT d.work_id) as derivative_count,
    COUNT(DISTINCT a.user_address) as authorization_count
FROM works w
LEFT JOIN works d ON d.parent_id = w.work_id
LEFT JOIN authorizations a ON a.work_id = w.work_id
GROUP BY w.work_id;

-- View: Creator earnings summary
CREATE VIEW creator_earnings AS
SELECT 
    creator_address,
    COUNT(DISTINCT work_id) as works_count,
    SUM(CASE WHEN parent_id = 0 THEN 1 ELSE 0 END) as original_works_count,
    SUM(CASE WHEN parent_id != 0 THEN 1 ELSE 0 END) as derivative_works_count
FROM works
GROUP BY creator_address;

-- Enable Row Level Security (RLS)
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow read access to all, write only via service role
CREATE POLICY "Allow public read access" ON works FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON authorizations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON revenue_distributions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tips FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON withdrawals FOR SELECT USING (true);
