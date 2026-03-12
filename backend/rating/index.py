"""Рейтинг игроков форума"""
import json
import os
import psycopg2

SCHEMA = "t_p60836273_gaming_forum_launch"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT id, username, avatar_emoji, xp, level, badge, posts_count
                    FROM {SCHEMA}.users
                    ORDER BY xp DESC
                    LIMIT 50"""
            )
            rows = cur.fetchall()
            cols = ["id", "username", "avatar_emoji", "xp", "level", "badge", "posts_count"]
            users = []
            for i, row in enumerate(rows):
                u = dict(zip(cols, row))
                u["rank"] = i + 1
                users.append(u)

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"users": users})}
    finally:
        conn.close()
