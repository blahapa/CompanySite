#!/bin/bash
set -e

echo "Aplikuji databázové migrace..."
poetry run python manage.py migrate

echo "Spouštím Django backend server..."
poetry run python manage.py runserver &
BACKEND_PID=$!

# Nastaví trap, který zabije backend proces, když skript obdrží SIGINT (Ctrl+C) nebo EXIT
trap "echo 'Zastavuji backend proces...'; kill $BACKEND_PID" SIGINT SIGTERM EXIT

echo "Přepínám do složky frontend a spouštím vývojový server..."
cd frontend && npm run dev
