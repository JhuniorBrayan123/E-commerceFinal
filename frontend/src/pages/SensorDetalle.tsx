import React, { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { comentariosService, carritoService, sensoresService } from '../services/api';

const ProductoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [contenido, setContenido] = useState("");
  const [editando, setEditando] = useState(false);
  const [comentarioEdit, setComentarioEdit] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await sensoresService.getById(parseInt(id!));
        setProducto(res.data);
        const comRes = await comentariosService.getAll(parseInt(id!));
        setComentarios(comRes.data.results);
        
      } catch (error) {
        console.error('Error cargando producto:', error);

      } finally {
        setLoading(false);
      }
    };
    if (id) {

      fetchProducto();
    }
  }, [id]);

  const crearComentario = async () => {
    if (!contenido.trim()) return alert("El comentario no puede estar vacio");
  
    try {
      const data = {
        id_user: user.id,
        id_producto: producto.id,
        contenido,
      };
  
      await comentariosService.create(data);
      setContenido("");
  
      // Recargar comentarios
      const comRes = await comentariosService.getAll(producto.id);
      setComentarios(comRes.data.results);
  
    } catch (err) {
      console.error(err);
    }
  };

  const iniciarEdicion = (comentario: any) => {
    setEditando(true);
    setComentarioEdit(comentario);
    setContenido(comentario.contenido);
  };
  
  const cancelarEdicion = () => {
    setEditando(false);
    setComentarioEdit(null);
    setContenido("");
  };
  
  const guardarEdicion = async () => {
    try {
      await comentariosService.update(comentarioEdit.id, {
        contenido,
        id_user: comentarioEdit.id_user,
        id_producto: producto.id,
      });
  
      cancelarEdicion();
  
      const comRes = await comentariosService.getAll(producto.id);
      setComentarios(comRes.data.results);
  
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarComentario = async (id: number) => {
    if (!window.confirm("¿Eliminar comentario?")) return;
  
    try {
      await comentariosService.delete(id);
  
      const comRes = await comentariosService.getAll(producto.id);
      setComentarios(comRes.data.results);
  
    } catch (err) {
      console.error(err);
    }
  };
  

  const handleAgregarCarrito = () => {
    if (producto && cantidad > 0 && cantidad <= producto.stock) {
      carritoService.add(producto, cantidad, producto.stock);
      alert('Producto agregado al carrito');

      navigate('/carrito');
    } else {
      alert('Cantidad inválida o stock insuficiente');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }


  if (!producto) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <button
          onClick={() => navigate('/sensores')}
          className="text-primary-600 hover:text-primary-700"
        >
          Volver a productos
        </button>

      </div>
    );
  }

  return (

    <div className="max-w-6xl mx-auto">
      {/* Boton volver */}
      <button
        onClick={() => navigate('/sensores')}
        className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-2"
      >
        <span className="text-xl">←</span> Volver a productos
      </button>
  
      {/* Contenedor del producto */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
  
          {/* Imagen */}
          <div className="flex flex-col items-center">
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-[450px] object-cover rounded-2xl shadow-md"
              />
            ) : (
              <div className="w-full h-[450px] bg-gray-200 flex items-center justify-center rounded-2xl shadow-md">
                <span className="text-gray-400 text-xl">{producto.nombre}</span>
              </div>
            )}
          </div>
  
          {/* Info del producto */}
          <div>
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-gray-800">
              {producto.nombre}
            </h1>
  
            {/* Precio */}
            <div className="mb-6">
              <span className="text-5xl font-bold text-primary-600 block drop-shadow-sm">
                ${producto.precio}
              </span>
            </div>
  
            {/* Estado + categoria */}
            <div className="mb-6 flex items-center gap-4">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow ${
                  producto.stock > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {producto.stock > 0 ? "Disponible" : "No Disponible"}
              </span>
  
              <span className="text-gray-600 text-sm">
                Categoria: <span className="font-semibold">{producto.categoria_nombre}</span>
              </span>
            </div>
  
            {/* Descripcion */}
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              {producto.descripcion}
            </p>
  
            {/* ESPECIFICACIONES TECNICAS */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Especificaciones Tecnicas</h2>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
  
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Rango de Medicion</p>
                  <p className="font-semibold text-gray-800">{producto.rango_medicion}</p>
                </div>
  
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Precision</p>
                  <p className="font-semibold text-gray-800">{producto.precision}</p>
                </div>
  
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Alimentacion</p>
                  <p className="font-semibold text-gray-800">{producto.alimentacion}</p>
                </div>
  
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Protocolo de Comunicacion</p>
                  <p className="font-semibold text-gray-800">
                    {producto.protocolo_comunicacion}
                  </p>
                </div>
  
              </div>
            </div>
  
            {/* Selector de cantidad */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (Stock disponible: {producto.stock})
              </label>
  
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition shadow-sm"

                  disabled={cantidad <= 1}
                >
                  -
                </button>

  
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-xl text-center shadow-sm"
                  min="1"
                  max={producto.stock}
                />
  
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition shadow-sm"
                  disabled={cantidad >= producto.stock}

                >
                  +
                </button>
              </div>
            </div>

  
            {/* Subtotal */}
            <div className="mb-8">
              <p className="text-xl font-semibold text-gray-800">
                Subtotal: ${(producto.precio * cantidad).toFixed(2)}
              </p>
            </div>
  
            {/* Boton carrito */}
            <button
              onClick={handleAgregarCarrito}
              disabled={producto.stock === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-xl text-lg font-bold shadow-md hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
  
          </div>
        </div>
      </div>

      {/* COMENTARIOS */}
      <div className="mt-12 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Comentarios
        </h2>

        {/* Mostrar comentarios */}
        <div className="space-y-6 mb-10">
          {comentarios.length === 0 && (
            <p className="text-gray-500">Aun no hay comentarios.</p>
          )}

          {comentarios.map((c) => (
            <div key={c.id} className="p-5 bg-gray-50 rounded-2xl border shadow-sm">
              <div className="flex justify-between">
                <p className="text-gray-800">{c.contenido}</p>

                {/* Solo el autor puede editar/eliminar */}
                {c.id_user === user?.id && (
                  <div className="flex gap-3 text-sm">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => iniciarEdicion(c)}
                    >
                      Editar
                    </button>

                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => eliminarComentario(c.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(c.fecha_creacion).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* FORM para agregar/editar comentario */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">
            {editando ? "Editar Comentario" : "Escribir un Comentario"}
          </h3>

          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 h-28 mb-3"
            placeholder="Escribe tu comentario aquí..."
          />

          <button
            className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 mr-3"
            onClick={editando ? guardarEdicion : crearComentario}
          >
            {editando ? "Guardar Cambios" : "Publicar Comentario"}
          </button>

          {editando && (
            <button
              className="text-gray-600 hover:underline"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>


    </div>
  );
};

export default ProductoDetalle;


