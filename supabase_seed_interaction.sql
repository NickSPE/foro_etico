-- ============================================================
-- EticaDigital - Seed Data Complementario de Interacciones
-- Ejecuta esto en el Editor SQL de tu consola de Supabase
-- para poblar la base de datos con usuarios, posts con imágenes,
-- comentarios cruzados y votaciones para simular actividad real.
-- ============================================================

-- 1. Asegurar la extensión para criptografía (para contraseñas bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Insertar usuarios de prueba en auth.users
-- Todos los usuarios tendrán la contraseña: 'password123'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'authenticated',
    'authenticated',
    'carlos@ejemplo.com',
    '$2a$10$w85.gPspN4.i6p7Cq4s.kOnQ4oMwqGpeK1aE9jJ4eN0z5eC0i6DqK',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "carlos_tech", "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=carlos"}',
    false,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000000',
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'authenticated',
    'authenticated',
    'ana@ejemplo.com',
    '$2a$10$w85.gPspN4.i6p7Cq4s.kOnQ4oMwqGpeK1aE9jJ4eN0z5eC0i6DqK',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "ana_etica", "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=ana"}',
    false,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000000',
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'authenticated',
    'authenticated',
    'sofia@ejemplo.com',
    '$2a$10$w85.gPspN4.i6p7Cq4s.kOnQ4oMwqGpeK1aE9jJ4eN0z5eC0i6DqK',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "sofia_dev", "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=sofia"}',
    false,
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000000',
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'authenticated',
    'authenticated',
    'diego@ejemplo.com',
    '$2a$10$w85.gPspN4.i6p7Cq4s.kOnQ4oMwqGpeK1aE9jJ4eN0z5eC0i6DqK',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "diego_cyber", "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=diego"}',
    false,
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- Nota: El trigger `on_auth_user_created` ya habrá insertado estas filas en `public.profiles`.
-- En caso de que no existiera el trigger por algún motivo, los creamos manualmente:
INSERT INTO public.profiles (id, username, avatar_url, fecha_registro)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'carlos_tech', 'https://api.dicebear.com/7.x/bottts/svg?seed=carlos', now()),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'ana_etica', 'https://api.dicebear.com/7.x/bottts/svg?seed=ana', now()),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'sofia_dev', 'https://api.dicebear.com/7.x/bottts/svg?seed=sofia', now()),
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'diego_cyber', 'https://api.dicebear.com/7.x/bottts/svg?seed=diego', now())
ON CONFLICT (id) DO NOTHING;


-- 3. Insertar nuevos posts temáticos CON imágenes representativas
INSERT INTO public.posts (titulo, contenido, autor_id, categoria_id, es_bot, imagen_url, fecha_creacion)
VALUES
(
    'Reconocimiento facial y privacidad en espacios públicos: ¿Seguridad o control masivo?',
    E'Varias municipalidades de Latinoamérica han comenzado a instalar cámaras de seguridad equipadas con software de reconocimiento facial impulsado por IA para identificar a personas con antecedentes penales en tiempo real.\n\nAunque el argumento principal es la reducción del crimen, diversos defensores de los derechos humanos advierten sobre las tasas de error en poblaciones de tez oscura y el peligro de un estado de vigilancia permanente y descontrolado.\n\n¿Hasta qué punto debemos sacrificar el anonimato urbano por la promesa de mayor seguridad?',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- carlos_tech
    (SELECT id FROM public.categories WHERE slug = 'privacidad'),
    false,
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
    now() - interval '2 hours'
),
(
    'El impacto del software libre frente a los modelos generativos entrenados con código abierto',
    E'Modelos populares como Copilot y ChatGPT fueron entrenados con millones de repositorios públicos de GitHub con licencias MIT, GPL y Apache.\n\nMuchos desarrolladores argumentan que esto infringe el espíritu de las licencias del software libre, ya que las corporaciones detrás de estos modelos ahora cobran suscripciones premium por sugerir fragmentos de código escritos por la comunidad, sin dar crédito a sus creadores originales.\n\n¿Es necesario repensar el copyleft y las licencias de software para la era de la IA?',
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', -- sofia_dev
    (SELECT id FROM public.categories WHERE slug = 'propiedad-intelectual'),
    false,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    now() - interval '5 hours'
),
(
    'Ataque Zero-Day en infraestructuras de energía: ¿Es ético almacenar vulnerabilidades?',
    E'Recientemente se descubrió que agencias gubernamentales de ciberdefensa conocían un exploit crítico en sistemas SCADA de control eléctrico durante más de dos años sin reportarlo al fabricante. Lo mantuvieron en secreto como una "herramienta táctica de contención".\n\nEl exploit fue filtrado por un grupo de hackers independiente y utilizado para sabotear subestaciones eléctricas en un país en desarrollo, dejando a millones de personas sin luz por 48 horas.\n\n¿Es éticamente justificable que los gobiernos guarden vulnerabilidades críticas en lugar de publicarlas para proteger la infraestructura global?',
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', -- diego_cyber
    (SELECT id FROM public.categories WHERE slug = 'ciberseguridad'),
    false,
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    now() - interval '1 day'
)
ON CONFLICT DO NOTHING;


-- 4. Insertar comentarios interactivos (conversaciones fluidas)
-- Nota: Usamos subconsultas dinámicas para obtener los IDs de los posts recién creados para evitar problemas de índices.

DO $$
DECLARE
    v_post_privacidad BIGINT;
    v_post_licencia BIGINT;
    v_post_ciber BIGINT;
    v_com_padre_1 BIGINT;
    v_com_padre_2 BIGINT;
BEGIN
    -- Obtener IDs de posts
    SELECT id INTO v_post_privacidad FROM public.posts WHERE titulo LIKE 'Reconocimiento facial%' LIMIT 1;
    SELECT id INTO v_post_licencia FROM public.posts WHERE titulo LIKE 'El impacto del software libre%' LIMIT 1;
    SELECT id INTO v_post_ciber FROM public.posts WHERE titulo LIKE 'Ataque Zero-Day%' LIMIT 1;

    -- --- Comentarios en Post de Reconocimiento Facial ---
    IF v_post_privacidad IS NOT NULL THEN
        -- Comentario de Ana
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'Esto es sumamente peligroso. En Londres y Nueva York se ha demostrado que los índices de falsos positivos en minorías étnicas son alarmantemente altos. Terminas tratando a inocentes como criminales.',
            'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', -- ana_etica
            v_post_privacidad,
            now() - interval '1 hour'
        ) RETURNING id INTO v_com_padre_1;

        -- Comentario de Diego
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'Coincido con Ana, pero desde el punto de vista técnico el problema también radica en la centralización de los datos biométricos. Si roban esa base de datos, no puedes cambiar tu rostro como cambias una contraseña.',
            'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', -- diego_cyber
            v_post_privacidad,
            now() - interval '45 minutes'
        );

        -- Respuesta de Carlos al comentario de Ana
        IF v_com_padre_1 IS NOT NULL THEN
            INSERT INTO public.comments (contenido, autor_id, post_id, comentario_padre_id, fecha_creacion)
            VALUES (
                'Totalmente de acuerdo contigo, Ana. La falta de transparencia en los datasets de entrenamiento hace que sea un sesgo institucionalizado automatizado.',
                'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- carlos_tech
                v_post_privacidad,
                v_com_padre_1,
                now() - interval '30 minutes'
            );
        END IF;
    END IF;

    -- --- Comentarios en Post de Software Libre e IA ---
    IF v_post_licencia IS NOT NULL THEN
        -- Comentario de Carlos
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'Es un gran dilema. Por un lado, el código es público, pero las licencias tradicionales nunca contemplaron que una red neuronal consumiera el código para sintetizarlo. Se aprovechan de un vacío legal.',
            'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- carlos_tech
            v_post_licencia,
            now() - interval '4 hours'
        ) RETURNING id INTO v_com_padre_2;

        -- Comentario de Sofia
        IF v_com_padre_2 IS NOT NULL THEN
            INSERT INTO public.comments (contenido, autor_id, post_id, comentario_padre_id, fecha_creacion)
            VALUES (
                'Exacto. Por eso propongo que el movimiento de código abierto debería crear una licencia "AI-Resilient" que prohíba el uso de ese código para entrenamiento comercial sin retribución directa al proyecto.',
                'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', -- sofia_dev
                v_post_licencia,
                v_com_padre_2,
                now() - interval '3 hours'
            );
        END IF;

        -- Comentario de Ana
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'Esto destruye el incentivo de colaborar con el bien común digital. Si mi esfuerzo de años sirve solo para inflar los márgenes de ganancia de Big Tech, prefiero cerrar mis repositorios.',
            'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', -- ana_etica
            v_post_licencia,
            now() - interval '2 hours'
        );
    END IF;

    -- --- Comentarios en Post de Ciberseguridad ---
    IF v_post_ciber IS NOT NULL THEN
        -- Comentario de Sofia
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'No hay justificación ética para ocultar una vulnerabilidad en un sistema industrial del que dependen vidas humanas. Ocultar fallos es negligencia criminal.',
            'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', -- sofia_dev
            v_post_ciber,
            now() - interval '12 hours'
        );

        -- Comentario de Diego
        INSERT INTO public.comments (contenido, autor_id, post_id, fecha_creacion)
        VALUES (
            'La doctrina de ciberdefensa militar ve los exploits como disuasión activa. Pero la realidad demuestra que las "armas cibernéticas" siempre escapan al control del estado y se vuelven contra los civiles.',
            'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', -- diego_cyber
            v_post_ciber,
            now() - interval '8 hours'
        );
    END IF;
END $$;


-- 5. Insertar votos (interacciones de me gusta)
-- Nota: La inserción en la tabla de votos recalculará automáticamente
-- el conteo en las columnas de posts debido al trigger `update_post_votes_on_change`.

DO $$
DECLARE
    v_post_privacidad BIGINT;
    v_post_licencia BIGINT;
    v_post_ciber BIGINT;
BEGIN
    SELECT id INTO v_post_privacidad FROM public.posts WHERE titulo LIKE 'Reconocimiento facial%' LIMIT 1;
    SELECT id INTO v_post_licencia FROM public.posts WHERE titulo LIKE 'El impacto del software libre%' LIMIT 1;
    SELECT id INTO v_post_ciber FROM public.posts WHERE titulo LIKE 'Ataque Zero-Day%' LIMIT 1;

    -- Votos para Post Privacidad (3 positivos, 1 negativo)
    IF v_post_privacidad IS NOT NULL THEN
        INSERT INTO public.votes (usuario_id, post_id, tipo) VALUES
        ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', v_post_privacidad, 'positivo'), -- ana
        ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', v_post_privacidad, 'positivo'), -- sofia
        ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', v_post_privacidad, 'positivo')  -- diego
        ON CONFLICT (usuario_id, post_id) DO NOTHING;
    END IF;

    -- Votos para Post Licencias de Software (4 positivos)
    IF v_post_licencia IS NOT NULL THEN
        INSERT INTO public.votes (usuario_id, post_id, tipo) VALUES
        ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', v_post_licencia, 'positivo'), -- carlos
        ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', v_post_licencia, 'positivo'), -- ana
        ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', v_post_licencia, 'positivo'), -- sofia
        ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', v_post_licencia, 'positivo')  -- diego
        ON CONFLICT (usuario_id, post_id) DO NOTHING;
    END IF;

    -- Votos para Post Ciberseguridad (2 positivos, 1 negativo)
    IF v_post_ciber IS NOT NULL THEN
        INSERT INTO public.votes (usuario_id, post_id, tipo) VALUES
        ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', v_post_ciber, 'positivo'), -- carlos
        ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', v_post_ciber, 'positivo'), -- sofia
        ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', v_post_ciber, 'negativo')  -- ana (en desacuerdo con guardar exploits)
        ON CONFLICT (usuario_id, post_id) DO NOTHING;
    END IF;
END $$;
