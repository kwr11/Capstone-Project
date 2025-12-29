import os
import psycopg2
from psycopg2 import pool

DSN = (
    f"dbname={os.getenv('POSTGRES_DB')} "
    f"user={os.getenv('POSTGRES_USER')} "
    f"password={os.getenv('POSTGRES_PASSWORD')} "
    f"host=db "
    f"port=5432"
)

conn_pool = None


def get_pool():
    global conn_pool
    if conn_pool is None:
        conn_pool = pool.SimpleConnectionPool(minconn=1, maxconn=15, dsn=DSN)

    return conn_pool


def get_conn() -> psycopg2.extensions.connection:
    """open 1 of 5 connections from pool"""
    return get_pool().getconn()


def put_conn(conn):
    """put away a connection"""
    return get_pool().putconn(conn)
