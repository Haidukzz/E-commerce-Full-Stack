<div align="center">

# 🛒 ShopX — Plataforma Empresarial de E-Commerce

**Full Stack · Java 17 · Spring Boot 3.2 · React 18 · PostgreSQL · Docker · JWT**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)

![Status](https://img.shields.io/badge/status-✅_Funcionando-success?style=flat-square)
![Testes](https://img.shields.io/badge/testes-31_automatizados-purple?style=flat-square)
![Cobertura](https://img.shields.io/badge/cobertura-60%25+-yellow?style=flat-square)
![Licença](https://img.shields.io/badge/licença-MIT-blue?style=flat-square)

</div>

---

## 📌 Sobre o Projeto

Sistema completo de **gestão de vendas e inventário** desenvolvido do zero, cobrindo toda a stack — do banco de dados ao frontend React. Simula um ambiente real de produção com arquitetura em camadas, segurança JWT, migrations versionadas com Flyway e containerização completa com Docker Compose.

> 💡 **Motivação:** construir um projeto real e complexo, com os mesmos problemas que desenvolvedores enfrentam no mercado — sem atalhos, sem tutoriais passo a passo.

---

## ✨ Funcionalidades

### 🛍️ Portal do Cliente (React)
- Catálogo com busca em tempo real e filtro por categoria
- Carrinho de compras persistido via Context API
- Cupons de desconto (percentual e valor fixo)
- Checkout + criação de pedido com reserva automática de estoque
- Histórico de pedidos com acompanhamento de status
- Processamento de pagamentos: PIX, Cartão, Boleto

### ⚙️ Painel Administrativo (React)
- Dashboard com KPIs em tempo real: receita, pedidos, estoque, usuários
- CRUD completo de Produtos com ajuste de estoque
- Pipeline de status de pedidos com avanço por etapa
- CRUD de Categorias com emoji automático por tipo
- Gestão de Usuários com badges de perfil

### 🔐 Segurança
- JWT stateless com expiração de 24h
- RBAC com 3 perfis: `ADMIN`, `MANAGER`, `USER`
- BCrypt para senhas, Bean Validation nas entradas
- GlobalExceptionHandler centralizado

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│           React 18 SPA (Vite + React Router 6)          │
│    LoginPage · ShopPage · OrdersPage · AdminPage        │
└──────────────────────┬──────────────────────────────────┘
                       │  REST / JSON (Axios + JWT)
┌──────────────────────▼──────────────────────────────────┐
│                 Spring Boot 3.2 API                      │
│   Controller → Service → Repository → Entity            │
│   Spring Security 6 · Flyway · OpenAPI/Swagger          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         PostgreSQL 15 · 11 tabelas · Flyway             │
└─────────────────────────────────────────────────────────┘
```

**Fluxo de Status do Pedido:**
```
PENDENTE → AGUARDANDO_PAGAMENTO → PAGO → EM_SEPARAÇÃO → ENVIADO → ENTREGUE
         ↘ CANCELADO              ↘ CANCELADO
```

---

## 🧱 Stack Tecnológico

| Camada | Tecnologia | Detalhe |
|--------|-----------|---------|
| **Backend** | Java 17 LTS | Spring Boot 3.2 |
| **Segurança** | Spring Security 6 | JWT + BCrypt + RBAC |
| **ORM** | Spring Data JPA | Hibernate 6 + PostgreSQL 15 |
| **Migrations** | Flyway | V1, V2, V3 versionados |
| **Frontend** | React 18 | Vite + React Router 6 + Axios |
| **Estado global** | Context API | AuthContext + CartContext |
| **Testes** | JUnit 5 + Mockito | AssertJ + MockMvc |
| **Build** | Maven 3.8 + Node 20 | Multi-stage Docker |
| **Deploy** | Docker Compose | 5 serviços orquestrados |
| **Serve** | Nginx | Proxy /api → Spring Boot |
| **Docs** | SpringDoc OpenAPI 3 | Swagger UI integrado |
| **CI/CD** | GitHub Actions | Build, test, OWASP scan |

---

## 🚀 Como Executar

### Pré-requisito único
[Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/shopx-ecommerce.git
cd shopx-ecommerce
```

### 2. Subir todos os serviços
```bash
docker compose up -d
```

> O Docker vai baixar as imagens, compilar o Java e o React, aplicar as migrations e seed data automaticamente.

### 3. Acessar
| Serviço | URL |
|---------|-----|
| **🛍️ Frontend React** | http://localhost:3000 |
| **📚 Swagger UI** | http://localhost:8080/swagger-ui.html |
| **❤️ Health Check** | http://localhost:8080/actuator/health |
| **🗄️ PgAdmin** | http://localhost:5050 |

### 4. Credenciais padrão (seed data)
| Perfil | Email | Senha |
|--------|-------|-------|
| 🔴 Admin | admin@ecommerce.com | Admin@123 |
| 🟡 Gerente | gerente@ecommerce.com | Manager@123 |
| 🟢 Cliente | joao.silva@email.com | Cliente@123 |

---

## 📁 Estrutura do Projeto

```
shopx-ecommerce/
├── shopx-frontend/              # React 18 + Vite
│   ├── src/
│   │   ├── api/client.js        # Axios + interceptors JWT
│   │   ├── context/             # AuthContext + CartContext
│   │   ├── components/          # ui.jsx, Navbar, CartDrawer, Toast
│   │   ├── pages/               # Login, Shop, Orders, Admin
│   │   └── utils/helpers.js     # formatBRL, getCategoryEmoji
│   ├── Dockerfile               # Multi-stage: Node → Nginx
│   └── nginx.conf               # Proxy /api → Spring Boot
│
├── src/main/java/com/ecommerce/
│   ├── config/                  # SecurityConfig, OpenApiConfig
│   ├── controller/              # 7 REST Controllers
│   ├── dto/                     # Request & Response DTOs
│   ├── entity/                  # 12 Entidades JPA
│   ├── exception/               # GlobalExceptionHandler
│   ├── repository/              # Spring Data + JPQL explícito
│   ├── security/                # JWT Filter + UserDetailsService
│   └── service/                 # Regras de negócio
│
├── src/main/resources/
│   └── db/migration/            # V1__schema, V2__seed, V3__fix
│
├── Dockerfile                   # Multi-stage: Maven → JRE Alpine
├── docker-compose.yml           # 5 serviços: db, redis, app, frontend, pgadmin
└── pom.xml
```

---

## 🧪 Testes

```bash
# Executar todos os testes
mvn test

# Relatório de cobertura JaCoCo
mvn verify
# Abrir: target/site/jacoco/index.html
```

| Classe de Teste | Cenários | Testes |
|-----------------|---------|--------|
| `ProdutoServiceTest` | CRUD, estoque, SKU duplicado | 6 |
| `PedidoServiceTest` | Criação, cancelamento, devolução de estoque | 5 |
| `StatusPedidoTest` | 12 transições de status parametrizadas | 12 |
| `CupomTest` | % desconto, valor fixo, validade, usos | 6 |
| `AuthControllerTest` | Login, validação, MockMvc | 2 |

---

## 📡 Endpoints Principais

```
# Autenticação
POST   /api/auth/login              → Login (retorna JWT)
POST   /api/auth/registrar          → Cadastro

# Catálogo (público)
GET    /api/produtos                → Listar/filtrar produtos
GET    /api/categorias              → Listar categorias

# Produtos (MANAGER+)
POST   /api/produtos                → Criar produto
PUT    /api/produtos/{id}           → Atualizar produto
PATCH  /api/produtos/{id}/estoque   → Ajustar estoque
DELETE /api/produtos/{id}           → Inativar

# Pedidos
POST   /api/pedidos                 → Criar pedido
GET    /api/pedidos/meus            → Meus pedidos
PATCH  /api/pedidos/{id}/status     → Avançar status (MANAGER+)
POST   /api/pedidos/{id}/cancelar   → Cancelar

# Pagamentos
POST   /api/pagamentos/pedido/{id}  → Processar pagamento

# Relatórios (MANAGER+)
GET    /api/relatorios/dashboard    → KPIs gerenciais
GET    /api/relatorios/estoque-baixo → Alertas
```

---

## 🐛 Desafios Técnicos Superados

Problemas reais de produção encontrados e resolvidos durante o desenvolvimento:

| Problema | Solução |
|----------|---------|
| `SERIAL` vs `BIGINT` — incompatibilidade Hibernate/PostgreSQL | Migração Flyway `V3` com `ALTER TABLE ... TYPE BIGINT` |
| Dependência circular Spring Security (`JwtFilter ↔ UserDetailsService`) | Anotação `@Lazy` na injeção de dependência |
| `lower(bytea)` — Hibernate 6 envia `null` como bytes ao PostgreSQL | `CAST(:nome AS string)` na query JPQL |
| `findByPedidoId` falha após `@JsonIgnore` no campo `pedido` | Query `@Query` JPQL explícita substituindo método derivado |
| `LazyInitializationException` fora da transação JPA | `JOIN FETCH` nas queries + `open-in-view=true` |
| Hashes BCrypt inválidos no seed Flyway | Regeneração com Python bcrypt com prefixo `$2a$` |
| CORS bloqueando requests do frontend React | `CorsConfigurationSource` com `allowedOriginPatterns` |

---

## 📝 Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.

---

<div align="center">

Feito com ☕ e muita persistência

**[LinkedIn](https://www.linkedin.com/in/gustavo-haiduk-17287a278/) · [Email](mailto:gustavorau250@gmail.com)**

</div>
