import gdown
import zipfile
import os
import subprocess

# Downloading and extracting the HS code dataset from Google Drive
file_id = '1SXwUr191NsP9qyEod5AI9Go-oo5cGusP'
url = f'https://drive.google.com/uc?id={file_id}'
output = 'douane-hs-ai.zip'

gdown.download(url, output, quiet=False)

with zipfile.ZipFile(output, 'r') as zip_ref:
    zip_ref.extractall(os.path.dirname(output))

os.remove(output)

print("✅ HS code Dataset downloaded and extracted successfully.")


# Downloading the Tree HS code dataset from Google Drive folder
folder_url = 'https://drive.google.com/drive/folders/1-Xkj5Ay_L_Yupa7VJfiFN3rRzifCTd28?usp=sharing'
subprocess.run(['gdown', '--folder', folder_url])

print("✅ Tree HS code Dataset downloaded successfully from Google Drive folder.")


# Downloading the second dataset from Google Drive folder
folder_url_2 = 'https://drive.google.com/drive/folders/1eLy2d4enGIlNbl3A-eH1eGIN_t3CnE4f?usp=sharing'
subprocess.run(['gdown', '--folder', folder_url_2])

print("✅ Dataset downloaded successfully from Google Drive folder.")