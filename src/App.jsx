import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SeatSelectionPage from './pages/SeatSelectionPage';

function App() {
  const [currentView, setCurrentView] = useState('auth'); 

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#e50914', fontSize: '2.5rem', margin: '0' }}>CineCool 🎬</h1>
        <p style={{ color: '#6c757d' }}>Plataforma Integral de Cine</p>
        
        {/* Botones de navegación rápida */}
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={() => setCurrentView('auth')}
            style={{ marginRight: '10px', padding: '8px 16px', background: currentView === 'auth' ? '#e50914' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Login / Registro
          </button>
          <button 
            onClick={() => setCurrentView('seats')}
            style={{ padding: '8px 16px', background: currentView === 'seats' ? '#e50914' : '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Selección de Asientos (Mi Módulo)
          </button>
        </div>
      </header>

      <main>
        {currentView === 'auth' ? (
          <div>
            <LoginForm onSwitchToRegister={() => {}} />
          </div>
        ) : (
          <div>
            <SeatSelectionPage />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;