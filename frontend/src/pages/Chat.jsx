import React, { useState, useEffect, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  Bot, Send, Sparkles, User, BrainCircuit, Key, CheckCircle, 
  XCircle, Globe, AlertTriangle, RefreshCw
} from 'lucide-react';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Custom mock/fallback conversations (kept in case API key is empty)
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
  const [hasBackendKey, setHasBackendKey] = useState(false);
  const chatEndRef = useRef(null);

  // Load API key from localStorage on mount & check backend key status
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
    if (savedKey) {
      setShowKeyPanel(false);
    }

    // Ping backend to check if it has a global key configured
    const checkBackendKey = async () => {
      try {
        const res = await api.post('/chat/', { bot_id: 'news', message: 'ping_backend_key_check' });
        if (res.data && res.data.status === 'api_key_configured') {
          setHasBackendKey(true);
          setShowKeyPanel(false); // Hide manual key panel if backend is already fully configured!
        }
      } catch (err) {
        console.log("Backend key check failed, relying on frontend key/mock:", err);
      }
    };
    checkBackendKey();
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

  const [triggeringBot, setTriggeringBot] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState('');

  const handleTriggerBot = async (botType) => {
    setTriggeringBot(true);
    setTriggerMessage('');
    try {
      const res = await api.post('/bots/trigger/', { bot_type: botType });
      if (res.data && res.data.message) {
        setTriggerMessage(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error al forzar la publicación del bot.');
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

  // Call the Gemini API with search grounding!
  const callGeminiApi = async (bot, userMsg) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: userMsg
                  }
                ]
              }
            ],
            systemInstruction: {
              parts: [
                {
                  text: bot.systemInstruction
                }
              ]
            },
            tools: [
              {
                googleSearch: {} // Native Search Grounding enabled!
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Respuesta de API inválida');
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Formato de respuesta vacío');
      }

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
    
    // 1. Add User Message
    const userMsg = { sender: 'user', text: currentInput, time: timeString };
    setChatHistories(prev => ({
      ...prev,
      [activeBot.id]: [...prev[activeBot.id], userMsg]
    }));
    
    setInputs(prev => ({ ...prev, [activeBot.id]: '' }));
    setIsTyping(true);

    let responseText = '';
    
    try {
      // 1. Try secure backend proxy first
      const backendRes = await api.post('/chat/', {
        bot_id: activeBot.id,
        message: currentInput
      });
      
      if (backendRes.data && backendRes.data.response) {
        responseText = backendRes.data.response;
      } else if (backendRes.data && backendRes.data.error === 'api_key_not_configured') {
        // 2. Fallback to client-side Gemini if backend has no key configured
        if (apiKey.trim()) {
          responseText = await callGeminiApi(activeBot, currentInput);
        } else {
          // 3. Simulated fallback
          await new Promise(resolve => setTimeout(resolve, 800));
          responseText = getSimulatedResponse(activeBot.id, currentInput);
        }
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.log("Backend proxy failed or not set up, trying local fallback:", err);
      // 2. Fallback to client-side Gemini
      if (apiKey.trim()) {
        responseText = await callGeminiApi(activeBot, currentInput);
      } else {
        // 3. Simulated fallback
        await new Promise(resolve => setTimeout(resolve, 800));
        responseText = getSimulatedResponse(activeBot.id, currentInput);
      }
    }

    setChatHistories(prev => ({
      ...prev,
      [activeBot.id]: [...prev[activeBot.id], { sender: 'bot', text: responseText, time: timeString }]
    }));
    
    setIsTyping(false);
  };

  const handlePublishChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const history = chatHistories[activeBot.id];
    
    // Filter out greeting messages and raw suggested choices to focus on the actual discussion
    const cleanHistory = history.filter(msg => {
      // Avoid bot greetings
      if (msg.sender === 'bot' && (msg.text.includes('¡Hola!') || msg.text.includes('Bienvenido, humano'))) {
        return false;
      }
      // Avoid short command-like suggestions or menu options to keep substance
      if (msg.sender === 'user' && msg.text.length < 45 && (
        msg.text.includes('Dilema') || 
        msg.text.includes('Últimas') || 
        msg.text.includes('Novedades') || 
        msg.text.includes('hackeos') ||
        msg.text.includes('Cifrado')
      )) {
        return false;
      }
      return true;
    });

    const cleanBotText = (text) => {
      let cleaned = text.trim();
      const paragraphs = cleaned.split(/\n\s*\n/);
      
      // Strip up to 2 conversational paragraphs from the start of the bot response
      for (let i = 0; i < 2; i++) {
        if (paragraphs.length > 1) {
          const firstParagraph = paragraphs[0].toLowerCase();
          if (
            firstParagraph.includes('¡excelente!') ||
            firstParagraph.includes('bienvenido') ||
            firstParagraph.includes('hola') ||
            firstParagraph.includes('soy u/bot') ||
            firstParagraph.includes('soy bot') ||
            firstParagraph.includes('anfitrión') ||
            firstParagraph.includes('examinador ético') ||
            firstParagraph.includes('las aguas de la moral') ||
            firstParagraph.includes('aquí tienes el dilema') ||
            firstParagraph.includes('te propongo') ||
            firstParagraph.includes('escenario del auto') ||
            firstParagraph.includes('escenario de')
          ) {
            paragraphs.shift();
            cleaned = paragraphs.join('\n\n');
          }
        }
      }
      return cleaned.trim();
    };

    // Format the filtered main discussion items cleanly
    const chatMarkdown = cleanHistory
      .map(msg => {
        if (msg.sender === 'bot') {
          return cleanBotText(msg.text);
        } else {
          return `### Mi postura / reflexión:\n${msg.text}`;
        }
      })
      .filter(text => text !== '')
      .join('\n\n---\n\n');

    // Find the core topic discussed
    const firstSubstanceMsg = cleanHistory.find(m => m.sender === 'user')?.text || '';
    const suggestedTitle = firstSubstanceMsg 
      ? `Análisis de Dilema: ${firstSubstanceMsg.substring(0, 50)}${firstSubstanceMsg.length > 50 ? '...' : ''}`
      : `Reflexión sobre Dilemas Tecnológicos - ${activeBot.name}`;

    const targetCategorySlug = activeBot.id === 'news' ? 'ciberseguridad' : 'inteligencia-artificial';

    navigate('/crear-post', {
      state: {
        titulo: suggestedTitle,
        contenido: chatMarkdown,
        categoriaSlug: targetCategorySlug
      }
    });
  };

  const selectSuggested = (suggestedText) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setInputs(prev => ({ ...prev, [activeBot.id]: suggestedText }));
  };

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
                <img
                  src={b.avatar}
                  alt={b.name}
                  className="w-10 h-10 rounded-full border border-brand-border shrink-0 bg-slate-50"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-brand-dark flex items-center justify-between">
                    <span>{b.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10.5px] text-brand-lightText font-semibold mt-0.5 truncate leading-snug">
                    {b.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Connection status card */}
        <div className="bg-brand-bg rounded-md p-3 border border-brand-border text-center text-xs font-bold">
          {hasBackendKey ? (
            <div className="text-emerald-600 flex flex-col items-center gap-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Conexión de Servidor</span>
              <span className="text-[9px] bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 flex items-center gap-1 font-black">
                <Globe className="w-2.5 h-2.5" /> Gemini Activo Global
              </span>
            </div>
          ) : apiKey ? (
            <div className="text-emerald-600 flex flex-col items-center gap-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Conexión Personal</span>
              <span className="text-[9px] bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 flex items-center gap-1 font-black">
                <Globe className="w-2.5 h-2.5" /> Gemini Activo Personal
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

        {/* Planificador autónomo de bots */}
        <div className="bg-white rounded-md p-3.5 border border-brand-border flex flex-col gap-2 shadow-sm">
          <span className="text-[10px] font-black text-brand-dark uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
            Publicación Autónoma
          </span>
          <p className="text-[9.5px] text-brand-lightText font-semibold leading-relaxed">
            ¿Quieres ver si los bots pueden publicar solos? Haz clic abajo para forzar al servidor a publicar un hilo completo de inmediato en el foro.
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <button
              onClick={() => handleTriggerBot('news')}
              disabled={triggeringBot}
              className="w-full bg-brand-orange text-white text-[9.5px] font-black py-2 px-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
            >
              {triggeringBot ? 'Publicando...' : 'Bot Noticias: Publicar Ahora'}
            </button>
            <button
              onClick={() => handleTriggerBot('dilemma')}
              disabled={triggeringBot}
              className="w-full bg-brand-dark text-white text-[9.5px] font-black py-2 px-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
            >
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
            <img
              src={activeBot.avatar}
              alt={activeBot.name}
              className="w-10 h-10 rounded-full border border-brand-border bg-white"
            />
            <div>
              <span className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                {activeBot.name}
                <span className="text-[9px] bg-brand-orange/15 text-brand-orange font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Agente AI
                </span>
              </span>
              <p className="text-[10px] text-brand-lightText font-semibold mt-0.5">
                {activeBot.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chatHistories[activeBot.id].length > 1 && (
              <button
                onClick={handlePublishChat}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white hover:bg-opacity-95 rounded-md text-xs font-black transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publicar Debate</span>
              </button>
            )}

            {!hasBackendKey && (
              <button
                onClick={() => setShowKeyPanel(!showKeyPanel)}
                className="flex items-center gap-1 px-3 py-1.5 border border-brand-border hover:bg-brand-bg rounded-md text-xs font-bold text-brand-lightText hover:text-brand-dark transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{apiKey ? 'Ajustes API Key' : 'Conectar Gemini'}</span>
              </button>
            )}
          </div>
        </div>

        {/* API Key configuration panel */}
        {!hasBackendKey && showKeyPanel && (
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
              <button
                type="submit"
                className="bg-brand-orange hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2 rounded-md transition-all"
              >
                Guardar
              </button>
              {localStorage.getItem('gemini_api_key') && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-md transition-all"
                >
                  Desconectar
                </button>
              )}
            </form>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-brand-bg/10">
          {chatHistories[activeBot.id].map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                <div
                  className={`w-7.5 h-7.5 rounded-full border shrink-0 flex items-center justify-center ${
                    isBot ? 'bg-white border-brand-border' : 'bg-brand-orange border-transparent text-white'
                  }`}
                >
                  {isBot ? (
                    <Bot className="w-4 h-4 text-brand-orange" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm border ${
                      isBot
                        ? 'bg-white border-brand-border text-brand-dark rounded-tl-none'
                        : 'bg-brand-orange border-transparent text-white rounded-tr-none'
                    }`}
                  >
                    <MarkdownRenderer text={msg.text} isUser={!isBot} />
                  </div>
                  <span className="text-[9px] text-brand-lightText font-semibold mt-1 px-1 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Thinking Animation */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
              <div className="w-7.5 h-7.5 rounded-full border bg-white border-brand-border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="flex flex-col">
                <div className="p-3 rounded-2xl rounded-tl-none bg-white border border-brand-border shadow-sm flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-orange animate-spin" />
                  <span className="text-xs text-brand-lightText font-bold">
                    {apiKey ? 'Pensando y buscando en internet...' : 'Analizando ética de la respuesta...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested inputs overlay */}
        <div className="p-3 border-t border-brand-bg bg-white flex flex-wrap gap-2">
          <span className="text-[10px] font-black text-brand-lightText shrink-0 flex items-center gap-1 self-center uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            Sugerido:
          </span>
          {activeBot.suggested.map((s, i) => (
            <button
              key={i}
              onClick={() => selectSuggested(s)}
              className="text-[10.5px] font-semibold text-brand-orange hover:text-brand-orange/80 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1 rounded-full transition-all"
            >
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
            <button
              type="submit"
              className="bg-brand-orange hover:bg-opacity-95 text-white p-2.5 rounded-full transition-all shadow-sm shrink-0 flex items-center justify-center"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-brand-lightText">
              Regístrate o inicia sesión para chatear con los bots de moderación.
            </span>
            <Link
              to="/login"
              className="bg-brand-orange hover:bg-opacity-95 text-white text-xs font-black px-4.5 py-2 rounded-full transition-all shrink-0 shadow-sm"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
