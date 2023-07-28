#!/bin/bash

# Function to wait for the Postgres server to start up
wait_for_postgres() {
  echo "Waiting for Postgres to start..."
  while ! pg_isready -h $DATABASE_HOST -p $DATABASE_PORT -q -U $DATABASE_USER; do
    echo "$(date) - still waiting for Postgres..."
    sleep 1
  done
}

# Apply database migrations
wait_for_postgres
echo "Apply database migrations..."
python manage.py migrate

# Create admin
echo "Create superuser..."
python manage.py initadmin

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
