import { useState } from 'react';
import { loginUser } from '../services/api';

export default function LoginForm({ onSwitchToRegister, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        try {
            const data = await loginUser({ email, password });
            setMensaje(`¡Bienvenido de nuevo, ${data.user.nombre}! 🎬`);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirige automáticamente a la vista de películas tras 1 segundo
            setTimeout(() => {
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }, 1000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '380px', margin: '40px auto', padding: '25px', background: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500' }}>Correo Electrónico:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="ejemplo@correo.com"
                        required 
                        style={{ width: '100%', padding: '10px', marginTop: '6px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: '500' }}>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        required 
                        style={{ width: '100%', padding: '10px', marginTop: '6px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#e50914', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                    Ingresar
                </button>
            </form>

            {mensaje && <p style={{ color: '#28a745', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>{mensaje}</p>}
            {error && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                ¿No tienes una cuenta?{' '}
                <span onClick={onSwitchToRegister} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Regístrate aquí
                </span>
            </p>
        </div>
    );
}