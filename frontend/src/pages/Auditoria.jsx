import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  ShieldAlert, ShieldCheck, Play, ArrowLeft, ArrowRight, Loader2,
  Calendar, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Award, Printer, History, ExternalLink
} from 'lucide-react';

const Auditoria = () => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Info, 2: Cuestionario, 3: Cargando, 4: Resultados
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  // Form Fields
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stackTecnologico, setStackTecnologico] = useState('');

  // Questionnaire state
  const [respuestas, setRespuestas] = useState({
    maneja_datos_personales: false,
    cifra_datos: false,
    usa_codigo_plagiado: false,
    respeta_licencias: true,
    tiene_vulnerabilidades: false,
    realiza_auditorias: true,
    toma_decisiones_automatizadas: false,
    mitiga_sesgos: false,
    informa_metricas_reales: true,
    evita_patrones_oscuros: true,
    optimiza_recursos: true,
  });

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    try {
      const response = await api.get('/auditorias/');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching audit history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated]);

  const handleInputChange = (field) => {
    setRespuestas((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!nombreProyecto.trim() || !descripcion.trim() || !stackTecnologico.trim()) {
      alert('Por favor complete todos los campos obligatorios del Paso 1.');
      setStep(1);
      return;
    }

    setStep(3);
    setLoadingAudit(true);

    try {
      const payload = {
        nombre_proyecto: nombreProyecto,
        descripcion: descripcion,
        stack_tecnologico: stackTecnologico,
        respuestas: respuestas,
      };

      const response = await api.post('/auditorias/', payload);
      setSelectedAudit(response.data);
      setStep(4);
      fetchHistory(); // refresh history
    } catch (error) {
      console.error('Error conducting ethics audit:', error);
      alert('Ocurrió un error técnico al calcular la auditoría ética. Revisa los campos e intenta de nuevo.');
      setStep(2);
    } finally {
      setLoadingAudit(false);
    }
  };

  const resetForm = () => {
    setNombreProyecto('');
    setDescripcion('');
    setStackTecnologico('');
    setRespuestas({
      maneja_datos_personales: false,
      cifra_datos: false,
      usa_codigo_plagiado: false,
      respeta_licencias: true,
      tiene_vulnerabilidades: false,
      realiza_auditorias: true,
      toma_decisiones_automatizadas: false,
      mitiga_sesgos: false,
      informa_metricas_reales: true,
      evita_patrones_oscuros: true,
      optimiza_recursos: true,
    });
    setSelectedAudit(null);
    setStep(1);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format gravity
  const getGravityBadge = (grav) => {
    switch (grav) {
      case 'critica':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Crítica
          </span>
        );
      case 'media':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Media
          </span>
        );
      case 'leve':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-600">
            <AlertTriangle className="w-3.5 h-3.5" /> Leve
          </span>
        );
    }
  };

  // Helper to get score ring color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border pb-6 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
            <ShieldAlert className="w-9 h-9 text-brand-orange" />
            Auditoría de Impacto Ético Profesional
          </h1>
          <p className="text-sm text-brand-lightText mt-1 font-medium max-w-2xl">
            Valora el impacto ético y la viabilidad técnica de tus sistemas de información bajo la normativa y los 8 principios rectores de la <strong>UNAS (FIIS)</strong> y el marco legal peruano (Leyes N.º 29733 y N.º 30096).
          </p>
        </div>
        {step !== 1 && (
          <button
            onClick={resetForm}
            className="flex items-center gap-1.5 px-4 py-2 border border-brand-border bg-white rounded-lg text-xs font-black text-brand-lightText hover:text-brand-orange transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Nueva Auditoría
          </button>
        )}
      </div>

      {/* STEP INDICATOR */}
      {step <= 2 && (
        <div className="flex items-center justify-center gap-4 mb-8 max-w-md mx-auto print:hidden">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-brand-orange' : 'text-emerald-600'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${step === 1 ? 'border-brand-orange bg-orange-50' : 'border-emerald-600 bg-emerald-50'}`}>
              1
            </span>
            <span className="text-xs font-black uppercase tracking-wider">Proyecto</span>
          </div>
          <div className="flex-1 h-0.5 bg-brand-border"></div>
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-brand-orange font-bold' : 'text-brand-lightText'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${step === 2 ? 'border-brand-orange bg-orange-50' : 'border-brand-border'}`}>
              2
            </span>
            <span className="text-xs font-black uppercase tracking-wider">Cuestionario</span>
          </div>
        </div>
      )}

      {/* STEP 1: GENERAL INFO */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          {/* Main Form Panel */}
          <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-brand-dark mb-4 border-b border-brand-border pb-3">
              Paso 1: Identificación y Stack del Proyecto
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-brand-lightText uppercase tracking-wider mb-1">
                  Nombre del Proyecto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sistema Inteligente de Matrículas Académicas"
                  value={nombreProyecto}
                  onChange={(e) => setNombreProyecto(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-brand-lightText uppercase tracking-wider mb-1">
                  Stack Tecnológico / Arquitectura <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. React, Node.js, PostgreSQL, Docker, AWS"
                  value={stackTecnologico}
                  onChange={(e) => setStackTecnologico(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-brand-lightText uppercase tracking-wider mb-1">
                  Descripción Detallada del Sistema <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Explica qué hace tu sistema, cómo recopila los datos y cuál es su flujo principal de procesamiento. La IA de Gemini analizará semánticamente esta descripción para detectar riesgos ocultos, sesgos o dependencias de ciberseguridad."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!nombreProyecto.trim() || !descripcion.trim() || !stackTecnologico.trim()}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-orange text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-sm hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  Continuar al Cuestionario <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Panel & History */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-brand-orange flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-brand-orange" />
                Análisis Híbrido IA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Esta auditoría integra un **motor cuantitativo estático** junto a un **análisis semántico profundo** potenciado por Inteligencia Artificial (Gemini API), evaluando el software de forma integral frente a las regulaciones vigentes en el Perú.
              </p>
            </div>

            {/* History Card */}
            <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-lightText mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand-lightText" />
                Historial de Auditorías
              </h3>

              {!isAuthenticated ? (
                <div className="text-center py-4 bg-slate-50 border border-dashed border-brand-border rounded-lg">
                  <p className="text-[10px] text-brand-lightText font-semibold mb-1">Sesión no iniciada</p>
                  <p className="text-[9px] text-brand-lightText px-4">
                    Inicia sesión para guardar de forma permanente tu registro de auditorías y visualizar tus certificados anteriores.
                  </p>
                </div>
              ) : historyLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-dashed border-brand-border rounded-lg">
                  <p className="text-[10px] text-brand-lightText font-semibold">Sin registros aún</p>
                  <p className="text-[9px] text-brand-lightText mt-1">Completa tu primera auditoría arriba.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setSelectedAudit(h);
                        setStep(4);
                      }}
                      className="text-left w-full p-2.5 rounded-lg border border-brand-border hover:border-brand-orange bg-brand-bg transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-black text-brand-dark truncate">{h.nombre_proyecto}</p>
                        <p className="text-[8px] text-brand-lightText mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(h.fecha_creacion).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        h.score_cumplimiento >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        h.score_cumplimiento >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {h.score_cumplimiento}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CUESTIONARIO ÉTICO */}
      {step === 2 && (
        <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm max-w-3xl mx-auto print:hidden">
          <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
            <h2 className="text-lg font-black text-brand-dark">
              Paso 2: Cuestionario de Impacto de Viabilidad
            </h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-brand-lightText font-bold hover:text-brand-orange flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Paso 1
            </button>
          </div>

          <form onSubmit={handleAuditSubmit} className="flex flex-col gap-6">
            {/* 1. Datos Personales */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">Respeto y Privacidad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El sistema almacena o procesa datos personales de usuarios?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Nombres, correos, registros de acceso, ubicaciones, identificaciones (Ley N.º 29733).</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInputChange('maneja_datos_personales')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.maneja_datos_personales
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, maneja_datos_personales: false, cifra_datos: false }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.maneja_datos_personales
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 2. Cifrado de Datos (Conditional) */}
            {respuestas.maneja_datos_personales && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-orange-50/50 p-4 rounded-lg border border-orange-200 ml-0 md:ml-6 transition-all">
                <div className="flex-1">
                  <span className="text-[9px] font-black tracking-widest text-brand-orange uppercase">Cifrado Técnico</span>
                  <h4 className="text-xs font-black text-brand-dark mt-0.5">¿Se aplican técnicas de cifrado criptográfico robusto?</h4>
                  <p className="text-[10px] text-brand-lightText mt-1">Cifrado de contraseñas (ej. bcrypt), almacenamiento en base de datos cifrado y HTTPS.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRespuestas(prev => ({ ...prev, cifra_datos: true }))}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      respuestas.cifra_datos
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('cifra_datos')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      !respuestas.cifra_datos
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* 3. Propiedad Intelectual */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">Probidad Profesional</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿Existe uso de código plagiado u obtenido ilícitamente?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Copia literal de soluciones protegidas sin atribución académica ni profesional legítima.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInputChange('usa_codigo_plagiado')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.usa_codigo_plagiado
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, usa_codigo_plagiado: false }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.usa_codigo_plagiado
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 4. Respeto a Licencias de Software */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-brand-lightText uppercase">Legalidad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El proyecto respeta los términos de las licencias del software de terceros?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Uso correcto de librerías open-source (MIT, GPL, Apache) o licencias privativas.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, respeta_licencias: true }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.respeta_licencias
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('respeta_licencias')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.respeta_licencias
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 5. Ciberseguridad */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-rose-600 uppercase">Idoneidad y Ciberseguridad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿Se han detectado vulnerabilidades críticas sin resolver?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Inyecciones SQL expuestas, XSS, contraseñas hardcoded en código, etc. (Ley N.º 30096).</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInputChange('tiene_vulnerabilidades')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.tiene_vulnerabilidades
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, tiene_vulnerabilidades: false }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.tiene_vulnerabilidades
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 6. Auditorías de Código */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-sky-600 uppercase">Eficiencia e Idoneidad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El código es auditado o sometido a pruebas automatizadas de seguridad?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Pruebas unitarias, análisis estático (SonarQube, linters) o revisiones de pares.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, realiza_auditorias: true }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.realiza_auditorias
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('realiza_auditorias')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.realiza_auditorias
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 7. Justicia Algorítmica */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-violet-600 uppercase">Justicia y Equidad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El software implementa toma de decisiones automatizada de impacto?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Clasificadores de perfil social, evaluación de notas académicas, filtrado de vacantes.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInputChange('toma_decisiones_automatizadas')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.toma_decisiones_automatizadas
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, toma_decisiones_automatizadas: false, mitiga_sesgos: false }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.toma_decisiones_automatizadas
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 8. Mitigación de Sesgos (Conditional) */}
            {respuestas.toma_decisiones_automatizadas && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-orange-50/50 p-4 rounded-lg border border-orange-200 ml-0 md:ml-6 transition-all">
                <div className="flex-1">
                  <span className="text-[9px] font-black tracking-widest text-brand-orange uppercase">Sesgo Algorítmico</span>
                  <h4 className="text-xs font-black text-brand-dark mt-0.5">¿Cuenta con mecanismos activos de mitigación de sesgos?</h4>
                  <p className="text-[10px] text-brand-lightText mt-1">Auditoría del set de datos, métricas de imparcialidad o explicabilidad de algoritmos.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRespuestas(prev => ({ ...prev, mitiga_sesgos: true }))}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      respuestas.mitiga_sesgos
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('mitiga_sesgos')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      !respuestas.mitiga_sesgos
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* 9. Veracidad y Transparencia */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-yellow-600 uppercase">Veracidad</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿Se informan las métricas y telemetrías reales honestamente?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Ausencia de ocultamiento de fallos o exageraciones en los SLAs comprometidos.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, informa_metricas_reales: true }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.informa_metricas_reales
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('informa_metricas_reales')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.informa_metricas_reales
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 10. Patrones Oscuros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-pink-600 uppercase">Lealtad Profesional</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El diseño UX/UI está totalmente libre de "patrones oscuros"?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">No hay manipulación engañosa del comportamiento del usuario para forzar elecciones.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, evita_patrones_oscuros: true }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.evita_patrones_oscuros
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('evita_patrones_oscuros')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.evita_patrones_oscuros
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* 11. Eficiencia Energética / Recursos */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-bg p-4 rounded-lg border border-brand-border">
              <div className="flex-1">
                <span className="text-[9px] font-black tracking-widest text-teal-600 uppercase">Eficiencia de Recursos</span>
                <h4 className="text-xs font-black text-brand-dark mt-0.5">¿El código está optimizado para consumir el mínimo de hardware/CPU?</h4>
                <p className="text-[10px] text-brand-lightText mt-1">Eficiencia algorítmica, compresión y limitación de procesos ociosos en el cliente.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRespuestas(prev => ({ ...prev, optimiza_recursos: true }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    respuestas.optimiza_recursos
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('optimiza_recursos')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !respuestas.optimiza_recursos
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-brand-border text-brand-dark hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-brand-border pt-4 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-brand-border rounded-lg text-xs font-black text-brand-lightText hover:text-brand-orange transition-all"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-orange text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-sm hover:bg-orange-600 transition-all"
              >
                Ejecutar Auditoría Híbrida <Play className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: LOADING AUDIT WITH ANIMATED MESSAGES */}
      {step === 3 && (
        <div className="bg-white border border-brand-border rounded-xl p-12 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center print:hidden">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
          <h3 className="text-lg font-black text-brand-dark animate-pulse">Analizando Viabilidad Ética Profesional...</h3>
          <p className="text-xs text-brand-lightText mt-2 leading-relaxed max-w-sm">
            El motor está corriendo las <strong>reglas lógicas estáticas de impacto</strong> y conectando con el <strong>modelo semántico cualitativo de Gemini</strong> para auditar la descripción del proyecto. Esto puede demorar unos segundos.
          </p>
          <div className="flex gap-2 items-center justify-center mt-6">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Procesando con Inteligencia Artificial</span>
          </div>
        </div>
      )}

      {/* STEP 4: AUDIT RESULTS DASHBOARD & CERTIFICATE */}
      {step === 4 && selectedAudit && (
        <div className="flex flex-col gap-8">
          {/* Top Panel Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-brand-border rounded-xl p-4 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-black text-brand-lightText hover:text-brand-orange"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al Inicio
              </button>
              <div className="w-px h-4 bg-brand-border"></div>
              <span className="text-xs font-bold text-brand-dark">
                Proyecto: <strong className="text-brand-orange">{selectedAudit.nombre_proyecto}</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-black transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> Imprimir Certificado
              </button>
              <button
                onClick={resetForm}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-brand-border bg-white text-brand-lightText hover:text-brand-orange hover:bg-brand-bg rounded-lg text-xs font-black transition-all shadow-sm"
              >
                Auditar Otro
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:hidden">
            {/* Left compliance dial & overall report */}
            <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-lightText mb-4 block">
                Cumplimiento Ético Global
              </span>

              {/* Circle Gauge Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className={`fill-none stroke-current ${getScoreColor(selectedAudit.score_cumplimiento)}`}
                    strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * selectedAudit.score_cumplimiento) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-brand-dark">{selectedAudit.score_cumplimiento}%</span>
                  <span className="text-[9px] font-black text-brand-lightText uppercase tracking-widest mt-0.5">Score</span>
                </div>
              </div>

              {/* Dictamen Label */}
              <div className="mt-6 w-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-lightText">Dictamen de Viabilidad</span>
                <div className="mt-1 flex justify-center">
                  {selectedAudit.dictamen === 'viable' ? (
                    <span className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                      VIABLE
                    </span>
                  ) : selectedAudit.dictamen === 'con_riesgos' ? (
                    <span className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-md shadow-amber-500/20">
                      VIABLE CON RIESGOS
                    </span>
                  ) : (
                    <span className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md shadow-rose-500/20">
                      NO VIABLE
                    </span>
                  )}
                </div>
              </div>

              {/* Legal Alignment Info */}
              <div className="w-full h-px bg-brand-border my-6"></div>
              <div className="text-left w-full">
                <h4 className="text-xs font-black text-brand-dark mb-2">Alineación Legal y Ética</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-brand-lightText">
                    <span>Ley N.º 29733 (Datos)</span>
                    <span className={respuestas.maneja_datos_personales && !respuestas.cifra_datos ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {respuestas.maneja_datos_personales && !respuestas.cifra_datos ? 'No Cumple' : 'Alineado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-brand-lightText">
                    <span>Ley N.º 30096 (Ciberseguridad)</span>
                    <span className={respuestas.tiene_vulnerabilidades ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {respuestas.tiene_vulnerabilidades ? 'No Cumple' : 'Alineado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-brand-lightText">
                    <span>Derechos de Autor / Indecopi</span>
                    <span className={respuestas.usa_codigo_plagiado ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {respuestas.usa_codigo_plagiado ? 'Infracción' : 'Alineado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Risks Breakdown & Suggestions */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Semantic Analysis Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-xl p-5 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Análisis Cualitativo Semántico (Gemini IA)
                </span>
                <div className="text-xs text-slate-300 leading-relaxed font-medium mt-3 italic">
                  <MarkdownRenderer text={selectedAudit.analisis_cualitativo_ia} isDark={true} />
                </div>
              </div>

              {/* Risks breakdown list */}
              <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-brand-dark mb-4 border-b border-brand-border pb-3 flex items-center justify-between">
                  <span>Desglose de Riesgos Encontrados ({selectedAudit.riesgos ? selectedAudit.riesgos.length : 0})</span>
                  <span className="text-[10px] text-brand-lightText uppercase tracking-widest font-bold">Criticidad</span>
                </h3>

                {!selectedAudit.riesgos || selectedAudit.riesgos.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-black text-emerald-600">¡Excelente! Cero Riesgos Éticos Críticos Encontrados</p>
                    <p className="text-[10px] text-brand-lightText mt-1">El proyecto respeta firmemente las directrices del manual ético de la UNAS.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {selectedAudit.riesgos.map((risk) => (
                      <div
                        key={risk.id}
                        className={`p-4 rounded-xl border flex flex-col gap-3 transition-all hover:shadow-sm ${
                          risk.gravedad === 'critica' ? 'border-rose-100 bg-rose-50/20' :
                          risk.gravedad === 'media' ? 'border-amber-100 bg-amber-50/20' : 'border-yellow-100 bg-yellow-50/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black text-brand-dark flex items-center gap-1.5">
                            {risk.gravedad === 'critica' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            {risk.gravedad === 'media' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                            {risk.gravedad === 'leve' && <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />}
                            {risk.titulo}
                          </h4>
                          {getGravityBadge(risk.gravedad)}
                        </div>

                        <div>
                          <p className="text-[10px] text-brand-lightText leading-relaxed font-medium">
                            {risk.descripcion}
                          </p>
                          <div className="mt-2 text-[9px] font-black text-brand-lightText flex items-center gap-1 flex-wrap">
                            <span className="uppercase tracking-widest text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-brand-dark">Afectación:</span>
                            {risk.principio_ley_afectada}
                          </div>
                        </div>

                        {risk.sugerencia_mitigacion && (
                          <div className="mt-2 bg-white/70 border border-brand-border rounded-lg p-3">
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
                              Acción de Mitigación Recomendada
                            </span>
                            <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                              {risk.sugerencia_mitigacion}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DIPLOMA / CERTIFICADO DE VIABILIDAD ÉTICA (DISPLAY & PRINT DESIGN) */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-8 shadow-lg max-w-3xl mx-auto relative overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:p-0">
            {/* Ornamental Border */}
            <div className="absolute inset-2 border border-slate-300 pointer-events-none rounded-lg print:inset-0"></div>
            <div className="absolute inset-3 border-2 border-double border-slate-900 pointer-events-none rounded-lg print:inset-1"></div>

            {/* Corner Flourishes */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-900 pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-900 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-900 pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-900 pointer-events-none"></div>

            {/* Sello de agua */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <Award className="w-80 h-80 text-slate-900" />
            </div>

            {/* Certificate Header */}
            <div className="text-center relative z-10">
              <h3 className="font-serif text-lg md:text-xl font-bold text-slate-950 uppercase tracking-widest">
                Universidad Nacional Agraria de la Selva
              </h3>
              <p className="font-sans text-[10px] font-black uppercase text-brand-orange tracking-widest mt-1">
                Facultad de Ingeniería en Informática y Sistemas
              </p>
              <p className="font-sans text-[9px] font-bold uppercase text-slate-700 tracking-wider">
                Escuela Profesional de Ingeniería de Sistemas
              </p>

              <div className="flex items-center justify-center gap-6 my-4">
                <span className="w-12 h-px bg-slate-300"></span>
                <Award className="w-8 h-8 text-brand-orange" />
                <span className="w-12 h-px bg-slate-300"></span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest my-2">
                Certificado de Viabilidad Ética
              </h2>
              <p className="text-[10px] font-semibold text-slate-500 italic">
                En conformidad con el código de ética y regulaciones técnicas de la institución.
              </p>
            </div>

            {/* Certificate Body */}
            <div className="my-8 text-center relative z-10 px-4 md:px-8">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                La comisión de auditoría y evaluación digital hace constar que el proyecto de software titulado:
              </p>
              <h3 className="text-lg md:text-xl font-black text-slate-950 my-3 font-serif underline decoration-brand-orange decoration-2 underline-offset-4">
                {selectedAudit.nombre_proyecto}
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
                ha sido sometido al **Proceso de Auditoría de Impacto Ético Híbrido** en la plataforma oficial del foro de debates, obteniendo un puntaje de cumplimiento de:
              </p>
              
              <div className="my-4 flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 px-4 py-1 font-mono">
                  {selectedAudit.score_cumplimiento}%
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  ({selectedAudit.dictamen.toUpperCase().replace('_', ' ')})
                </span>
              </div>

              <p className="text-[10px] text-slate-600 max-w-lg mx-auto leading-relaxed mt-2 font-medium">
                Garantizando su alineación preliminar ante los 8 principios profesionales (Respeto, Probidad, Eficiencia, Idoneidad, Veracidad, Lealtad, Justicia y Legalidad) y las regulaciones peruanas de protección de datos y delitos informáticos.
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 px-4 md:px-8 text-center sm:text-left border-t border-slate-100 pt-6">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Emitido el:</p>
                <p className="text-[10px] font-black text-slate-800">
                  {new Date(selectedAudit.fecha_creacion).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-[8px] text-slate-400 mt-1 font-mono">ID: {selectedAudit.id}</p>
              </div>

              {/* Digital Stamp Simulation */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-16 h-16 border-2 border-dashed border-brand-orange rounded-full flex flex-col items-center justify-center text-center opacity-70 p-1">
                  <span className="text-[6px] font-black text-brand-orange uppercase leading-none tracking-widest">FIIS - UNAS</span>
                  <ShieldCheck className="w-6 h-6 text-brand-orange my-0.5" />
                  <span className="text-[5px] font-black text-brand-orange uppercase leading-none">VALIDADO</span>
                </div>
                <span className="text-[8px] font-black text-slate-400 tracking-wider mt-1.5 uppercase">Sello Digital de Integridad</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditoria;
