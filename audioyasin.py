import os
import requests
from concurrent.futures import ThreadPoolExecutor

# URL dasar
base_url = "https://everyayah.com/data/Nasser_Alqatami_128kbps/"

# Buat folder 'audio' jika belum ada
if not os.path.exists('audio'):
    os.makedirs('audio')

# Fungsi untuk mendownload satu ayat
def download_ayah(ayah_number):
    padded_number = str(ayah_number).zfill(3)
    url = f"{base_url}036{padded_number}.mp3"
    filename = f"audio/036{padded_number}.mp3"
    
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: 036{padded_number}.mp3")
    else:
        print(f"Failed to download: 036{padded_number}.mp3")

# Gunakan ThreadPoolExecutor untuk mendownload secara paralel
with ThreadPoolExecutor(max_workers=10) as executor:
    # Surat Yasin memiliki 83 ayat
    executor.map(download_ayah, range(1, 84))

print("Download selesai.")