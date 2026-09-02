const { createClient } = require('@libsql/client');
require('dotenv').config({path: '.env.local'});
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function getPosts(sort, categoryFilter) {
  const currentUserId = -1;

  let orderByClause = 'ORDER BY RANDOM()';
  if (sort === 'newest')  orderByClause = 'ORDER BY p.created_at DESC';
  else if (sort === 'oldest')  orderByClause = 'ORDER BY p.created_at ASC';
  else if (sort === 'popular') orderByClause = 'ORDER BY like_count DESC, p.created_at DESC';
  else if (sort === 'random')  orderByClause = 'ORDER BY RANDOM()';

  const whereClause = categoryFilter ? 'WHERE p.category = ?' : '';
  const primaryArgs = [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId];
  if (categoryFilter) primaryArgs.push(categoryFilter);

  try {
    const result = await db.execute({
      sql: `
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
          p.title,
          p.content,
          p.category,
          COALESCE(p.views, 0)                     AS views,
          p.created_at,
          p.user_id,
          COALESCE(u.username, 'Usuario eliminado') AS username,
          COALESCE(u.role, 'user')                 AS author_role,
          COUNT(DISTINCT l.id)                     AS like_count,
          COALESCE(s.manual_posts, s.raw_posts, 0) AS author_posts,
          COALESCE(s.manual_likes, s.raw_likes, 0) AS author_likes,
          MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked,
          MAX(CASE WHEN f.follower_id = ? THEN 1 ELSE 0 END) AS is_following_author,
          MAX(CASE WHEN fav.user_id = ? THEN 1 ELSE 0 END) AS has_favorited
        FROM posts p
        LEFT JOIN users u        ON p.user_id = u.id
        LEFT JOIN likes l        ON p.id = l.post_id
        LEFT JOIN user_stats s   ON p.user_id = s.user_id
        LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = ?
        LEFT JOIN favorites fav  ON p.id = fav.post_id AND fav.user_id = ?
        ${whereClause}
        GROUP BY p.id
        ${orderByClause}
      `,
      args: primaryArgs,
    });
    console.log('Primary OK', result.rows.length);
  } catch (primaryErr) {
    console.error('Primary error:', primaryErr.message);

    const fallbackArgs = [currentUserId, currentUserId, currentUserId];
    if (categoryFilter) fallbackArgs.push(categoryFilter);

    try {
      const result = await db.execute({
        sql: `
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
            p.title,
            p.content,
            p.category,
            COALESCE(p.views, 0)                     AS views,
            p.created_at,
            p.user_id,
            COALESCE(u.username, 'Usuario eliminado') AS username,
            COALESCE(u.role, 'user')                 AS author_role,
            COUNT(DISTINCT l.id)                     AS like_count,
            COALESCE(s.manual_posts, s.raw_posts, 0) AS author_posts,
            COALESCE(s.manual_likes, s.raw_likes, 0) AS author_likes,
            MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked,
            MAX(CASE WHEN f.follower_id = ? THEN 1 ELSE 0 END) AS is_following_author,
            0 AS has_favorited
          FROM posts p
          LEFT JOIN users u        ON p.user_id = u.id
          LEFT JOIN likes l        ON p.id = l.post_id
          LEFT JOIN user_stats s   ON p.user_id = s.user_id
          LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = ?
          ${whereClause}
          GROUP BY p.id
          ${orderByClause}
        `,
        args: fallbackArgs,
      });
      console.log('Fallback OK', result.rows.length);
    } catch (fallbackErr) {
      console.error('Fallback error:', fallbackErr.message);
    }
  }
}

getPosts().then(() => console.log('Done'));
