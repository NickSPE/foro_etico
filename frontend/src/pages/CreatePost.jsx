import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { AlertCircle, FileText, Send, Sparkles, Image as ImageIcon, X, Link as LinkIcon, Upload } from 'lucide-react';

const CreatePost = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  
  // Image states
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to login if user accesses page while unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        setCategories(data || []);
        if (data && data.length > 0) {
          setCategoriaId(data[0].id); // Select first by default
        }
      } catch (error) {
        console.error('Error fetching categories for post creation:', error);
      }
    };
    fetchCategories();
  }, []);

  // Pre-populate fields from navigation state (when coming from Chat page)
  useEffect(() => {
    if (location.state) {
      if (location.state.titulo) setTitulo(location.state.titulo);
      if (location.state.contenido) setContenido(location.state.contenido);
      if (location.state.categoriaSlug && categories.length > 0) {
        const found = categories.find(c => c.slug === location.state.categoriaSlug);
        if (found) setCategoriaId(found.id);
      }
    }
  }, [location.state, categories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen es demasiado grande. El límite es de 2MB.');
        return;
      }
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearFileImage = () => {
    setImagenFile(null);
    setImagenPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !contenido.trim() || !categoriaId) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = null;

      if (uploadMode === 'url' && imagenUrl.trim()) {
        finalImageUrl = imagenUrl.trim();
      } else if (uploadMode === 'file' && imagenFile) {
        // Convert file to Base64 data URL
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imagenFile);
        });
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          categoria_id: categoriaId,
          autor_id: user?.id,
          es_bot: false,
          imagen_url: finalImageUrl
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Redirect to the post detail
      navigate(`/post/${data.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('No se pudo crear el debate. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      
      {/* Editor (Left) */}
      <div className="flex-1 flex flex-col gap-4">
        
        <div className="bg-white border border-brand-border rounded-md shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-brand-bg pb-4 mb-5">
            <FileText className="w-6 h-6 text-brand-orange" />
            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">
              Crear un Debate Ético
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-lightText uppercase">Selecciona el Tema / Categoría</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full bg-slate-50 border border-brand-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner font-semibold"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    c/{cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-lightText uppercase">Título del debate</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="¿Qué dilema o noticia ética quieres plantear?"
                className="w-full bg-slate-50 border border-brand-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner font-semibold text-brand-dark"
                maxLength={100}
                required
              />
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-lightText uppercase">Cuerpo de la discusión</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Describe la situación moral o dilema tecnológico en detalle. Plantea preguntas abiertas para enriquecer el debate. Si es una noticia, te recomendamos resumirla e incluir un enlace de origen."
                rows={10}
                className="w-full bg-slate-50 border border-brand-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner leading-relaxed text-brand-dark"
                required
              ></textarea>
            </div>

            {/* Image Section */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-lightText uppercase">Imagen de Soporte (Opcional)</label>
              
              {/* Tabs for Upload Mode */}
              <div className="flex gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => { setUploadMode('url'); clearFileImage(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                    uploadMode === 'url'
                      ? 'bg-brand-blue border-brand-blue text-white'
                      : 'bg-white border-brand-border text-brand-lightText hover:bg-slate-50'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Pegar URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadMode('file'); setImagenUrl(''); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                    uploadMode === 'file'
                      ? 'bg-brand-blue border-brand-blue text-white'
                      : 'bg-white border-brand-border text-brand-lightText hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Archivo</span>
                </button>
              </div>

              {uploadMode === 'url' ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="Pega el enlace de una imagen (ej: https://images.unsplash.com/...)"
                    className="w-full bg-slate-50 border border-brand-border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner font-semibold text-brand-dark"
                  />
                  {imagenUrl && (
                    <div className="relative w-full max-h-60 rounded border border-brand-border overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                      <img
                        src={imagenUrl}
                        alt="Vista previa"
                        className="max-h-56 object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImagenUrl('')}
                        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md flex items-center justify-center transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-brand-border rounded-md bg-slate-50">
                  {!imagenPreview ? (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full sm:w-48 h-32 border border-brand-border rounded-md bg-white hover:bg-slate-50 transition-all shrink-0">
                      <ImageIcon className="w-8 h-8 text-brand-lightText" />
                      <span className="text-[10px] font-bold text-brand-lightText uppercase tracking-wider">Seleccionar Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative w-full sm:w-48 h-32 border border-brand-border rounded-md overflow-hidden bg-white shrink-0">
                      <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={clearFileImage}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-left">
                    <p className="text-xs text-brand-dark font-bold">Añade soporte visual a tu debate</p>
                    <p className="text-[10px] text-brand-lightText mt-1 font-semibold leading-relaxed">
                      Sube una captura de pantalla o imagen descriptiva (máximo 2MB). Se almacenará de forma segura en la base de datos.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-brand-bg pt-4 mt-2">
              <Link
                to="/"
                className="px-5 py-2 rounded-full text-sm font-bold text-brand-lightText hover:bg-brand-bg transition-all"
              >
                Descartar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-brand-orange hover:bg-opacity-90 text-white font-bold text-sm px-6 py-2 rounded-full transition-all shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Publicando...' : 'Publicar Debate'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* Sidebar / Guidelines (Right) */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        
        {/* Guidelines card */}
        <div className="bg-white border border-brand-border rounded-md shadow-sm p-5">
          <h3 className="text-xs font-bold text-brand-lightText tracking-wider uppercase mb-4 flex items-center gap-1.5 border-b border-brand-bg pb-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            Normas de Publicación
          </h3>
          
          <ul className="text-xs text-brand-dark text-opacity-90 flex flex-col gap-3.5 list-decimal pl-4 leading-relaxed font-medium">
            <li>
              <strong>Sé respetuoso:</strong> Se permiten las diferencias de opinión, pero no las descalificaciones personales ni ataques directos.
            </li>
            <li>
              <strong>Enfoque Ético:</strong> Asegúrate de que el tema debata sobre moral digital, derechos, responsabilidades o implicaciones sociales de la tecnología.
            </li>
            <li>
              <strong>Redacción clara:</strong> Describe el dilema de manera imparcial y objetiva para invitar al diálogo constructivo.
            </li>
            <li>
              <strong>Veracidad:</strong> Si publicas una noticia real, cita la fuente u organización. No difundas fake news.
            </li>
          </ul>
        </div>

        <Sidebar />
      </div>

    </div>
  );
};

export default CreatePost;
