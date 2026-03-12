CREATE TABLE IF NOT EXISTS t_p60836273_gaming_forum_launch.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_emoji VARCHAR(10) DEFAULT '🎮',
  bio TEXT DEFAULT '',
  favorite_game VARCHAR(100) DEFAULT '',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badge VARCHAR(20) DEFAULT 'newcomer',
  posts_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);