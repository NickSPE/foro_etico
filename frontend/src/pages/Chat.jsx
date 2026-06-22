import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  Bot, Send, Sparkles, User, BrainCircuit, Key, CheckCircle, 
  XCircle, Globe, AlertTriangle, RefreshCw
} from 'lucide-react';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const bots = [
    {
      id: 'news',
      name: '🤖 Bot Noticias',
      description: 'Últimas novedades y noticias de ética y tecnología.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotNoticias',
      greeting: '¡Hola! Soy Bot Noticias. Con tu Gemini API Key puedo buscar noticias en tiempo real directamente en Google. Pregúntame sobre cualquier regulación, hackeo o filtración reciente.',
      suggested: ['Últimas noticias de privacidad', 'Novedades de la Ley de IA en la UE', '¿Qué hackeos ocurrieron esta semana?'],
      systemInstruction: 'Eres u/BotNoticias, un agente de IA experto y moderador en el foro r/EticaDigital. Respondes con noticias de actualidad verídicas y objetivas sobre ciberseguridad, privacidad de datos, inteligencia artificial y derechos digitales. Tienes la herramienta Google Search habilitada, por lo que debes buscar en internet eventos reales y recientes si el usuario te pregunta por actualidad. Mantén tus respuestas en español, sé conciso y estructurado, usa negritas y markdown, y cita brevemente tus fuentes si haces búsquedas.'
    },
    {
      id: 'dilemmas',
      name: '⚖️ Bot Dilemas',
      description: 'Plantea dilemas éticos y evalúa tus respuestas filosóficas.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotDilemas',
      greeting: 'Bienvenido, humano. Soy Bot Dilemas. Mi propósito es desafiar tu marco ético. ¿Estás listo para resolver un dilema de tranvía en autos autónomos o sesgo en selección algorítmica? Elige una opción abajo.',
      suggested: ['Dilema del auto autónomo sin frenos', 'Sesgos en reclutamiento por IA', 'Cifrado extremo vs seguridad nacional'],
      systemInstruction: 'Eres u/BotDilemas, un bot filósofo y examinador ético en el foro r/EticaDigital. Tu objetivo es plantear dilemas éticos profundos de la era tecnológica (como vehículos autónomos, sesgos en selección de personal por algoritmos, o cifrado extremo y seguridad nacional) y guiar socráticamente al usuario para examinar su respuesta bajo teorías morales como el Utilitarismo, la Deontología Kantiana y la Ética de la Virtud. Sé provocador, analítico, desafiante y estimulante. Habla en español, usa markdown y mantén tus respuestas de tamaño moderado.'
    }
  ];

  const [activeBot, setActiveBot] = useState(bots[0]);
  const [inputs, setInputs] = useState({ news: '', dilemmas: '' });
  const [chatHistories, setChatHistories] = useState({
    news: [{ sender: 'bot', text: bots[0].greeting, time: 'Ahora' }],
    dilemmas: [{ sender: 'bot', text: bots[1].greeting, time: 'Ahora' }]
  });

  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(true);
  const chatEndRef = useRef(null);

  // Load API key from localStorage or env var on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const savedKey = localStorage.getItem('gemini_api_key') || envKey;
    setApiKey(savedKey);
    if (savedKey) {
      setShowKeyPanel(false);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeBot, chatHistories, isTyping]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowKeyPanel(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setShowKeyPanel(true);
  };

  // Bot auto-publish: Create a post directly in Supabase
  const [triggeringBot, setTriggeringBot] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState('');

  const handleTriggerBot = async (botType) => {
    setTriggeringBot(true);
    setTriggerMessage('');
    
    const currentApiKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!currentApiKey) {
      setTriggerMessage('❌ Necesitas una API Key de Gemini configurada para que los bots publiquen contenido.');
      setTriggeringBot(false);
      return;
    }

    try {
      const isNews = botType === 'news';
      const prompt = isNews 
        ? 'Genera una noticia real y reciente sobre ética tecnológica, privacidad digital o ciberseguridad. Formato: primero el título en una línea, luego dos saltos de línea, luego el cuerpo del artículo con análisis ético. Usa markdown. Mínimo 3 párrafos.'
        : 'Genera un dilema ético tecnológico original y desafiante. Formato: primero el título del dilema en una línea, luego dos saltos de línea, luego la descripción detallada del escenario y al final una pregunta directa para el lector. Usa markdown. Mínimo 3 párrafos.';

      const systemInstr = isNews 
        ? 'Eres un periodista especializado en ética digital. Genera contenido original basado en tendencias reales. Responde directamente con el artículo, sin preámbulos conversacionales.'
        : 'Eres un filósofo experto en dilemas éticos de la tecnología. Genera dilemas originales y desafiantes. Responde directamente con el dilema, sin preámbulos conversacionales.';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstr }] },
            tools: [{ googleSearch: {} }]
          })
        }
      );

      if (!response.ok) throw new Error('Error de Gemini API');
      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!generatedText) throw new Error('Respuesta vacía de Gemini');

      // Split title and content
      const lines = generatedText.trim().split('\n');
      let titulo = lines[0].replace(/^#+\s*/, '').replace(/^\*+/, '').replace(/\*+$/, '').trim();
      const contenido = lines.slice(1).join('\n').trim();

      if (titulo.length > 100) titulo = titulo.substring(0, 97) + '...';

      // Get the target category
      const targetSlug = isNews ? 'ciberseguridad' : 'inteligencia-artificial';
      const { data: catData } = await supabase.from('categories').select('id').eq('slug', targetSlug).single();
      
      if (!catData) throw new Error('Categoría no encontrada');

      // Insert the post as a bot post (no author)
      const { error: insertError } = await supabase.from('posts').insert({
        titulo,
        contenido: contenido || generatedText,
        categoria_id: catData.id,
        autor_id: null,
        es_bot: true,
      });

      if (insertError) throw insertError;

      setTriggerMessage(`✅ ¡${isNews ? 'Bot Noticias' : 'Bot Dilemas'} ha publicado exitosamente! Revisa el feed para ver la nueva publicación.`);
    } catch (err) {
      console.error('Error triggering bot:', err);
      setTriggerMessage(`❌ Error: ${err.message}`);
    } finally {
      setTriggeringBot(false);
    }
  };

  // Local simulated fallback
  const getSimulatedResponse = (botId, userMsg) => {
    const msg = userMsg.toLowerCase();
    if (botId === 'news') {
      if (msg.includes('regulaci') || msg.includes('ue')) {
        return '**Ley de IA de la UE**: Aprobada con fuertes regulaciones para modelos de IA generativa y prohibición de biometría masiva.';
      }
      if (msg.includes('privacidad') || msg.includes('datos')) {
        return '**Filtración reciente**: Hackeo masivo expone datos de millones de usuarios debido a APIs inseguras de redes sociales.';
      }
      return '¡Interesante! Como Bot Noticias en modo local, te sugiero configurar tu **API Key de Gemini** en la barra superior para buscar noticias actuales en tiempo real usando Google.';
    } else {
      if (msg.includes('auto') || msg.includes('dilema')) {
        return 'Un vehículo autónomo debe decidir entre salvar a 5 peatones cruzando sin luz verde o sacrificar al pasajero en un choque. ¿Qué valor ético debe imperar?';
      }
      return 'He registrado tu enfoque ético. Agrega tu **API Key de Gemini** en la barra superior para entablar un debate filosófico real conmigo.';
    }
  };

  // Call the Gemini API with search grounding
  const callGeminiApi = async (bot, userMsg) => {
    const currentApiKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg }] }],
            systemInstruction: { parts: [{ text: bot.systemInstruction }] },
            tools: [{ googleSearch: {} }]
          })
        }
      );

      if (!response.ok) throw new Error('Respuesta de API inválida');
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Formato de respuesta vacío');
      return text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `❌ **Error al conectar con la IA**: No se pudo obtener respuesta de Gemini. Revisa si tu clave de API es válida o si estás bloqueado por límites de cuota.\n\n*Recurso temporal: Volviendo al modo simulación local.*`;
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const currentInput = inputs[activeBot.id];
    if (currentInput.trim() === '') return;

    const timeString = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const userMsg = { sender: 'user', text: currentInput, time: timeString };
    setChatHistories(prev => ({
      ...prev,
      [activeBot.id]: [...prev[activeBot.id], userMsg]
    }));
    
    setInputs(prev => ({ ...prev, [activeBot.id]: '' }));
    setIsTyping(true);

    let responseText = '';
    const currentApiKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (currentApiKey) {
      responseText = await callGeminiApi(activeBot, currentInput);
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      responseText = getSimulatedResponse(activeBot.id, currentInput);
    }

    setChatHistories(prev => ({
      ...prev,
      [activeBot.id]: [...prev[activeBot.id], { sender: 'bot', text: responseText, time: timeString }]
    }));
    
    setIsTyping(false);
  };

  const handlePublishChat = () => {
    if (!isAuthenticated) { navigate('/login'); return; }

    const history = chatHistories[activeBot.id];
    const cleanHistory = history.filter(msg => {
      if (msg.sender === 'bot' && (msg.text.includes('¡Hola!') || msg.text.includes('Bienvenido, humano'))) return false;
      if (msg.sender === 'user' && msg.text.length < 45 && (
        msg.text.includes('Dilema') || msg.text.includes('Últimas') || 
        msg.text.includes('Novedades') || msg.text.includes('hackeos') || msg.text.includes('Cifrado')
      )) return false;
      return true;
    });

    const cleanBotText = (text) => {
      let cleaned = text.trim();
      const paragraphs = cleaned.split(/\n\s*\n/);
      for (let i = 0; i < 2; i++) {
        if (paragraphs.length > 1) {
          const fp = paragraphs[0].toLowerCase();
          if (fp.includes('¡excelente!') || fp.includes('bienvenido') || fp.includes('hola') || 
              fp.includes('soy u/bot') || fp.includes('soy bot') || fp.includes('anfitrión') || 
              fp.includes('examinador ético') || fp.includes('las aguas de la moral') || 
              fp.includes('aquí tienes el dilema') || fp.includes('te propongo') || 
              fp.includes('escenario del auto') || fp.includes('escenario de')) {
            paragraphs.shift();
            cleaned = paragraphs.join('\n\n');
          }
        }
      }
      return cleaned.trim();
    };

    const chatMarkdown = cleanHistory
      .map(msg => msg.sender === 'bot' ? cleanBotText(msg.text) : `### Mi postura / reflexión:\n${msg.text}`)
      .filter(text => text !== '')
      .join('\n\n---\n\n');

    const firstSubstanceMsg = cleanHistory.find(m => m.sender === 'user')?.text || '';
    const suggestedTitle = firstSubstanceMsg 
      ? `Análisis de Dilema: ${firstSubstanceMsg.substring(0, 50)}${firstSubstanceMsg.length > 50 ? '...' : ''}`
      : `Reflexión sobre Dilemas Tecnológicos - ${activeBot.name}`;

    const targetCategorySlug = activeBot.id === 'news' ? 'ciberseguridad' : 'inteligencia-artificial';
    navigate('/crear-post', { state: { titulo: suggestedTitle, contenido: chatMarkdown, categoriaSlug: targetCategorySlug } });
  };

  const selectSuggested = (suggestedText) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setInputs(prev => ({ ...prev, [activeBot.id]: suggestedText }));
  };

  const hasKey = !!(apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
      {/* Channels Sidebar List (Left) */}
      <div className="w-full md:w-80 bg-white border border-brand-border rounded-md shadow-sm p-4 flex flex-col gap-3 shrink-0">
        <h2 className="text-xs font-black text-brand-dark tracking-wider uppercase flex items-center gap-1.5 border-b border-brand-bg pb-3">
          <BrainCircuit className="w-4 h-4 text-brand-orange" />
          Chats con Bots de Moderación
        </h2>
        
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
          {bots.map((b) => {
            const isSelected = activeBot.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBot(b)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-md transition-all hover:bg-brand-bg border ${
                  isSelected ? 'bg-brand-bg border-brand-orange' : 'border-transparent'
                }`}
              >
                <img src={b.avatar} alt={b.name} className="w-10 h-10 rounded-full border border-brand-border shrink-0 bg-slate-50" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-brand-dark flex items-center justify-between">
                    <span>{b.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10.5px] text-brand-lightText font-semibold mt-0.5 truncate leading-snug">{b.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Connection status card */}
        <div className="bg-brand-bg rounded-md p-3 border border-brand-border text-center text-xs font-bold">
          {hasKey ? (
            <div className="text-emerald-600 flex flex-col items-center gap-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Conexión Activa</span>
              <span className="text-[9px] bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 flex items-center gap-1 font-black">
                <Globe className="w-2.5 h-2.5" /> Gemini Activo
              </span>
            </div>
          ) : (
            <div className="text-brand-lightText flex flex-col items-center gap-1">
              <AlertTriangle className="w-5 h-5 text-brand-orange" />
              <span>Modo Local / Simulación</span>
              <span className="text-[9px] text-brand-lightText/85 font-semibold">Configura una clave de API para activar la IA real</span>
            </div>
          )}
        </div>

        {/* Bot auto-publish */}
        <div className="bg-white rounded-md p-3.5 border border-brand-border flex flex-col gap-2 shadow-sm">
          <span className="text-[10px] font-black text-brand-dark uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
            Publicación Autónoma
          </span>
          <p className="text-[9.5px] text-brand-lightText font-semibold leading-relaxed">
            Fuerza a los bots a publicar un hilo completo de inmediato en el foro usando IA.
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <button onClick={() => handleTriggerBot('news')} disabled={triggeringBot}
              className="w-full bg-brand-orange text-white text-[9.5px] font-black py-2 px-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1">
              {triggeringBot ? 'Publicando...' : 'Bot Noticias: Publicar Ahora'}
            </button>
            <button onClick={() => handleTriggerBot('dilemma')} disabled={triggeringBot}
              className="w-full bg-brand-dark text-white text-[9.5px] font-black py-2 px-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1">
              {triggeringBot ? 'Publicando...' : 'Bot Dilemas: Publicar Ahora'}
            </button>
          </div>
          {triggerMessage && (
            <div className="text-[9.5px] bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded font-semibold mt-1 animate-fade-in leading-snug">
              {triggerMessage}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Screen (Right) */}
      <div className="flex-1 bg-white border border-brand-border rounded-md shadow-sm overflow-hidden flex flex-col h-full relative">
        {/* Chat Header */}
        <div className="border-b border-brand-border p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={activeBot.avatar} alt={activeBot.name} className="w-10 h-10 rounded-full border border-brand-border bg-white" />
            <div>
              <span className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                {activeBot.name}
                <span className="text-[9px] bg-brand-orange/15 text-brand-orange font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Agente AI</span>
              </span>
              <p className="text-[10px] text-brand-lightText font-semibold mt-0.5">{activeBot.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chatHistories[activeBot.id].length > 1 && (
              <button onClick={handlePublishChat} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white hover:bg-opacity-95 rounded-md text-xs font-black transition-all shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> <span>Publicar Debate</span>
              </button>
            )}
            <button onClick={() => setShowKeyPanel(!showKeyPanel)} className="flex items-center gap-1 px-3 py-1.5 border border-brand-border hover:bg-brand-bg rounded-md text-xs font-bold text-brand-lightText hover:text-brand-dark transition-all">
              <Key className="w-3.5 h-3.5" /> <span>{hasKey ? 'Ajustes API Key' : 'Conectar Gemini'}</span>
            </button>
          </div>
        </div>

        {/* API Key configuration panel */}
        {showKeyPanel && (
          <div className="bg-orange-50/70 border-b border-brand-border p-4 transition-all">
            <h3 className="text-xs font-bold text-brand-dark mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Configurar Clave de API de Google Gemini (Gratuita)
            </h3>
            <p className="text-[10.5px] text-brand-lightText mb-3 leading-relaxed font-semibold">
              Esta clave se guardará de forma 100% segura y privada en el almacenamiento de tu navegador (`localStorage`). Permite que los bots usen el modelo <strong>gemini-2.5-flash</strong> y realicen búsquedas reales en internet vía Google.
            </p>
            <form onSubmit={handleSaveApiKey} className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega tu API Key de Gemini aquí (AIzaSy...)"
                className="flex-1 bg-white border border-brand-border focus:border-brand-orange rounded-md px-3.5 py-2 text-xs font-semibold outline-none"
              />
              <button type="submit" className="bg-brand-orange hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2 rounded-md transition-all">Guardar</button>
              {localStorage.getItem('gemini_api_key') && (
                <button type="button" onClick={handleClearApiKey} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-md transition-all">Desconectar</button>
              )}
            </form>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-brand-bg/10">
          {chatHistories[activeBot.id].map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div key={index} className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
                <div className={`w-7.5 h-7.5 rounded-full border shrink-0 flex items-center justify-center ${isBot ? 'bg-white border-brand-border' : 'bg-brand-orange border-transparent text-white'}`}>
                  {isBot ? <Bot className="w-4 h-4 text-brand-orange" /> : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm border ${isBot ? 'bg-white border-brand-border text-brand-dark rounded-tl-none' : 'bg-brand-orange border-transparent text-white rounded-tr-none'}`}>
                    <MarkdownRenderer text={msg.text} isUser={!isBot} />
                  </div>
                  <span className="text-[9px] text-brand-lightText font-semibold mt-1 px-1 text-right">{msg.time}</span>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
              <div className="w-7.5 h-7.5 rounded-full border bg-white border-brand-border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="flex flex-col">
                <div className="p-3 rounded-2xl rounded-tl-none bg-white border border-brand-border shadow-sm flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-orange animate-spin" />
                  <span className="text-xs text-brand-lightText font-bold">
                    {hasKey ? 'Pensando y buscando en internet...' : 'Analizando ética de la respuesta...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested inputs */}
        <div className="p-3 border-t border-brand-bg bg-white flex flex-wrap gap-2">
          <span className="text-[10px] font-black text-brand-lightText shrink-0 flex items-center gap-1 self-center uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" /> Sugerido:
          </span>
          {activeBot.suggested.map((s, i) => (
            <button key={i} onClick={() => selectSuggested(s)} className="text-[10.5px] font-semibold text-brand-orange hover:text-brand-orange/80 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1 rounded-full transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* Input Form or Login Prompt */}
        {isAuthenticated ? (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-border bg-white flex gap-3">
            <input
              type="text"
              value={inputs[activeBot.id]}
              onChange={(e) => setInputs(prev => ({ ...prev, [activeBot.id]: e.target.value }))}
              placeholder={`Escribe un mensaje a ${activeBot.name}...`}
              className="flex-1 bg-brand-bg hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-orange rounded-full px-4.5 py-2.5 text-xs font-semibold outline-none transition-all placeholder:text-brand-lightText"
            />
            <button type="submit" className="bg-brand-orange hover:bg-opacity-95 text-white p-2.5 rounded-full transition-all shadow-sm shrink-0 flex items-center justify-center">
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-brand-lightText">Regístrate o inicia sesión para chatear con los bots de moderación.</span>
            <Link to="/login" className="bg-brand-orange hover:bg-opacity-95 text-white text-xs font-black px-4.5 py-2 rounded-full transition-all shrink-0 shadow-sm">Iniciar Sesión</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
