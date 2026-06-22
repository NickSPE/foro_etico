import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Award, Calendar, CircleUser, Newspaper } from 'lucide-react';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userKarma, setUserKarma] = useState(0);
  const [registrationDate, setRegistrationDate] = useState('Mayo 2026');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        // Get the profile for this username
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        setProfileData(profile);

        if (!profile) { setLoading(false); return; }

        if (profile.fecha_registro) {
          const date = new Date(profile.fecha_registro);
          setRegistrationDate(date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
        }

        // Fetch posts by this user
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:autor_id (id, username, avatar_url),
            categories:categoria_id (id, nombre, slug, descripcion, icono),
            comments:comments(count)
          `)
          .eq('autor_id', profile.id)
          .order('fecha_creacion', { ascending: false });

        const transformed = (postsData || []).map(post => ({
          ...post,
          autor: post.profiles ? { id: post.profiles.id, username: post.profiles.username, avatar: post.profiles.avatar_url } : null,
          categoria: post.categories,
          comentarios_count: post.comments?.[0]?.count || 0,
          total_votos: post.votos_positivos - post.votos_negativos,
          user_vote: null,
        }));

        // Resolve votes
        if (user) {
          const postIds = transformed.map(p => p.id);
          if (postIds.length > 0) {
            const { data: votes } = await supabase
              .from('votes').select('post_id, tipo').eq('usuario_id', user.id).in('post_id', postIds);
            if (votes) {
              const voteMap = {};
              votes.forEach(v => { voteMap[v.post_id] = v.tipo; });
              transformed.forEach(p => { p.user_vote = voteMap[p.id] || null; });
            }
          }
        }

        setPosts(transformed);

        // Calculate karma
        const totalKarma = transformed.reduce(
          (acc, post) => acc + (post.votos_positivos - post.votos_negativos), 0
        );
        setUserKarma(Math.max(1, 10 + totalKarma));
      } catch (error) {
        console.error('Error fetching profile posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [username, user]);

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
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white border border-brand-border rounded-md shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-orange to-brand-blue"></div>
          
          <img
            src={profileData?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
            alt={username}
            className="w-24 h-24 rounded-full border-2 border-brand-orange bg-brand-bg shrink-0 shadow-sm"
          />
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-brand-dark flex items-center justify-center sm:justify-start gap-2">
              u/{username}
            </h1>
            <p className="text-xs font-semibold text-brand-lightText mt-1">
              Miembro respetado e investigador de los dilemas éticos globales.
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full border border-orange-100">
                <Award className="w-4 h-4" />
                <span>{userKarma} Karma de Ética</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 text-brand-lightText px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>Se unió en {registrationDate}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white border border-brand-border rounded-md"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-md p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
            <CircleUser className="w-12 h-12 text-brand-lightText opacity-40" />
            <p className="text-brand-lightText font-bold">u/{username} aún no ha iniciado ningún debate.</p>
            <p className="text-xs text-brand-lightText">Las publicaciones y aportes éticos creados aparecerán listados aquí.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-brand-lightText uppercase tracking-wider pl-1">
              Aportes y debates de u/{username} ({posts.length})
            </span>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteSuccess={handleVoteSuccessInList} />
            ))}
          </div>
        )}
      </div>

      <Sidebar />
    </div>
  );
};

export default Profile;
