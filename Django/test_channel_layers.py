import os
import django
import psycopg2

# Ensure the settings module is set
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SinglePageApp.settings')

# Initialize Django
django.setup()

from django.conf import settings

def test_postgres_connection():
    try:
        conn = psycopg2.connect(
            dbname=settings.CHANNEL_LAYERS['default']['CONFIG']['database'],
            user=settings.CHANNEL_LAYERS['default']['CONFIG']['user'],
            password=settings.CHANNEL_LAYERS['default']['CONFIG']['password'],
            host=settings.CHANNEL_LAYERS['default']['CONFIG']['host'],
            port=settings.CHANNEL_LAYERS['default']['CONFIG']['port']
        )
        conn.close()
        print("PostgreSQL connection successful.")
    except Exception as e:
        print(f"PostgreSQL connection failed: {e}")

if __name__ == "__main__":
    test_postgres_connection()
