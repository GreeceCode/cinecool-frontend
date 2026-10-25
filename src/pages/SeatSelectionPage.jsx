import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SeatSelectionPage({ onNavigateToMovies }) {
  const [funciones, setFunciones] = useState([]);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
  const [asientos, setAsientos] = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [compraExitosa, setCompraExitosa] = useState(null);

  // 1. Cargar las funciones disponibles al montar la vista
  useEffect(() => {
    api.get('/reservations/functions')
      .then(res => setFunciones(res.data))
      .catch(err => console.error("Error al cargar funciones:", err));
  }, []);

  // 2. Cargar los asientos cuando el usuario elige una función
  const handleSeleccionarFuncion = (funcion) => {
    setFuncionSeleccionada(funcion);
    setAsientosSeleccionados([]);
    setCompraExitosa(null);
    api.get(`/reservations/seats/${funcion.id_funcion}`)
      .then(res => setAsientos(res.data))
      .catch(err => console.error("Error al cargar asientos:", err));
  };

  // 3. Manejar la selección o deselección de un asiento
  const toggleAsiento = (asiento) => {
    if (asiento.estado === 'Ocupado') return;
    
    if (asientosSeleccionados.includes(asiento.id_asiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter(id => id !== asiento.id_asiento));
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, asiento.id_asiento]);
    }
  };

  // 4. Enviar la compra al endpoint de Checkout
  const handleCheckout = () => {
    if (asientosSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un asiento.");
      return;
    }

    const precioUnitario = Number(funcionSeleccionada.precio);
    const total = asientosSeleccionados.length * precioUnitario;

    const itemsCompra = asientosSeleccionados.map(idAsiento => ({
      id_funcion: funcionSeleccionada.id_funcion,
      id_asiento: idAsiento,
      precio_unitario: precioUnitario,
      subtotal: precioUnitario
    }));

    const payload = {
      id_usuario: 1,
      total: total,
      metodo_pago: 'Tarjeta',
      itemsCompra: itemsCompra
    };

    api.post('/reservations/checkout', payload)
      .then(res => {
        setCompraExitosa({
          id_compra: res.data.id_compra || 'N/D',
          pelicula: funcionSeleccionada.pelicula,
          sala: funcionSeleccionada.sala,
          total: total,
          cantidadAsientos: asientosSeleccionados.length
        });
        setAsientosSeleccionados([]);
      })
      .catch(err => {
        console.error("Error en el checkout:", err);
        alert("Hubo un error al procesar la reserva.");
      });
  };

  // Agrupar los asientos por fila (ej. Fila A, B, C...) para mostrarlos ordenados
  const asientosPorFila = asientos.reduce((acc, asiento) => {
    const fila = asiento.fila || 'A';
    if (!acc[fila]) acc[fila] = [];
    acc[fila].push(asiento);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">🎬 CineCool - Selección de Asientos</h1>

      {compraExitosa ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg mx-auto border border-green-200">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">¡Gracias por tu compra!</h2>
          <p className="text-gray-600 mb-6">Tu reserva se ha procesado con éxito en CineCool.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 text-sm text-gray-700 space-y-2 border">
            <p><strong>N° de Ticket / Compra:</strong> #{compraExitosa.id_compra}</p>
            <p><strong>Película:</strong> {compraExitosa.pelicula}</p>
            <p><strong>Sala:</strong> {compraExitosa.sala}</p>
            <p><strong>Asientos reservados:</strong> {compraExitosa.cantidadAsientos}</p>
            <p className="text-base font-bold text-indigo-600 pt-2 border-t">Total Pagado: S/. {compraExitosa.total.toFixed(2)}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCompraExitosa(null);
                setFuncionSeleccionada(null);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Hacer otra reserva
            </button>
            
            {onNavigateToMovies && (
              <button
                onClick={onNavigateToMovies}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
              >
                Ver Cartelera (Películas)
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {!funcionSeleccionada ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona una función:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {funciones.map(f => (
                  <div key={f.id_funcion} className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
                    <p className="font-bold text-lg">{f.pelicula}</p>
                    <p className="text-gray-600">Sala: {f.sala} | Hora: {f.fecha_hora}</p>
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
              <button 
                onClick={() => setFuncionSeleccionada(null)}
                className="mb-4 text-sm text-indigo-600 hover:underline"
              >
                ← Volver a funciones
              </button>
              
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-2">Función: {funcionSeleccionada.pelicula}</h2>
                <p className="text-gray-600 mb-6">Sala: {funcionSeleccionada.sala} - Selecciona tus butacas:</p>
                
                {/* Pantalla del Cine Realista */}
                <div className="w-full bg-slate-800 text-white py-2 rounded-md mb-10 text-center text-xs font-bold tracking-widest uppercase shadow-md">
                  🖥️ Pantalla Principal
                </div>

                {/* Contenedor de Filas de Asientos */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  {Object.keys(asientosPorFila).map(fila => (
                    <div key={fila} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-gray-500 text-sm">{fila}</span>
                      <div className="flex gap-2">
                        {asientosPorFila[fila].map(a => {
                          const isSelected = asientosSeleccionados.includes(a.id_asiento);
                          const isOccupied = a.estado === 'Ocupado';

                          let bgColor = "bg-gray-200 hover:bg-gray-300 text-gray-800";
                          if (isOccupied) bgColor = "bg-red-400 text-white cursor-not-allowed";
                          if (isSelected) bgColor = "bg-indigo-600 text-white shadow-md scale-105";

                          return (
                            <button
                              key={a.id_asiento}
                              onClick={() => toggleAsiento(a)}
                              disabled={isOccupied}
                              className={`w-9 h-9 rounded-lg font-bold text-xs transition transform ${bgColor}`}
                              title={`Asiento ${a.fila}${a.numero}`}
                            >
                              {a.numero}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leyenda de Colores con separación perfecta */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px', color: '#555', marginBottom: '25px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginRight: '8px' }}></div>
                    <span>Disponible</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: '#4f46e5', borderRadius: '4px', marginRight: '8px' }}></div>
                    <span>Seleccionado</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: '#f87171', borderRadius: '4px', marginRight: '8px' }}></div>
                    <span>Ocupado</span>
                  </div>
                </div>

                {/* Botón de Pago / Checkout */}
                <div className="text-center">
                  <button 
                    onClick={handleCheckout}
                    disabled={asientosSeleccionados.length === 0}
                    className={`px-8 py-3 rounded-lg text-white font-bold transition shadow-md ${
                      asientosSeleccionados.length === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Comprar / Reservar ({asientosSeleccionados.length} asientos) - S/. {asientosSeleccionados.length * Number(funcionSeleccionada.precio)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}