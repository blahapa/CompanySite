#!/bin/bash

echo "Instaluji Python závislosti..."
poetry install || { echo "Chyba: Instalace Poetry závislostí selhala."; exit 1; }

echo "Přepínám do složky frontend..."
cd frontend || { echo "Chyba: Složka 'frontend' nenalezena."; exit 1; }

echo "Instaluji JavaScript závislosti..."
npm install || { echo "Chyba: Instalace NPM závislostí selhala."; exit 1; }

echo "Všechny závislosti nainstalovány úspěšně."