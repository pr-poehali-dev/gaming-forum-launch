"""Темы и посты форума Stalshield.
action=list | categories | create | get | reply"""
import json
import os
import psycopg2

SCHEMA = "t_p60836273_gaming_forum_launch"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_from_token(conn, token: str):
    if not token:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT u.id, u.username, u.avatar_emoji, u.level, u.badge
                FROM {SCHEMA}.users u
                JOIN {SCHEMA}.sessions s ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            return None
        return dict(zip(["id", "username", "avatar_emoji", "level", "badge"], row))


def fmt_dt(val):
    return val.isoformat() if val and hasattr(val, "isoformat") else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers", {})
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token", "")
    qp = event.get("queryStringParameters") or {}
    action = qp.get("action", "list")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    try:
        user = get_user_from_token(conn, token)

        # GET categories
        if action == "categories":
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, name, description, icon, color, topics_count FROM {SCHEMA}.categories ORDER BY id")
                rows = cur.fetchall()
                cats = [dict(zip(["id", "name", "description", "icon", "color", "topics_count"], r)) for r in rows]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"categories": cats})}

        # GET list
        if action == "list":
            limit = int(qp.get("limit", 20))
            offset = int(qp.get("offset", 0))
            category_id = qp.get("category_id")

            with conn.cursor() as cur:
                base = f"""
                    SELECT t.id, t.title, t.content, t.views, t.replies_count, t.is_hot,
                           t.created_at, t.category_id,
                           u.username, u.avatar_emoji,
                           c.name as category_name
                    FROM {SCHEMA}.topics t
                    JOIN {SCHEMA}.users u ON u.id = t.author_id
                    LEFT JOIN {SCHEMA}.categories c ON c.id = t.category_id
                """
                if category_id:
                    cur.execute(base + " WHERE t.category_id = %s ORDER BY t.created_at DESC LIMIT %s OFFSET %s",
                                (category_id, limit, offset))
                else:
                    cur.execute(base + " ORDER BY t.created_at DESC LIMIT %s OFFSET %s", (limit, offset))

                rows = cur.fetchall()
                cols = ["id", "title", "content", "views", "replies_count", "is_hot", "created_at", "category_id", "author", "avatar", "category_name"]
                topics = []
                for row in rows:
                    t = dict(zip(cols, row))
                    t["created_at"] = fmt_dt(t["created_at"])
                    topics.append(t)

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"topics": topics})}

        # POST create
        if action == "create":
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нужно войти"})}

            title = (body.get("title") or "").strip()
            content = (body.get("content") or "").strip()
            category_id = body.get("category_id")

            if not title or not content:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заголовок и текст обязательны"})}

            with conn.cursor() as cur:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.topics (title, content, author_id, category_id)
                        VALUES (%s, %s, %s, %s) RETURNING id""",
                    (title, content, user["id"], category_id or None)
                )
                topic_id = cur.fetchone()[0]

                if category_id:
                    cur.execute(
                        f"UPDATE {SCHEMA}.categories SET topics_count = topics_count + 1 WHERE id = %s",
                        (category_id,)
                    )
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET xp = xp + 10, posts_count = posts_count + 1 WHERE id = %s",
                    (user["id"],)
                )
                conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "topic_id": topic_id})}

        # GET get
        if action == "get":
            topic_id = qp.get("id")
            if not topic_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужен id темы"})}

            with conn.cursor() as cur:
                cur.execute(
                    f"""SELECT t.id, t.title, t.content, t.views, t.replies_count, t.is_hot,
                               t.created_at, t.category_id,
                               u.username, u.avatar_emoji,
                               c.name as category_name
                        FROM {SCHEMA}.topics t
                        JOIN {SCHEMA}.users u ON u.id = t.author_id
                        LEFT JOIN {SCHEMA}.categories c ON c.id = t.category_id
                        WHERE t.id = %s""",
                    (topic_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Тема не найдена"})}

                cols = ["id", "title", "content", "views", "replies_count", "is_hot", "created_at", "category_id", "author", "avatar", "category_name"]
                topic = dict(zip(cols, row))
                topic["created_at"] = fmt_dt(topic["created_at"])

                cur.execute(f"UPDATE {SCHEMA}.topics SET views = views + 1 WHERE id = %s", (topic_id,))

                cur.execute(
                    f"""SELECT p.id, p.content, p.likes, p.created_at, u.username, u.avatar_emoji
                        FROM {SCHEMA}.posts p
                        JOIN {SCHEMA}.users u ON u.id = p.author_id
                        WHERE p.topic_id = %s ORDER BY p.created_at ASC""",
                    (topic_id,)
                )
                posts = []
                for pr in cur.fetchall():
                    po = dict(zip(["id", "content", "likes", "created_at", "author", "avatar"], pr))
                    po["created_at"] = fmt_dt(po["created_at"])
                    posts.append(po)

                conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"topic": topic, "posts": posts})}

        # POST reply
        if action == "reply":
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Нужно войти"})}

            topic_id = body.get("topic_id") or qp.get("id")
            content = (body.get("content") or "").strip()

            if not topic_id or not content:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "topic_id и content обязательны"})}

            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.posts (topic_id, author_id, content) VALUES (%s, %s, %s) RETURNING id",
                    (topic_id, user["id"], content)
                )
                post_id = cur.fetchone()[0]
                cur.execute(
                    f"UPDATE {SCHEMA}.topics SET replies_count = replies_count + 1, updated_at = NOW() WHERE id = %s",
                    (topic_id,)
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET xp = xp + 5, posts_count = posts_count + 1 WHERE id = %s",
                    (user["id"],)
                )
                conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "post_id": post_id})}

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи action: list | categories | create | get | reply"})}

    finally:
        conn.close()
