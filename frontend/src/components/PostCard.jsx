import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ArrowUp, ArrowDown, MessageSquare, Share2, Award, Bot, Clock, Image } from 'lucide-react';

// Elegant Spanish date humanizer
export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'hace unos segundos';
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHour < 24) return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  if (diffDay < 30) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PostCard = ({ post, onVoteSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Track visual vote state locally for instant UI feedback
  const [localVote, setLocalVote] = useState(post.user_vote);
  const [localTotalVotos, setLocalTotalVotos] = useState(post.total_votos);
  const [voting, setVoting] = useState(false);

  const handleVote = async (tipo) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (voting) return;
    setVoting(true);

    try {
      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('post_id', post.id)
        .single();

      let newVote = null;

      if (existingVote) {
        if (existingVote.tipo === tipo) {
          // Toggle: same vote → remove
          await supabase.from('votes').delete().eq('id', existingVote.id);
          newVote = null;
        } else {
          // Change vote type
          await supabase.from('votes').update({ tipo }).eq('id', existingVote.id);
          newVote = tipo;
        }
      } else {
        // Create new vote
        await supabase.from('votes').insert({ usuario_id: user.id, post_id: post.id, tipo });
        newVote = tipo;
      }

      // Re-fetch updated vote counts from post (trigger recalculated them)
      const { data: updatedPost } = await supabase
        .from('posts')
        .select('votos_positivos, votos_negativos')
        .eq('id', post.id)
        .single();

      const pos = updatedPost?.votos_positivos || 0;
      const neg = updatedPost?.votos_negativos || 0;
      const total = pos - neg;

      setLocalVote(newVote);
      setLocalTotalVotos(total);
      
      if (onVoteSuccess) {
        onVoteSuccess(post.id, pos, neg, total, newVote);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const isUpvoted = localVote === 'positivo';
  const isDownvoted = localVote === 'negativo';

  return (
    <article className="bg-white border border-brand-border rounded-md shadow-sm hover:border-brand-lightText transition-all flex overflow-hidden">
      {/* Vote Panel (Left) */}
      <div className="w-11 sm:w-12 bg-slate-50 border-r border-brand-border flex flex-col items-center py-2.5 px-1 shrink-0">
        <button
          onClick={() => handleVote('positivo')}
          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
            isUpvoted ? 'text-brand-orange bg-orange-50' : 'text-brand-lightText'
          }`}
          aria-label="Voto positivo"
        >
          <ArrowUp className={`w-5 h-5 ${isUpvoted ? 'fill-brand-orange' : ''}`} />
        </button>
        
        <span className={`text-xs font-bold my-1 text-center select-none ${
          isUpvoted ? 'text-brand-orange' : isDownvoted ? 'text-brand-blue' : 'text-brand-dark'
        }`}>
          {localTotalVotos}
        </span>

        <button
          onClick={() => handleVote('negativo')}
          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
            isDownvoted ? 'text-brand-blue bg-blue-50' : 'text-brand-lightText'
          }`}
          aria-label="Voto negativo"
        >
          <ArrowDown className={`w-5 h-5 ${isDownvoted ? 'fill-brand-blue' : ''}`} />
        </button>
      </div>

      {/* Content Area (Right) */}
      <div className="flex-1 p-3 sm:p-4">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-lightText mb-2">
          {/* Category Tag */}
          <Link
            to={`/categoria/${post.categoria?.slug}`}
            className="font-bold text-brand-dark hover:underline flex items-center gap-1"
          >
            c/{post.categoria?.nombre}
          </Link>
          <span>•</span>
          
          {/* Author */}
          <span className="flex items-center gap-1">
            Publicado por 
            {post.es_bot ? (
              <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.5 rounded border border-purple-200">
                <Bot className="w-3 h-3" />
                bot
              </span>
            ) : (
              <span className="font-medium text-brand-dark hover:underline">
                u/{post.autor?.username || 'anónimo'}
              </span>
            )}
          </span>
          
          <span className="hidden sm:inline">•</span>
          
          {/* Time Ago */}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeAgo(post.fecha_creacion)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-semibold text-brand-dark hover:text-brand-blue transition-colors mb-2.5 leading-snug">
          <Link to={`/post/${post.id}`}>{post.titulo}</Link>
        </h2>

        {/* Content Preview */}
        <div className="flex gap-4 items-start mb-3">
          <p className="flex-1 text-sm text-brand-dark text-opacity-90 leading-relaxed line-clamp-3 whitespace-pre-line">
            {post.contenido}
          </p>
          {post.imagen_url && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded border border-brand-border overflow-hidden bg-slate-50 shrink-0 select-none">
              <img 
                src={post.imagen_url} 
                alt="Post attachment" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold text-brand-lightText border-t border-brand-bg pt-2.5">
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1.5 p-1.5 rounded hover:bg-brand-bg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comentarios_count} {post.comentarios_count === 1 ? 'Comentario' : 'Comentarios'}</span>
          </Link>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
              alert('Enlace copiado al portapapeles!');
            }}
            className="flex items-center gap-1.5 p-1.5 rounded hover:bg-brand-bg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>

          <span className="hidden sm:flex items-center gap-1 text-[11px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            <Award className="w-3.5 h-3.5" />
            Debate Abierto
          </span>

          {post.imagen_url && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-normal text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              <Image className="w-3.5 h-3.5" />
              Imagen
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
