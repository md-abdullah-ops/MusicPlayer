import os
import json

audio_dir = "audio"
playlists = []

for folder in sorted(os.listdir(audio_dir)):
    folder_path = os.path.join(audio_dir, folder)
    if os.path.isdir(folder_path):
        tracks = []
        for file in sorted(os.listdir(folder_path)):
            if file.endswith(('.mp3', '.m4a', '.wav', '.ogg')):
                tracks.append({
                    "title": os.path.splitext(file)[0],
                    "file": f"audio/{folder}/{file}"
                })
        if tracks:
            playlists.append({
                "id": folder,
                "name": folder.replace('_', ' ').title(),
                "tracks": tracks
            })

with open('playlists.json', 'w') as f:
    json.dump({"playlists": playlists}, f, indent=2)

print("playlists.json created successfully!")