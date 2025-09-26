#!/bin/bash

# Script pentru instalarea aplicației pe Cloudron
echo "🚀 Instalare Vehicle Graphics Pricing pe Cloudron..."

# Verifică dacă Cloudron CLI este instalat
if ! command -v cloudron &> /dev/null; then
    echo "❌ Cloudron CLI nu este instalat. Instalează din: https://docs.cloudron.io/cli/"
    exit 1
fi

# Verifică dacă ești logat
if ! cloudron status &> /dev/null; then
    echo "❌ Nu ești logat în Cloudron. Rulează: cloudron login"
    exit 1
fi

echo "📦 Creez aplicația pe Cloudron..."

# Instalează aplicația ca Custom App
cloudron install --image cloudron/app:base \
    --location vehicle-graphics \
    --env VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --env VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"

echo "✅ Aplicația a fost instalată!"
echo "🌐 Accesează-o la: https://vehicle-graphics.your-cloudron-domain.com"
echo ""
echo "📝 Următorii pași:"
echo "1. Configurează variabilele de mediu în Cloudron Dashboard"
echo "2. Testează conexiunea la baza de date"
echo "3. Importă datele existente dacă este necesar"