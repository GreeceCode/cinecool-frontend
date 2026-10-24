import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '30px 10px' }}>
      <header style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#e50914', fontSize: '2.5rem', margin: '0' }}>CineCool 🎬</h1>
        <p style={{ color: '#6c757d' }}>Sistema de Autenticación de Usuarios</p>
      </header>

      <main>
        {isLoginView ? (
          <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </main>
    </div>
  );
}

export default App;