import gdown
import zipfile
import os

file_id = '1K3H8es4Tg6TW5fNuVCw5ahjqQwI8dQtd'
url = f'https://drive.google.com/uc?id={file_id}'
output = 'faiss_index_bot.zip'

gdown.download(url, output, quiet=False)

with zipfile.ZipFile(output, 'r') as zip_ref:
    zip_ref.extractall(os.path.dirname(output))

os.remove(output)

print("✅ Dataset downloaded and extracted successfully.")
