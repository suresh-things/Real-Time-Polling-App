-- Create the table to store vote counts if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
    option_id VARCHAR(255) PRIMARY KEY,
    vote_count INTEGER DEFAULT 0
);

-- Optional: You could pre-populate options here if desired,
-- but the API currently uses hardcoded options.
-- Example:
-- INSERT INTO votes (option_id, vote_count) VALUES ('python', 0) ON CONFLICT (option_id) DO NOTHING;
-- INSERT INTO votes (option_id, vote_count) VALUES ('go', 0) ON CONFLICT (option_id) DO NOTHING;
-- INSERT INTO votes (option_id, vote_count) VALUES ('rust', 0) ON CONFLICT (option_id) DO NOTHING;