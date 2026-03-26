#!/bin/bash

# Ensure we are in the correct directory if requirements.txt is in Backend/
if [ -f "Backend/requirements.txt" ]; then
    cd Backend
fi

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Starting gunicorn..."
gunicorn --bind=0.0.0.0 --timeout 600 core.wsgi
