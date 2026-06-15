from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class User(AbstractUser):
    avatar = models.URLField(max_length=500, blank=True, null=True, help_text="URL de la imagen del avatar")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Category(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    descripcion = models.TextField(blank=True)
    icono = models.CharField(max_length=50, blank=True, help_text="Nombre del icono de Lucide (ej: Shield, Cpu, Lock)")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

class Post(models.Model):
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="posts")
    categoria = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="posts")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    es_bot = models.BooleanField(default=False)
    votos_positivos = models.IntegerField(default=0)
    votos_negativos = models.IntegerField(default=0)
    imagen = models.FileField(upload_to='posts/', blank=True, null=True)

    class Meta:
        ordering = ['-fecha_creacion']

    @property
    def total_votos(self):
        return self.votos_positivos - self.votos_negativos

    def __str__(self):
        return self.titulo

class Comment(models.Model):
    contenido = models.TextField()
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comentarios")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comentarios")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    comentario_padre = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="respuestas"
    )

    class Meta:
        ordering = ['fecha_creacion']

    def __str__(self):
        return f"Comentario por {self.autor.username} en '{self.post.titulo}'"

class Vote(models.Model):
    VOTE_CHOICES = (
        ('positivo', 'Positivo'),
        ('negativo', 'Negativo'),
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votos")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votos_detalle")
    tipo = models.CharField(max_length=10, choices=VOTE_CHOICES)

    class Meta:
        unique_together = ('usuario', 'post')

    def __str__(self):
        return f"{self.usuario.username} voto {self.tipo} en '{self.post.titulo}'"

class ProyectoAuditoria(models.Model):
    VALORACION_CHOICES = (
        ('viable', 'Viable'),
        ('con_riesgos', 'Viable con Riesgos'),
        ('no_viable', 'No Viable'),
    )
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="auditorias")
    nombre_proyecto = models.CharField(max_length=200)
    descripcion = models.TextField()
    stack_tecnologico = models.CharField(max_length=300)
    score_cumplimiento = models.IntegerField(default=100) # De 0 a 100
    dictamen = models.CharField(max_length=20, choices=VALORACION_CHOICES, default='viable')
    analisis_cualitativo_ia = models.TextField(blank=True, help_text="Comentarios semánticos generados por la IA de Gemini")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"Auditoría: {self.nombre_proyecto} - Score: {self.score_cumplimiento}%"

class RiesgoDetectado(models.Model):
    GRAVEDAD_CHOICES = (
        ('critica', 'Crítica'),
        ('media', 'Media'),
        ('leve', 'Leve'),
    )
    auditoria = models.ForeignKey(ProyectoAuditoria, on_delete=models.CASCADE, related_name="riesgos")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    gravedad = models.CharField(max_length=15, choices=GRAVEDAD_CHOICES)
    principio_ley_afectada = models.CharField(max_length=150, help_text="Principio UNAS o Ley Peruana afectada")
    sugerencia_mitigacion = models.TextField(blank=True)

    def __str__(self):
        return f"[{self.gravedad.upper()}] {self.titulo}"
