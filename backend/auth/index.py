"""Авторизация: регистрация, вход, выход, получение профиля"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p60836273_gaming_forum_launch"

AVATARS = ["🎮", "⚡", "🔥", "⚔️", "🐺", "🏆", "🗺️", "🌟", "👑", "🎯", "🛡️", "🚀"]
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_user_from_token(conn, token: str):
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT u.* FROM {SCHEMA}.users u
                JOIN {SCHEMA}.sessions s ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            return None
        cols = [d[0] for d in cur.description]
        return dict(zip(cols, row))


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers", {})
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token", "")

    conn = get_conn()
    try:
        # POST /register
        if method == "POST" and path.endswith("/register"):
            body = json.loads(event.get("body") or "{}")
            username = (body.get("username") or "").strip()
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not username or not email or not password:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполни все поля"})}
            if len(username) < 3:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Никнейм минимум 3 символа"})}
            if len(password) < 6:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

            import random
            avatar = random.choice(AVATARS)
            pw_hash = hash_password(password)

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.users WHERE username = %s OR email = %s",
                    (username, email)
                )
                if cur.fetchone():
                    return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Никнейм или email уже занят"})}

                cur.execute(
                    f"""INSERT INTO {SCHEMA}.users (username, email, password_hash, avatar_emoji)
                        VALUES (%s, %s, %s, %s) RETURNING id""",
                    (username, email, pw_hash, avatar)
                )
                user_id = cur.fetchone()[0]

                session_token = secrets.token_hex(32)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                    (user_id, session_token)
                )
                conn.commit()

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({
                    "token": session_token,
                    "user": {"id": user_id, "username": username, "email": email, "avatar_emoji": avatar, "xp": 0, "level": 1, "badge": "newcomer", "posts_count": 0}
                })
            }

        # POST /login
        if method == "POST" and path.endswith("/login"):
            body = json.loads(event.get("body") or "{}")
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email or not password:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введи email и пароль"})}

            pw_hash = hash_password(password)
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, username, email, avatar_emoji, xp, level, badge, posts_count, bio, favorite_game FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                    (email, pw_hash)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

                cols = ["id", "username", "email", "avatar_emoji", "xp", "level", "badge", "posts_count", "bio", "favorite_game"]
                user = dict(zip(cols, row))

                session_token = secrets.token_hex(32)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                    (user["id"], session_token)
                )
                conn.commit()

            return {
                "statusCode": 200,
                "headers": CORS,
                "body": json.dumps({"token": session_token, "user": user})
            }

        # GET /me
        if method == "GET" and path.endswith("/me"):
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            user = get_user_from_token(conn, token)
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия устарела"})}
            user.pop("password_hash", None)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(user)}

        # PUT /profile
        if method == "PUT" and path.endswith("/profile"):
            if not token:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            user = get_user_from_token(conn, token)
            if not user:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия устарела"})}

            body = json.loads(event.get("body") or "{}")
            username = (body.get("username") or user["username"]).strip()
            bio = (body.get("bio") or "").strip()
            favorite_game = (body.get("favorite_game") or "").strip()
            avatar_emoji = (body.get("avatar_emoji") or user["avatar_emoji"]).strip()

            with conn.cursor() as cur:
                cur.execute(
                    f"""UPDATE {SCHEMA}.users SET username=%s, bio=%s, favorite_game=%s, avatar_emoji=%s
                        WHERE id=%s""",
                    (username, bio, favorite_game, avatar_emoji, user["id"])
                )
                conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "username": username, "bio": bio, "favorite_game": favorite_game, "avatar_emoji": avatar_emoji})}

        # POST /logout
        if method == "POST" and path.endswith("/logout"):
            if token:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
                    conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        conn.close()
