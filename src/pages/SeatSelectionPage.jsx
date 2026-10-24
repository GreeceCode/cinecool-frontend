import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SeatSelectionPage() {
  const [funciones, setFunciones] = useState([]);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
  const [asientos, setAsientos] = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // 1. Cargar las funciones disponibles al montar la vista
  useEffect(() => {
    api.get('/reservations/functions') // Ajusta la ruta según tu backend
      .then(res => setFunciones(res.data))
      .catch(err => console.error("Error al cargar funciones:", err));
  }, []);

  // 2. Cargar los asientos cuando el usuario elige una función
  const handleSeleccionarFuncion = (funcion) => {
    setFuncionSeleccionada(funcion);
    setAsientosSeleccionados([]);
    api.get(`/reservations/seats/${funcion.id_funcion}`)
      .then(res => setAsientos(res.data))
      .catch(err => console.error("Error al cargar asientos:", err));
  };

  // 3. Manejar la selección o deselección de un asiento
  const toggleAsiento = (asiento) => {
    if (asiento.estado === 'ocupado') return; // Si ya está ocupado, no se toca
    
    if (asientosSeleccionados.includes(asiento.id_asiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter(id => id !== asiento.id_asiento));
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, asiento.id_asiento]);
    }
  };

  // 4. Enviar la compra al endpoint de Checkout que armaste
  const handleCheckout = () => {
    if (asientosSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un asiento.");
      return;
    }

    const payload = {
      id_usuario: 1, // Aquí puedes cambiarlo luego por el ID del usuario logueado
      id_funcion: funcionSeleccionada.id_funcion,
      asientos: asientosSeleccionados
    };

    api.post('/reservations/checkout', payload)
      .then(res => {
        setMensaje("¡Reserva y compra realizada con éxito! 🎉");
        // Recargar los asientos para actualizar los estados a ocupados
        handleSeleccionarFuncion(funcionSeleccionada);
        setAsientosSeleccionados([]);
      })
      .catch(err => {
        console.error("Error en el checkout:", err);
        setMensaje("Hubo un error al procesar la reserva.");
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">🎬 CineCool - Selección de Asientos</h1>

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center font-medium">
          {mensaje}
        </div>
      )}

      {/* Paso 1: Elegir Función */}
      {!funcionSeleccionada ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecciona una función:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funciones.map(f => (
              <div key={f.id_funcion} className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
                <p className="font-bold text-lg">{f.pelicula}</p>
                <p className="text-gray-600">Sala: {f.sala} | Hora: {f.horario}</p>
                <p className="text-indigo-600 font-semibold mt-2">Precio: S/. {f.precio}</p>
                <button 
                  onClick={() => handleSeleccionarFuncion(f)}
                  className="mt-3 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                  Elegir Asientos
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Paso 2: Elegir Asientos */}
          <button 
            onClick={() => setFuncionSeleccionada(null)}
            className="mb-4 text-sm text-indigo-600 hover:underline"
          >
            ← Volver a funciones
          </button>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Función: {funcionSeleccionada.pelicula}</h2>
            <p className="text-gray-600 mb-4">Sala: {funcionSeleccionada.sala} - Selecciona tus butacas:</p>
            
            {/* Pantalla del Cine */}
            <div className="w-full bg-gray-300 h-8 rounded mb-8 flex items-center justify-center text-xs text-gray-700 font-bold tracking-widest uppercase">
              Pantalla
            </div>

            {/* Cuadrícula de Asientos */}
            <div className="grid grid-cols-6 gap-3 max-w-md mx-auto mb-6">
              {asientos.map(a => {
                const isSelected = asientosSeleccionados.includes(a.id_asiento);
                const isOccupied = a.estado === 'ocupado';

                let bgColor = "bg-gray-200 hover:bg-gray-300 text-gray-800";
                if (isOccupied) bgColor = "bg-red-400 text-white cursor-not-allowed";
                if (isSelected) bgColor = "bg-indigo-600 text-white";

                return (
                  <button
                    key={a.id_asiento}
                    onClick={() => toggleAsiento(a)}
                    disabled={isOccupied}
                    className={`py-2 rounded font-bold text-sm transition ${bgColor}`}
                  >
                    {a.numero_asiento}
                  </button>
                );
              })}
            </div>

            {/* Botón de Pago / Checkout */}
            <div className="text-center">
              <button 
                onClick={handleCheckout}
                disabled={asientosSeleccionados.length === 0}
                className={`px-6 py-3 rounded-lg text-white font-bold transition ${
                  asientosSeleccionados.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg'
                }`}
              >
                Comprar / Reservar ({asientosSeleccionados.length} asientos)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}