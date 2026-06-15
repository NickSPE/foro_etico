from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Post, Comment, Vote, ProyectoAuditoria, RiesgoDetectado

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'avatar', 'fecha_registro')
        read_only_fields = ('id', 'fecha_registro')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            avatar=validated_data.get('avatar', None)
        )
        return user

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'avatar')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'nombre', 'slug', 'descripcion', 'icono')

class CommentSerializer(serializers.ModelSerializer):
    autor = UserPublicSerializer(read_only=True)
    respuestas = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'contenido', 'autor', 'post', 'fecha_creacion', 'comentario_padre', 'respuestas')
        read_only_fields = ('id', 'autor', 'fecha_creacion', 'respuestas')

    def get_respuestas(self, obj):
        # Recursively serialize child comments
        if obj.respuestas.exists():
            return CommentSerializer(obj.respuestas.all(), many=True).data
        return []

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('id', 'contenido', 'post', 'comentario_padre', 'fecha_creacion')
        read_only_fields = ('id', 'fecha_creacion')

class PostListSerializer(serializers.ModelSerializer):
    autor = UserPublicSerializer(read_only=True)
    categoria = CategorySerializer(read_only=True)
    comentarios_count = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'titulo', 'contenido', 'autor', 'categoria', 
            'fecha_creacion', 'es_bot', 'votos_positivos', 
            'votos_negativos', 'total_votos', 'comentarios_count', 'user_vote', 'imagen'
        )

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = Vote.objects.get(usuario=request.user, post=obj)
                return vote.tipo
            except Vote.DoesNotExist:
                return None
        return None

class PostDetailSerializer(serializers.ModelSerializer):
    autor = UserPublicSerializer(read_only=True)
    categoria = CategorySerializer(read_only=True)
    comentarios = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'titulo', 'contenido', 'autor', 'categoria', 
            'fecha_creacion', 'es_bot', 'votos_positivos', 
            'votos_negativos', 'total_votos', 'comentarios', 'user_vote', 'imagen'
        )

    def get_comentarios(self, obj):
        # Only return top-level comments (no parent) to start the nested structure
        top_level_comments = obj.comentarios.filter(comentario_padre__isnull=True)
        return CommentSerializer(top_level_comments, many=True).data

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = Vote.objects.get(usuario=request.user, post=obj)
                return vote.tipo
            except Vote.DoesNotExist:
                return None
        return None

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id', 'titulo', 'contenido', 'categoria', 'imagen')
        read_only_fields = ('id',)

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ('tipo',)

class RiesgoDetectadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiesgoDetectado
        fields = ('id', 'titulo', 'descripcion', 'gravedad', 'principio_ley_afectada', 'sugerencia_mitigacion')

class ProyectoAuditoriaSerializer(serializers.ModelSerializer):
    riesgos = RiesgoDetectadoSerializer(many=True, read_only=True)
    usuario = UserPublicSerializer(read_only=True)

    class Meta:
        model = ProyectoAuditoria
        fields = (
            'id', 'usuario', 'nombre_proyecto', 'descripcion', 'stack_tecnologico',
            'score_cumplimiento', 'dictamen', 'analisis_cualitativo_ia', 'fecha_creacion', 'riesgos'
        )
        read_only_fields = ('id', 'usuario', 'score_cumplimiento', 'dictamen', 'analisis_cualitativo_ia', 'fecha_creacion', 'riesgos')
