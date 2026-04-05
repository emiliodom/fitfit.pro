import json
import os
import re
import time
import urllib.request
import urllib.parse
from pathlib import Path

# Configurar rutas
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'src' / 'data'
OUT_FILE = DATA_DIR / 'exerciseVideos.json'

def normalize(string):
    """
    Normaliza el string exactamente igual que en la app (React).
    Remueve paréntesis, pasa a minúsculas, quita espacios extra.
    """
    if not string: 
        return ""
    # Remover paréntesis
    s = re.sub(r'[\(\)]', '', str(string))
    # A minúsculas
    s = s.lower()
    # Múltiples espacios a uno solo
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def extract_keys():
    """
    Lee TODOS los archivos JSON de src/data y extrae
    nombres, titles, queries y videoQueries para buscar en YouTube.
    """
    keys = set()
    
    for path in DATA_DIR.glob('*.json'):
        if path.name in ['exerciseVideos.json', 'tabComponents.json']:
            continue
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Agarrar "query" y "videoQuery"
                for m in re.finditer(r'"(?:videoQ|q)uery"\s*:\s*"([^"]+)"', content):
                    keys.add(m.group(1))
                # Agarrar "name" (ej. Recetas, Ejercicios, Estiramiento)
                for m in re.finditer(r'"name"\s*:\s*"([^"]+)"', content):
                    keys.add(m.group(1))
                # Agarrar "title" (ej. Mindfulness, otros)
                for m in re.finditer(r'"title"\s*:\s*"([^"]+)"', content):
                    val = m.group(1)
                    if len(val) > 2:
                        keys.add(val)
        except Exception as e:
            print(f"Error leyendo {path.name}: {e}")
            
    return {normalize(k): k for k in keys if k}

def fetch_videos(query):
    """
    Hace un scrape básico a YouTube Search y extrae los primeros 3 videoIds 
    usando Expresiones Regulares sobre el HTML (ytInitialData).
    No requiere API Key.
    """
    print(f"🔍 Buscando: {query}")
    safe_query = urllib.parse.quote(query)
    url = f"https://www.youtube.com/results?search_query={safe_query}"
    
    # Engañar a YouTube haciéndonos pasar por un navegador normal
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    })
    
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # YouTube guarda los datos en un bloque JSON llamado ytInitialData dentro del HTML
            ids = []
            # Buscar el patrón "videoId":"abc123XYZ01"
            for match in re.finditer(r'"videoId":"([a-zA-Z0-9_-]{11})"', html):
                vid = match.group(1)
                if vid not in ids:
                    ids.append(vid)
                if len(ids) >= 3:
                    break
            return ids
    except Exception as e:
        print(f"  ❌ Error haciendo scrape de {query}: {e}")
        return []

def has_video_entries(entries):
    if not isinstance(entries, list):
        return False
    for entry in entries:
        if isinstance(entry, dict) and entry.get("videoId"):
            return True
    return False

def pick_query(existing_entries, fallback_query):
    if isinstance(existing_entries, list):
        for entry in existing_entries:
            if isinstance(entry, dict) and entry.get("query"):
                return entry.get("query")
    return fallback_query

def main():
    print(" Iniciando Scraper de YouTube sin dependencias ".center(60, "="))
    
    # 1. Cargar el exerciseVideos.json actual para no perder data y no sobreescribir lo que ya existe
    existing_data = {}
    if OUT_FILE.exists():
        try:
            with open(OUT_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"⚠ exerciseVideos.json no se pudo cargar bien: {e}")
            
    # 2. Extraer todas las combinaciones que la app usa
    keys_map = extract_keys()
    print(f"✅ Encontrados {len(keys_map)} ejercicios/rutinas únicos en la app.\n")
    
    updates = 0
    total = len(keys_map)
    current = 0
    
    # 3. Iterar y scrapear
    for norm_key, original_query in keys_map.items():
        current += 1
        
        # Ignorar los _comment u otras keys de metadata
        if norm_key == '_comment':
            continue
            
        # Si ya tiene videos útiles guardados, lo saltamos para ir más rápido
        existing_entries = existing_data.get(norm_key)
        if has_video_entries(existing_entries):
            print(f"[{current}/{total}] ⏭ Saltando '{original_query}', ya tiene videos.")
            continue

        # Buscar en YouTube (usar query guardada si existe)
        query = pick_query(existing_entries, original_query)
        vids = fetch_videos(query)
        if vids:
            entries = []
            for i, vid in enumerate(vids):
                # Asignamos labels (tutorial, técnica y errores comunes) para que empaten con la UI
                label = "formTutorial" if i == 0 else ("techniqueTips" if i == 1 else "commonMistakes")
                entries.append({
                    "videoId": vid,
                    "label": label
                })
            
            existing_data[norm_key] = entries
            updates += 1
            print(f"     ✅ Agregados {len(vids)} videos.")
            
            # Esperar 1.5s para que YouTube no nos bloquee (rate-limit)
            time.sleep(1.5)
        else:
            print(f"     ⚠ No se encontraron videos.")
            # Mantener query existentes si ya habia algo, para reintentar luego
            if norm_key not in existing_data:
                existing_data[norm_key] = []
            time.sleep(0.5)
            
        # Guardar progreso parcial cada 5 registros por si el script se detiene
        if updates > 0 and updates % 5 == 0:
            with open(OUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, indent=2)

    # 4. Guardado Final
    # Mantener el _comment al principio
    comment = existing_data.pop("_comment", "Database for YouTube direct videoIds per exercise and routine query.")
    final_dict = {"_comment": comment}
    # Ordenar alfabéticamente para mantenerlo limpio
    for k in sorted(existing_data.keys()):
        final_dict[k] = existing_data[k]

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_dict, f, indent=2)
        
    print("\n" + "="*60)
    print(f"¡Listo! Se actualizaron/agregaron {updates} entradas de video.")
    print(f"Archivo modificado: {OUT_FILE}")

if __name__ == '__main__':
    main()
