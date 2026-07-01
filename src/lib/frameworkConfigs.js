/**
 * AllowOrigin — Framework Configs
 * 9 production-ready CORS configuration templates.
 * Each config() fn receives the parsed error object and returns
 * a context-aware code string with the real origin pre-filled.
 */

const O = (parsed) => parsed?.origin ?? 'https://your-frontend.com'

export const FRAMEWORKS = [
  // ── Express.js ──────────────────────────────────────────
  {
    id: 'express',
    name: 'Express',
    badge: 'express',
    language: 'javascript',
    install: 'npm install cors',
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `const cors = require('cors')

app.use(cors({
  origin: '${origin}',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],${creds ? '\n  credentials: true,' : ''}
}))

// If you need per-route CORS, use it as middleware:
// app.get('/api/data', cors({ origin: '${origin}' }), handler)`
    },
    note: 'Add before your routes in app.js or server.js',
  },

  // ── Fastify ─────────────────────────────────────────────
  {
    id: 'fastify',
    name: 'Fastify',
    badge: 'fastify',
    language: 'javascript',
    install: 'npm install @fastify/cors',
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `await fastify.register(require('@fastify/cors'), {
  origin: '${origin}',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],${creds ? '\n  credentials: true,' : ''}
})`
    },
    note: 'Register the plugin before defining routes',
  },

  // ── Nginx ───────────────────────────────────────────────
  {
    id: 'nginx',
    name: 'Nginx',
    badge: 'nginx',
    language: 'nginx',
    install: null,
    config: (p) => {
      const origin = O(p)
      return `server {
  location / {
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
      add_header 'Access-Control-Allow-Origin' '${origin}';
      add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
      add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
      add_header 'Access-Control-Max-Age' 86400;
      add_header 'Content-Length' 0;
      return 204;
    }

    add_header 'Access-Control-Allow-Origin' '${origin}' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
  }
}`
    },
    note: 'Add inside your server { } block in nginx.conf',
  },

  // ── FastAPI ─────────────────────────────────────────────
  {
    id: 'fastapi',
    name: 'FastAPI',
    badge: 'fastapi',
    language: 'python',
    install: 'pip install fastapi',
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["${origin}"],
    allow_credentials=${creds ? 'True' : 'False'},
    allow_methods=["*"],
    allow_headers=["*"],
)`
    },
    note: 'Add after creating your FastAPI() app instance',
  },

  // ── Django ──────────────────────────────────────────────
  {
    id: 'django',
    name: 'Django',
    badge: 'django',
    language: 'python',
    install: 'pip install django-cors-headers',
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `# settings.py

INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "${origin}",
]
${creds ? '\nCORS_ALLOW_CREDENTIALS = True' : ''}`
    },
    note: 'CorsMiddleware must be placed before CommonMiddleware',
  },

  // ── Spring Boot ─────────────────────────────────────────
  {
    id: 'spring',
    name: 'Spring',
    badge: 'spring',
    language: 'java',
    install: null,
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("${origin}")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")${creds ? '\n            .allowCredentials(true)' : ''};
    }
}`
    },
    note: 'Add this class to your config package',
  },

  // ── Laravel ─────────────────────────────────────────────
  {
    id: 'laravel',
    name: 'Laravel',
    badge: 'laravel',
    language: 'php',
    install: null,
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `<?php
// config/cors.php

return [
    'paths'                => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'      => ['*'],
    'allowed_origins'      => ['${origin}'],
    'allowed_origins_patterns' => [],
    'allowed_headers'      => ['*'],
    'exposed_headers'      => [],
    'max_age'              => 0,
    'supports_credentials' => ${creds ? 'true' : 'false'},
];`
    },
    note: 'Run php artisan config:clear after changes',
  },

  // ── Go (Gin) ─────────────────────────────────────────────
  {
    id: 'gin',
    name: 'Go / Gin',
    badge: 'gin',
    language: 'go',
    install: 'go get github.com/gin-contrib/cors',
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `import "github.com/gin-contrib/cors"

config := cors.Config{
    AllowOrigins:     []string{"${origin}"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
    AllowHeaders:     []string{"Content-Type", "Authorization"},${creds ? '\n    AllowCredentials: true,' : ''}
    MaxAge:           12 * time.Hour,
}

r.Use(cors.New(config))`
    },
    note: 'Add before registering route handlers',
  },

  // ── ASP.NET Core ────────────────────────────────────────
  {
    id: 'aspnet',
    name: 'ASP.NET',
    badge: 'aspnet',
    language: 'csharp',
    install: null,
    config: (p) => {
      const origin = O(p)
      const creds  = p?.needsCredentials
      return `// Program.cs

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", policy =>
        policy
            .WithOrigins("${origin}")
            .AllowAnyMethod()
            .AllowAnyHeader()${creds ? '\n            .AllowCredentials()' : ''});
});

// After builder.Build():
app.UseCors("AllowOrigin");

// Note: UseCors must come before UseRouting and UseAuthorization`
    },
    note: 'UseCors() must be placed before UseRouting() in the pipeline',
  },
]
