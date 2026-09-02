const { createClient } = require('@libsql/client');
require('dotenv').config({path: '.env.local'});
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const q1 = `
        WITH user_stats AS (
          SELECT
            u.id AS user_id,
            u.manual_posts,
            u.manual_likes,
            COUNT(DISTINCT p_sub.id) AS raw_posts,
            COUNT(l_sub.id)          AS raw_likes
          FROM users u
          LEFT JOIN posts p_sub ON u.id = p_sub.user_id
          LEFT JOIN likes l_sub ON p_sub.id = l_sub.post_id
          GROUP BY u.id
        )
        SELECT
          p.id,
          p.title
        FROM posts p
        LEFT JOIN users u        ON p.user_id = u.id
        LEFT JOIN likes l        ON p.id = l.post_id
        LEFT JOIN user_stats s   ON p.user_id = s.user_id
        LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = -1
        LEFT JOIN favorites fav  ON p.id = fav.post_id AND fav.user_id = -1
        GROUP BY p.id
`;

const q2 = `
          WITH user_stats AS (
            SELECT
              u.id AS user_id,
              u.manual_posts,
            u.manual_likes,
            COUNT(DISTINCT p_sub.id) AS raw_posts,
            COUNT(l_sub.id)          AS raw_likes
            FROM users u
            LEFT JOIN posts p_sub ON u.id = p_sub.user_id
            LEFT JOIN likes l_sub ON p_sub.id = l_sub.post_id
            GROUP BY u.id
          )
          SELECT
            p.id,
            p.title
          FROM posts p
          LEFT JOIN users u        ON p.user_id = u.id
          LEFT JOIN likes l        ON p.id = l.post_id
          LEFT JOIN user_stats s   ON p.user_id = s.user_id
          LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = -1
          GROUP BY p.id
`;

async function test() {
  try {
    console.log('Testing Q1 (with favorites)...');
    let r1 = await db.execute(q1);
    console.log('Q1 OK', r1.rows.length);
  } catch (e) {
    console.error('Q1 ERROR:', e.message);
  }

  try {
    console.log('Testing Q2 (fallback without favorites)...');
    let r2 = await db.execute(q2);
    console.log('Q2 OK', r2.rows.length);
  } catch (e) {
    console.error('Q2 ERROR:', e.message);
  }
}
test();
