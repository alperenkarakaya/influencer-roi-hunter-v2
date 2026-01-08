# Influencer ROI Hunter v2

Influencer kampanya analiz ve ROI hesaplama sistemi.

## Özellikler

- 🎯 Influencer keşfi ve analizi
- 📊 ROI hesaplama ve tahminleme
- 🤖 AI destekli sahte takipçi tespiti
- 📈 Kampanya performans takibi
- 📄 PDF rapor oluşturma
- 🔐 Güvenli JWT authentication

## Teknolojiler

### Backend
- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy
- Alembic
- Google Gemini AI

### Frontend
- Next.js / React
- TailwindCSS
- TypeScript

## Kurulum

### Gereksinimler

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Node.js 18+ (frontend için)

### Backend Kurulum

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# . env dosyasını düzenle
cp .env.example .env

# Database migration
alembic upgrade head

# Sunucuyu başlat
uvicorn main:app --reload