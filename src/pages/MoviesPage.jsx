import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './MoviesPage.css'

const MONEDA = 'S/'
const FORM_VACIO = {
  titulo: '',
  genero: '',
  duracion: '',
  clasificacion: '',
  fecha_estreno: '',
}

const mensajeError = (err, porDefecto) => err.response?.data?.message || porDefecto

const formatearFechaHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString('es-PE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const formatearFecha = (valor) => {
  if (!valor) return ''
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}

const formatearPrecio = (valor) => `${MONEDA} ${Number(valor).toFixed(2)}`

function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="movies-overlay" onClick={onClose}>
      <div
        className="movies-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="movies-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

function MovieCard({ movie, onDetalle, onEditar, onEliminar }) {
  const tono = (movie.id_pelicula * 47) % 360

  return (
    <article className="movies-card">
      <div
        className="movies-poster"
        style={{ background: `hsl(${tono} 55% 38%)` }}
        aria-hidden="true"
      >
        {movie.titulo.charAt(0).toUpperCase()}
      </div>
      <div className="movies-card-body">
        <h3>{movie.titulo}</h3>
        <p className="movies-meta">
          {movie.genero} · {movie.duracion} min ·{' '}
          <span className="movies-badge">{movie.clasificacion}</span>
        </p>
        {movie.proxima_funcion && (
          <p className="movies-meta">
            Próxima función: {formatearFechaHora(movie.proxima_funcion)}
          </p>
        )}
        {movie.precio_desde != null && (
          <p className="movies-meta">Desde {formatearPrecio(movie.precio_desde)}</p>
        )}
        <div className="movies-actions">
          <button
            type="button"
            className="movies-btn movies-btn-primary"
            onClick={() => onDetalle(movie.id_pelicula)}
          >
            Ver detalle
          </button>
          <button type="button" className="movies-btn" onClick={() => onEditar(movie)}>
            Editar
          </button>
          <button
            type="button"
            className="movies-btn movies-btn-danger"
            onClick={() => onEliminar(movie)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

function DetalleModal({ id, onClose }) {
  const [movie, setMovie] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    api
      .get(`/movies/${id}`)
      .then((res) => {
        if (!cancelado) setMovie(res.data)
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err, 'No se pudo cargar el detalle'))
      })
    return () => {
      cancelado = true
    }
  }, [id])

  return (
    <Modal titulo="Detalle de la película" onClose={onClose}>
      {error && <div className="movies-error">{error}</div>}
      {!movie && !error && <p>Cargando…</p>}
      {movie && (
        <>
          <h2>{movie.titulo}</h2>
          <p className="movies-meta">
            {movie.genero} · {movie.duracion} min ·{' '}
            <span className="movies-badge">{movie.clasificacion}</span>
          </p>
          <p className="movies-meta">Estreno: {formatearFecha(movie.fecha_estreno)}</p>

          <h3 className="movies-subtitulo">Funciones disponibles</h3>
          {movie.funciones.length === 0 ? (
            <p className="movies-meta">No hay funciones programadas.</p>
          ) : (
            <ul className="movies-funciones">
              {movie.funciones.map((f) => (
                <li key={f.id_funcion}>
                  <span>
                    <strong>{formatearFechaHora(f.fecha_hora)}</strong>
                    <br />
                    {f.sala} ({f.tipo_sala}) · {f.asientos_disponibles} asientos libres
                  </span>
                  <span className="movies-precio">{formatearPrecio(f.precio)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  )
}

function FormularioPelicula({ pelicula, generos, onGuardar, onClose }) {
  const editando = Boolean(pelicula)
  const [form, setForm] = useState(
    pelicula
      ? {
          titulo: pelicula.titulo,
          genero: pelicula.genero,
          duracion: String(pelicula.duracion),
          clasificacion: pelicula.clasificacion,
          fecha_estreno: pelicula.fecha_estreno,
        }
      : FORM_VACIO
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await onGuardar({ ...form, duracion: Number(form.duracion) })
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la película'))
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={editando ? 'Editar película' : 'Nueva película'} onClose={onClose}>
      <h2>{editando ? 'Editar película' : 'Nueva película'}</h2>
      <form className="movies-form" onSubmit={enviar}>
        <label>
          Título
          <input
            className="movies-input"
            name="titulo"
            value={form.titulo}
            onChange={cambiar}
            maxLength={150}
            required
          />
        </label>
        <label>
          Género
          <input
            className="movies-input"
            name="genero"
            value={form.genero}
            onChange={cambiar}
            list="movies-generos"
            maxLength={50}
            required
          />
          <datalist id="movies-generos">
            {generos.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <div className="movies-form-fila">
          <label>
            Duración (min)
            <input
              className="movies-input"
              type="number"
              name="duracion"
              min="1"
              value={form.duracion}
              onChange={cambiar}
              required
            />
          </label>
          <label>
            Clasificación
            <input
              className="movies-input"
              name="clasificacion"
              value={form.clasificacion}
              onChange={cambiar}
              placeholder="Ej: +14"
              maxLength={20}
              required
            />
          </label>
        </div>
        <label>
          Fecha de estreno
          <input
            className="movies-input"
            type="date"
            name="fecha_estreno"
            value={form.fecha_estreno}
            onChange={cambiar}
            required
          />
        </label>

        {error && <div className="movies-error">{error}</div>}

        <div className="movies-actions">
          <button
            type="submit"
            className="movies-btn movies-btn-primary"
            disabled={guardando}
          >
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar'}
          </button>
          <button type="button" className="movies-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function MoviesPage() {
  const [modo, setModo] = useState('cartelera') // 'cartelera' | 'todas'
  const [peliculas, setPeliculas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [genero, setGenero] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [detalleId, setDetalleId] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [peliculaEditar, setPeliculaEditar] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const ruta = modo === 'cartelera' ? '/movies/cartelera' : '/movies'
      const res = await api.get(ruta)
      setPeliculas(res.data)
    } catch (err) {
      setError(
        mensajeError(
          err,
          'No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 4000?'
        )
      )
      setPeliculas([])
    } finally {
      setCargando(false)
    }
  }, [modo])

  useEffect(() => {
    cargar()
  }, [cargar])

  const generos = useMemo(
    () => [...new Set(peliculas.map((p) => p.genero))].sort((a, b) => a.localeCompare(b)),
    [peliculas]
  )

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return peliculas.filter(
      (p) =>
        (!genero || p.genero === genero) &&
        (!texto || p.titulo.toLowerCase().includes(texto))
    )
  }, [peliculas, genero, busqueda])

  const cambiarModo = (nuevo) => {
    setModo(nuevo)
    setGenero('')
  }

  const cerrarDetalle = useCallback(() => setDetalleId(null), [])
  const cerrarForm = useCallback(() => {
    setFormAbierto(false)
    setPeliculaEditar(null)
  }, [])

  const abrirNueva = () => {
    setPeliculaEditar(null)
    setFormAbierto(true)
  }

  const abrirEditar = (movie) => {
    setPeliculaEditar(movie)
    setFormAbierto(true)
  }

  // Lanza el error hacia el formulario para que lo muestre.
  const guardar = async (datos) => {
    const esNueva = !peliculaEditar
    if (esNueva) {
      await api.post('/movies', datos)
    } else {
      await api.put(`/movies/${peliculaEditar.id_pelicula}`, datos)
    }
    cerrarForm()
    if (esNueva && modo !== 'todas') {

      cambiarModo('todas')
    } else {
      await cargar()
    }
  }

  const eliminar = async (movie) => {
    const confirmado = window.confirm(
      `¿Eliminar "${movie.titulo}"? También se borrarán sus funciones y las compras asociadas.`
    )
    if (!confirmado) return
    try {
      await api.delete(`/movies/${movie.id_pelicula}`)
      await cargar()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar la película'))
    }
  }

  const mensajeVacio =
    peliculas.length > 0
      ? 'Ninguna película coincide con los filtros.'
      : modo === 'cartelera'
        ? 'No hay películas en cartelera por ahora.'
        : 'Aún no hay películas registradas.'

  return (
    <main className="movies-page">
      <header className="movies-header">
        <h1>Cartelera</h1>
        <button type="button" className="movies-btn movies-btn-primary" onClick={abrirNueva}>
          + Nueva película
        </button>
      </header>

      <div className="movies-toolbar">
        <div className="movies-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'cartelera'}
            className={`movies-tab ${modo === 'cartelera' ? 'activo' : ''}`}
            onClick={() => cambiarModo('cartelera')}
          >
            En cartelera
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'todas'}
            className={`movies-tab ${modo === 'todas' ? 'activo' : ''}`}
            onClick={() => cambiarModo('todas')}
          >
            Todas
          </button>
        </div>

        <select
          className="movies-input"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          aria-label="Filtrar por género"
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          type="search"
          className="movies-input"
          placeholder="Buscar por título"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar por título"
        />
      </div>

      {error && (
        <div className="movies-error" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="movies-vacio">Cargando películas…</p>
      ) : filtradas.length === 0 ? (
        !error && <p className="movies-vacio">{mensajeVacio}</p>
      ) : (
        <section className="movies-grid">
          {filtradas.map((movie) => (
            <MovieCard
              key={movie.id_pelicula}
              movie={movie}
              onDetalle={setDetalleId}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
          ))}
        </section>
      )}

      {detalleId && <DetalleModal id={detalleId} onClose={cerrarDetalle} />}

      {formAbierto && (
        <FormularioPelicula
          pelicula={peliculaEditar}
          generos={generos}
          onGuardar={guardar}
          onClose={cerrarForm}
        />
      )}
    </main>
  )
}
