
# RapSub - Real-time Audio Subtitle Extension

## Overview
RapSub adalah ekstensi Chrome yang secara real-time menangkap audio dari video (YouTube, dll), mengirimkannya ke layanan Azure Cognitive Services Speech-to-Text, dan menampilkan subtitle langsung di layar.

## Fitur Utama
- Menangkap audio dari video.
- Streaming audio ke Azure Speech-to-Text melalui WebSocket.
- Menampilkan subtitle/caption secara real-time di atas video.


## Cara Instalasi (Development Mode)
### 1. Clone repository ini:
```bash 
git clone https://github.com/rapsign/RapSubEkstension.git
cd RapSubEkstension
```

### 2. Buka Chrome dan pergi ke ```chrome://extensions/```

### 3. Aktifkan Developer Mode (di kanan atas)

### 4. Klik Load unpacked, lalu pilih folder RapSubEkstension.

## Teknologi yang Digunakan

- JavaScript (Chrome Extension API)
- Node.js (backend WebSocket + Azure SDK)
- Azure Cognitive Services (Speech to Text)
- HTML + CSS (rendering subtitle)

## Contributors
- [Rinaldi A Prayuda](https://github.com/rapsign) - Software Developer  



