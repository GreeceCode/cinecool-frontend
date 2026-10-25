import { useState } from 'react';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import SeatSelectionPage from './pages/SeatSelectionPage';
import MoviesPage from './pages/MoviesPage';

function App() {
  const [currentView, setCurrentView] = useState('auth'); // 'auth', 'movies', 'seats'
  const [isLoginMode, setIsLoginMode] = useState(true);   // true para Login, false para Registro

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#e50914', fontSize: '2.5rem', margin: '0' }}>CineCool 🎬</h1>
        <p style={{ color: '#6c757d' }}>Plataforma Integral de Cine</p>
        
        {/* Botones de navegación rápida para la presentación */}
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={() => setCurrentView('auth')}
            style={{ marginRight: '10px', padding: '8px 16px', background: currentView === 'auth' ? '#e50914' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Login / Registro
          </button>

          <button 
            onClick={() => setCurrentView('movies')}
            style={{ marginRight: '10px', padding: '8px 16px', background: currentView === 'movies' ? '#e50914' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Películas (Prueba)
          </button>

          <button 
            onClick={() => setCurrentView('seats')}
            style={{ padding: '8px 16px', background: currentView === 'seats' ? '#e50914' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Selección de Asientos (Prueba)
          </button>
        </div>
      </header>

      <main>
        {/* Renderizado condicional según la vista activa */}
        {currentView === 'auth' && (
          <div>
            {isLoginMode ? (
              <LoginForm 
                onSwitchToRegister={() => setIsLoginMode(false)} 
                onLoginSuccess={() => setCurrentView('movies')} 
              />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
            )}
          </div>
        )}

        {currentView === 'movies' && <MoviesPage />}
        
        {currentView === 'seats' && (
          <SeatSelectionPage onNavigateToMovies={() => setCurrentView('movies')} />
        )}
      </main>
    </div>
  );
}

export default App;