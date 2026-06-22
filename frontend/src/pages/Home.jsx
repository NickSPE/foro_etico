import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Sparkles, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'popular'

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:autor_id (id, username, avatar_url),
          categories:categoria_id (id, nombre, slug, descripcion, icono),
          comments:comments(count)
        `);

      if (sortBy === 'popular') {
        query = query.order('votos_positivos', { ascending: false });
      } else {
        query = query.order('fecha_creacion', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match the shape the UI expects
      const transformed = (data || []).map(post => ({
        ...post,
        autor: post.profiles ? { id: post.profiles.id, username: post.profiles.username, avatar: post.profiles.avatar_url } : null,
        categoria: post.categories,
        comentarios_count: post.comments?.[0]?.count || 0,
        total_votos: post.votos_positivos - post.votos_negativos,
        user_vote: null, // Will be resolved below
      }));

      // Resolve user votes if authenticated
      if (user) {
        const postIds = transformed.map(p => p.id);
        const { data: votes } = await supabase
          .from('votes')
          .select('post_id, tipo')
          .eq('usuario_id', user.id)
          .in('post_id', postIds);

        if (votes) {
          const voteMap = {};
          votes.forEach(v => { voteMap[v.post_id] = v.tipo; });
          transformed.forEach(p => { p.user_vote = voteMap[p.id] || null; });
        }
      }

      setPosts(transformed);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy, user]);

  const handleVoteSuccessInList = (postId, pos, neg, total, userVote) => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, votos_positivos: pos, votos_negativos: neg, total_votos: total, user_vote: userVote }
          : p
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Main Content (Left) */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 animate-pulse text-yellow-300" />
              Bienvenido a EticaDigital
            </h1>
            <p className="text-sm sm:text-base max-w-xl text-orange-50 font-medium">
              El espacio de debate abierto sobre el impacto de la tecnología en la sociedad humana. Comparte tus dilemas, lee análisis objetivos y vota.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 select-none pointer-events-none">
            <MessageSquare className="w-72 h-72" />
          </div>
        </div>

        {/* Filters and Sorting Topbar */}
        <div className="bg-white border border-brand-border rounded-md px-4 py-3 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-brand-lightText tracking-wider uppercase">Debates Populares</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                sortBy === 'recent'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-brand-bg text-brand-lightText hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Más Recientes
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                sortBy === 'popular'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-brand-bg text-brand-lightText hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Populares
            </button>
          </div>
        </div>

        {/* Posts feed */}
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white border border-brand-border rounded-md"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-md p-12 text-center shadow-sm">
            <p className="text-brand-lightText font-semibold mb-2">No hay debates en esta sección.</p>
            <p className="text-xs text-brand-lightText">¡Sé el primero en iniciar un debate haciendo clic en el botón Publicar!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVoteSuccess={handleVoteSuccessInList}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar (Right) */}
      <Sidebar />
    </div>
  );
};

export default Home;
