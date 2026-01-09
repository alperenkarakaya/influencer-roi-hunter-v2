import { useState, useEffect } from 'react'
import './App.css'

interface ApiResponse {
  message: string
  status: string
  docs: string
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('API bağlantı hatası:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="App">
      <h1>🎯 Influencer ROI Hunter</h1>
      <div className="card">
        <h2>Backend Durum</h2>
        {loading ? (
          <p>Bağlantı kontrol ediliyor...</p>
        ) : apiStatus ? (
          <div>
            <p style={{ color: 'green' }}>✅ {apiStatus.message}</p>
            <p>Durum: <strong>{apiStatus.status}</strong></p>
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="api-link"
            >
              📚 API Dokümantasyonu
            </a>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ Backend bağlantısı kurulamadı</p>
        )}
      </div>
      <div className="card">
        <h3>YouTube Influencer Analizi</h3>
        <p>YouTube API ile influencer analizi yapabilirsiniz</p>
        <button onClick={() => alert('Yakında aktif olacak!')}>
          Analiz Başlat
        </button>
      </div>
    </div>
  )
}

export default App
