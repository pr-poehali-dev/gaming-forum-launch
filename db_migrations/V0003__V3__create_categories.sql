CREATE TABLE IF NOT EXISTS t_p60836273_gaming_forum_launch.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(50) DEFAULT 'MessageSquare',
  color VARCHAR(20) DEFAULT '#a855f7',
  topics_count INTEGER DEFAULT 0
);