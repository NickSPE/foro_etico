import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { formatTimeAgo } from '../components/PostCard';
import { ArrowUp, ArrowDown, MessageSquare, Share2, Award, Bot, Clock, Reply, User } from 'lucide-react';

// Recursive Comment Node Component
const CommentNode = ({ comment, postId, onAddReply }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          contenido: replyText,
          post_id: postId,
          autor_id: user.id,
          comentario_padre_id: comment.id
        })
        .select(`*, profiles:autor_id (id, username, avatar_url)`)
        .single();

      if (error) throw error;
      
      const newReply = {
        ...data,
        autor: data.profiles ? { id: data.profiles.id, username: data.profiles.username, avatar: data.profiles.avatar_url } : null,
        respuestas: []
      };

      setReplyText('');
      setShowReplyForm(false);
      onAddReply(comment.id, newReply);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative mt-3 pl-3">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-border hover:bg-brand-blue transition-colors cursor-pointer select-none"></div>
      
      <div className="pl-4">
        <div className="flex items-center gap-2 text-xs text-brand-lightText mb-1 flex-wrap">
          <img 
            src={comment.autor?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=anon`} 
            alt={comment.autor?.username} 
            className="w-5 h-5 rounded-full border border-brand-border bg-brand-bg"
          />
          <span className="font-semibold text-brand-dark">
            u/{comment.autor?.username || 'anónimo'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(comment.fecha_creacion)}
          </span>
        </div>

        <p className="text-sm text-brand-dark leading-relaxed pr-2 whitespace-pre-line">
          {comment.contenido}
        </p>

        <div className="flex items-center gap-3 text-xs font-semibold text-brand-lightText mt-1.5">
          <button
            onClick={() => {
              if (!isAuthenticated) { navigate('/login'); } 
              else { setShowReplyForm(!showReplyForm); }
            }}
            className="flex items-center gap-1 hover:text-brand-blue p-1 rounded hover:bg-brand-bg transition-all"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Responder</span>
          </button>
        </div>

        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-3 max-w-xl">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Responder a u/${comment.autor?.username}...`}
              rows={2}
              className="w-full bg-white border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-blue transition-all"
              required
            ></textarea>
            <div className="flex gap-2 justify-end mt-2">
              <button type="button" onClick={() => setShowReplyForm(false)} className="px-3 py-1.5 rounded-full text-xs font-bold text-brand-lightText hover:bg-brand-bg transition-all">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-brand-blue text-white rounded-full text-xs font-bold shadow-sm hover:bg-opacity-90 transition-all disabled:opacity-50">
                {submitting ? 'Enviando...' : 'Publicar Respuesta'}
              </button>
            </div>
          </form>
        )}

        {comment.respuestas && comment.respuestas.length > 0 && (
          <div className="flex flex-col gap-1">
            {comment.respuestas.map((reply) => (
              <CommentNode key={reply.id} comment={reply} postId={postId} onAddReply={onAddReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [localVote, setLocalVote] = useState(null);
  const [localTotalVotos, setLocalTotalVotos] = useState(0);
  const [voting, setVoting] = useState(false);

  // Build nested comment tree from flat list
  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];
    
    comments.forEach(c => {
      map[c.id] = { ...c, respuestas: [] };
    });
    
    comments.forEach(c => {
      const node = map[c.id];
      if (c.comentario_padre_id && map[c.comentario_padre_id]) {
        map[c.comentario_padre_id].respuestas.push(node);
      } else {
        roots.push(node);
      }
    });
    
    return roots;
  };

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        // Fetch the post
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:autor_id (id, username, avatar_url),
            categories:categoria_id (id, nombre, slug, descripcion, icono)
          `)
          .eq('id', id)
          .single();

        if (postError) throw postError;

        // Fetch all comments for this post
        const { data: commentsData } = await supabase
          .from('comments')
          .select(`*, profiles:autor_id (id, username, avatar_url)`)
          .eq('post_id', id)
          .order('fecha_creacion', { ascending: true });

        // Transform comments to expected shape
        const transformedComments = (commentsData || []).map(c => ({
          ...c,
          autor: c.profiles ? { id: c.profiles.id, username: c.profiles.username, avatar: c.profiles.avatar_url } : null,
        }));

        const commentTree = buildCommentTree(transformedComments);

        // Build post object
        const fullPost = {
          ...postData,
          autor: postData.profiles ? { id: postData.profiles.id, username: postData.profiles.username, avatar: postData.profiles.avatar_url } : null,
          categoria: postData.categories,
          comentarios: commentTree,
          total_votos: postData.votos_positivos - postData.votos_negativos,
        };

        setPost(fullPost);
        setLocalTotalVotos(fullPost.total_votos);

        // Fetch user's vote
        if (user) {
          const { data: voteData } = await supabase
            .from('votes')
            .select('tipo')
            .eq('usuario_id', user.id)
            .eq('post_id', id)
            .single();
          setLocalVote(voteData?.tipo || null);
        }
      } catch (error) {
        console.error('Error fetching post detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [id, user]);

  const handleVote = async (tipo) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (voting) return;
    setVoting(true);

    try {
      const { data: existingVote } = await supabase
        .from('votes').select('*').eq('usuario_id', user.id).eq('post_id', post.id).single();

      let newVote = null;
      if (existingVote) {
        if (existingVote.tipo === tipo) {
          await supabase.from('votes').delete().eq('id', existingVote.id);
        } else {
          await supabase.from('votes').update({ tipo }).eq('id', existingVote.id);
          newVote = tipo;
        }
      } else {
        await supabase.from('votes').insert({ usuario_id: user.id, post_id: post.id, tipo });
        newVote = tipo;
      }

      const { data: updatedPost } = await supabase.from('posts').select('votos_positivos, votos_negativos').eq('id', post.id).single();
      const total = (updatedPost?.votos_positivos || 0) - (updatedPost?.votos_negativos || 0);
      setLocalVote(newVote);
      setLocalTotalVotos(total);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          contenido: commentText,
          post_id: post.id,
          autor_id: user.id,
          comentario_padre_id: null
        })
        .select(`*, profiles:autor_id (id, username, avatar_url)`)
        .single();

      if (error) throw error;

      const newComment = {
        ...data,
        autor: data.profiles ? { id: data.profiles.id, username: data.profiles.username, avatar: data.profiles.avatar_url } : null,
        respuestas: []
      };

      setPost(prevPost => ({
        ...prevPost,
        comentarios: [newComment, ...prevPost.comentarios]
      }));
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReplyTree = (parentId, replyData) => {
    const injectReply = (comments) => {
      return comments.map(c => {
        if (c.id === parentId) {
          return { ...c, respuestas: [...c.respuestas, replyData] };
        } else if (c.respuestas && c.respuestas.length > 0) {
          return { ...c, respuestas: injectReply(c.respuestas) };
        }
        return c;
      });
    };
    setPost(prevPost => ({ ...prevPost, comentarios: injectReply(prevPost.comentarios) }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white border border-brand-border rounded-md h-96 animate-pulse"></div>
        <div className="w-80 bg-white border border-brand-border rounded-md h-64 animate-pulse"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center bg-white border border-brand-border rounded-md mt-6 shadow-sm">
        <p className="text-brand-lightText font-semibold mb-2">El debate no existe o ha sido retirado.</p>
        <Link to="/" className="text-brand-blue hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const isUpvoted = localVote === 'positivo';
  const isDownvoted = localVote === 'negativo';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <article className="bg-white border border-brand-border rounded-md shadow-sm flex overflow-hidden">
          {/* Vote Panel */}
          <div className="w-11 sm:w-12 bg-slate-50 border-r border-brand-border flex flex-col items-center py-4 px-1 shrink-0">
            <button onClick={() => handleVote('positivo')} className={`p-1 rounded hover:bg-slate-200 transition-colors ${isUpvoted ? 'text-brand-orange bg-orange-50' : 'text-brand-lightText'}`} aria-label="Voto positivo">
              <ArrowUp className={`w-5 h-5 ${isUpvoted ? 'fill-brand-orange' : ''}`} />
            </button>
            <span className={`text-xs font-bold my-1 text-center select-none ${isUpvoted ? 'text-brand-orange' : isDownvoted ? 'text-brand-blue' : 'text-brand-dark'}`}>{localTotalVotos}</span>
            <button onClick={() => handleVote('negativo')} className={`p-1 rounded hover:bg-slate-200 transition-colors ${isDownvoted ? 'text-brand-blue bg-blue-50' : 'text-brand-lightText'}`} aria-label="Voto negativo">
              <ArrowDown className={`w-5 h-5 ${isDownvoted ? 'fill-brand-blue' : ''}`} />
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-lightText mb-3">
              <Link to={`/categoria/${post.categoria?.slug}`} className="font-bold text-brand-dark hover:underline flex items-center gap-1">c/{post.categoria?.nombre}</Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                Publicado por 
                {post.es_bot ? (
                  <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.5 rounded border border-purple-200"><Bot className="w-3.5 h-3.5" />bot</span>
                ) : (
                  <span className="font-semibold text-brand-dark">u/{post.autor?.username || 'anónimo'}</span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTimeAgo(post.fecha_creacion)}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark mb-4 leading-snug">{post.titulo}</h1>

            {post.imagen_url && (
              <div className="mb-6 border border-brand-border rounded-lg overflow-hidden bg-slate-50 max-h-[400px] flex items-center justify-center">
                <img src={post.imagen_url} alt={post.titulo} className="max-h-[400px] w-auto object-contain" />
              </div>
            )}

            <div className="text-sm sm:text-base text-brand-dark text-opacity-95 leading-relaxed mb-6 border-b border-brand-bg pb-6">
              <MarkdownRenderer text={post.contenido} />
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-brand-lightText">
              <span className="flex items-center gap-1.5 bg-brand-bg px-2.5 py-1 rounded-md">
                <MessageSquare className="w-4 h-4" />
                {post.comentarios?.length || 0} Comentarios Totales
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Enlace del debate copiado al portapapeles!'); }}
                className="flex items-center gap-1.5 bg-brand-bg hover:bg-slate-200 transition-colors px-2.5 py-1 rounded-md"
              >
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>

            {/* Comment Submission form */}
            <div className="mt-8">
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
                  <div className="text-xs text-brand-lightText font-semibold">
                    Comentar como <span className="text-brand-blue font-bold">u/{user.username}</span>
                  </div>
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="¿Cuál es tu postura ética en este debate? Argumenta respetuosamente..." rows={4} className="w-full bg-slate-50 border border-brand-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner" required></textarea>
                  <div className="flex justify-end">
                    <button type="submit" disabled={submittingComment} className="bg-brand-blue hover:bg-opacity-90 text-white font-bold text-sm px-5 py-2 rounded-full transition-all shadow-md disabled:opacity-50">
                      {submittingComment ? 'Publicando...' : 'Comentar Debate'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 border border-brand-border rounded-md p-4 flex items-center justify-between">
                  <span className="text-sm text-brand-lightText">Regístrate o inicia sesión para participar en este debate ético.</span>
                  <div className="flex gap-2">
                    <Link to="/login" className="bg-brand-blue hover:bg-opacity-90 text-white text-xs font-bold px-4 py-2 rounded-full transition-all">Iniciar Sesión</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Threaded Comments */}
            <div className="mt-8 pt-6 border-t border-brand-bg">
              <h2 className="text-xs font-bold text-brand-lightText tracking-wider uppercase mb-4">Hilos de Discusión</h2>
              {post.comentarios?.length === 0 ? (
                <div className="text-center py-8 text-brand-lightText text-sm">Aún no hay comentarios en este debate. ¡Sé el primero en plantear un argumento!</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {post.comentarios.map((comment) => (
                    <CommentNode key={comment.id} comment={comment} postId={post.id} onAddReply={handleAddReplyTree} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
      <Sidebar />
    </div>
  );
};

export default PostDetail;
