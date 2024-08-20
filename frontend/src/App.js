import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_KEY = '******************';
const NEWS_API_KEY = process.env.REACT_APP_NEWSAPI_KEY;
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const mapStyles = {
  height: "100%",
  width: "100%"
};

const defaultCenter = {
  lat: -1.831239,
  lng: -78.183406
};

function App() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [news, setNews] = useState([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [newsError, setNewsError] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('http://localhost:3000/locations');
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations", error);
      }
    };

    const fetchNews = async () => {
      try {
        const url = `https://newsapi.org/v2/everything?q=Apple&from=2024-08-16&sortBy=popularity&apiKey=${NEWS_API_KEY}`;
        const response = await axios.get(url);
        setNews(response.data.articles);
      } catch (error) {
        console.error("Error fetching news", error);
        setNewsError("No se pudieron cargar las noticias.");
      }
    };

    const fetchPhoto = async () => {
      try {
        const url = `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`;
        const response = await axios.get(url);
        setPhotoUrl(response.data.urls.regular);
      } catch (error) {
        console.error("Error fetching photo", error);
        setPhotoError("No se pudo cargar la foto del día.");
      }
    };

    fetchData();
    fetchNews();
    fetchPhoto();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row my-4">
        <div className="col-md-12 text-center">
          <h1>Mapa de Instituciones Educativas</h1>
        </div>
      </div>
      <div className="row" style={{ height: '80vh' }}>
        {/* Panel izquierdo con noticias y foto */}
        <div className="col-md-3" style={{ borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <div className="card mb-3">
            <div className="card-body">
              <h4>Últimas Noticias</h4>
              {newsError ? (
                <p>{newsError}</p>
              ) : (
                <ul>
                  {news.length > 0 ? (
                    news.map((article, index) => (
                      <li key={index}>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </li>
                    ))
                  ) : (
                    <p>No hay noticias disponibles.</p>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Foto del Día</h4>
              {photoError ? (
                <p>{photoError}</p>
              ) : (
                photoUrl ? (
                  <img src={photoUrl} alt="Foto del día" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                  <p>No hay foto disponible.</p>
                )
              )}
            </div>
          </div>
        </div>
        {/* Sección derecha con el mapa */}
        <div className="col-md-9">
          <div className="card h-100">
            <div className="card-body p-0 h-100">
              <LoadScript googleMapsApiKey={API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapStyles}
                  zoom={6}
                  center={defaultCenter}
                >
                  {locations.map(location => (
                    <Marker 
                      key={location.COD_AMIE} 
                      position={{ lat: location.X, lng: location.Y }} 
                      onClick={() => setSelectedLocation(location)}
                    />
                  ))}

                  {selectedLocation && (
                    <InfoWindow
                      position={{ lat: selectedLocation.X, lng: selectedLocation.Y }}
                      onCloseClick={() => setSelectedLocation(null)}
                    >
                      <div>
                        <h4>{selectedLocation.NOM_INSTIT}</h4>
                        <p>{selectedLocation.DPA_DESPAR}, {selectedLocation.DPA_DESCAN}</p>
                        {selectedLocation.weather && (
                          <div>
                            <p><strong>Temperature:</strong> {selectedLocation.weather.main.temp}°C</p>
                            <p><strong>Weather:</strong> {selectedLocation.weather.weather[0].description}</p>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-dark text-white text-center py-3 mt-4">
        <p className="mb-0">© 2024 - Derechos de autor</p>
      </footer>
    </div>
  );
}

export default App;
