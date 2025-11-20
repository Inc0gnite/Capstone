#!/bin/bash
# Script para regenerar package-lock.json si falta o está desincronizado
if [ ! -f "package-lock.json" ]; then
    echo "package-lock.json no encontrado, regenerando..."
    npm install --package-lock-only
fi

