# Spassu - Sistema de Vendas e Comissões

Sistema para uma papelaria registrar vendas e calcular a comissão de vendedores,
com base nas vendas de um período e nos percentuais de comissão cadastrados nos
produtos — respeitando limites mínimos/máximos configuráveis por dia da semana.
Desenvolvido como desafio técnico para a **Spassu**.

**🌐 Aplicação em produção:** https://desafio-alexsandre.duckdns.org

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Deploy](#deploy)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Fluxo de Cálculo de Comissão](#fluxo-de-cálculo-de-comissão)

---

## Sobre o Projeto

O sistema permite cadastrar produtos, clientes e vendedores, registrar vendas
(com múltiplos itens) e consultar, por período, o total de comissão a pagar a
cada vendedor. A regra de negócio central: cada produto tem um percentual de
comissão próprio (0-10%), mas alguns dias da semana podem ter uma faixa
mínima/máxima configurável que limita esse percentual na hora do cálculo.

---

## Arquitetura

O backend segue uma separação por **apps de domínio**, cada um com uma única
responsabilidade, e isola a regra de negócio de comissão numa camada de
**serviços** independente da API — testável sem precisar de HTTP nem admin.

```
backend/
├── catalogo/    # Produto
├── pessoas/     # Cliente, Vendedor (model abstrato compartilhado)
├── vendas/      # Venda, ItemVenda
└── comissoes/   # FaixaComissaoDia + services.py (regra de cálculo)
```

### Decisões de Design

| Padrão | Aplicação |
|--------|-----------|
| **App por domínio** | `catalogo`, `pessoas`, `vendas`, `comissoes` — cada um com um único motivo pra mudar |
| **Camada de serviço isolada** | `comissoes/services.py` calcula comissão em funções puras, sem depender do Django REST Framework — testável isoladamente |
| **Model abstrato** | `Pessoa` (campos comuns) como base de `Cliente`/`Vendedor`, sem tabela própria nem herança multi-tabela |
| **Serializer aninhado gravável** | `VendaSerializer` cria/atualiza a venda e seus itens numa única requisição (`create`/`update` sobrescritos) |
| **Reaproveitamento de validação** | Validações do model (`validators=[...]`) são herdadas automaticamente por Admin e API — sem duplicar regra |
| **Filtro customizado** | `VendaFilterSet` evita o comportamento de quebra-por-palavra do `SearchFilter` padrão do DRF, buscando a frase completa |
| **Número de nota fiscal derivado** | `Venda.numero_nota_fiscal` é uma `@property` calculada a partir do ID, não um campo editável — evita duplicidade/gaps de numeração |

---

## Tecnologias

### Backend
- **[Python 3.14](https://www.python.org/)**
- **[Django 6.1](https://www.djangoproject.com/)** — Framework web
- **[Django REST Framework 3.18](https://www.django-rest-framework.org/)** — API REST
- **[django-filter](https://django-filter.readthedocs.io/)** — Filtros/busca customizados
- **[django-cors-headers](https://github.com/adamchainz/django-cors-headers)** — Libera chamadas do frontend
- **[pytest](https://docs.pytest.org/) + pytest-django** — Testes
- **[Ruff](https://docs.astral.sh/ruff/)** — Lint e formatação (PEP 8, PEP 257)

### Frontend
- **[React 19](https://react.dev/)** — Biblioteca de UI
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática
- **[Vite](https://vitejs.dev/)** — Build tool e dev server
- **[Material UI](https://mui.com/) + MUI X Date Pickers** — Componentes visuais
- **[React Router DOM 7](https://reactrouter.com/)** — Roteamento SPA
- **[dayjs](https://day.js.org/)** — Manipulação de datas

### Testes
- **[Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)** — Testes de componente no frontend

### Deploy
- **[Gunicorn](https://gunicorn.org/) + [Whitenoise](https://whitenoise.readthedocs.io/)** — Servidor WSGI de produção e estáticos do Django Admin
- **[Docker](https://www.docker.com/) + Docker Compose** — Containerização (backend, nginx, certbot)
- **[nginx](https://nginx.org/)** — Proxy reverso, servidor de estáticos do frontend e roteamento por caminho
- **[Certbot](https://certbot.eff.org/) / Let's Encrypt** — Certificado HTTPS renovado automaticamente
- **[GitHub Actions](https://github.com/features/actions)** — CI (testes) + CD (deploy via SSH) a cada push

---

## Funcionalidades

- **Admin** — cadastro de produtos, clientes e vendedores; configuração das
  faixas de comissão mínima/máxima por dia da semana
- **API REST** — CRUD completo de produtos, clientes, vendedores e vendas
  (vendas incluem seus itens numa única requisição); busca, ordenação e
  paginação na listagem de vendas
- **Cálculo de comissão** — aplica o percentual do produto, respeitando o
  limite configurado para o dia da semana da venda
- **Relatório de comissões** — total de vendas e de comissão por vendedor,
  filtrado por período, com total geral
- **Frontend** — telas de Vendas e Comissões seguindo o protótipo Figma

---

## Pré-requisitos

- **Python 3.14** (testado com 3.14.7)
- **Node.js 26** (testado com v26.7.0)

Não é necessário instalar Django/DRF/React manualmente — tudo é resolvido via
`requirements.txt` e `package.json`.

---

## Como Executar

### Backend

```bash
cd backend

python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
# ou, para desenvolvimento (inclui ruff, pytest):
pip install -r requirements-dev.txt

# configurar variáveis de ambiente (SECRET_KEY, DEBUG, banco)
cp .env.example .env
# edite o .env e troque SECRET_KEY por uma chave gerada com:
# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

| Serviço | URL |
|---------|-----|
| API REST | http://127.0.0.1:8000/api/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

### Frontend

```bash
cd frontend

npm install
cp .env.example .env
npm run dev
```

| Serviço | URL |
|---------|-----|
| Aplicação | http://localhost:5173 |

> O backend precisa estar rodando para o frontend conseguir buscar dados da API.

---

## Deploy

A aplicação está publicada em produção numa instância Oracle Cloud (free
tier), com **HTTPS via Let's Encrypt** e **deploy automático via GitHub
Actions** a cada push na branch `master`.

### Arquitetura de produção

```
                    ┌─────────────┐
  Internet ────────▶│    nginx    │── /             → estáticos do React (build)
   (HTTPS)          │ (container) │── /api/, /admin/ → proxy_pass → backend
                    └──────┬──────┘── /static/       → proxy_pass → backend
                           │
                    ┌──────▼──────┐
                    │   backend   │  Django + Gunicorn + Whitenoise
                    │ (container) │
                    └─────────────┘

        certbot (container) — renova o certificado Let's Encrypt sozinho
```

- **`nginx/Dockerfile`** — build multi-stage: builda o frontend (Vite) e serve
  o resultado estático, além de fazer proxy reverso pro backend **por
  caminho** (`/api/`, `/admin/`, `/static/`), já que o domínio usado é único
  (sem subdomínios separados).
- **`backend/Dockerfile`** — roda com `gunicorn` (não `manage.py runserver`,
  que o próprio Django documenta como inadequado pra produção); `whitenoise`
  serve os estáticos do Django Admin sem precisar de configuração no nginx.
- **`docker-compose.yml`** — orquestra os 3 serviços (`backend`, `nginx`,
  `certbot`) com um volume nomeado persistindo o banco SQLite entre deploys
  (sem isso, cada `docker compose up --build` apagaria o banco).
- **`.github/workflows/deploy.yml`** — a cada push em `master`: roda os
  testes do backend (`pytest` + `ruff check`) e do frontend (`vitest` +
  `npm run build`, que pega erros de TypeScript que só aparecem no build de
  produção, não no `npm run dev`); só se tudo passar, conecta via SSH na VPS
  e roda `git pull` + `docker compose up -d --build` + `migrate`.

### Rodando o deploy você mesmo

```bash
# na VPS, com Docker e Docker Compose instalados
git clone <url-do-repositorio>
cd Challenge

# criar backend/.env com valores de produção (ver seção seguinte)

docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

O primeiro certificado HTTPS exige um passo manual único (o Let's Encrypt
precisa validar o domínio antes de existir um certificado pra o nginx usar) —
documentado como comentário no início de `nginx/nginx.conf`.

---

## Variáveis de Ambiente

### Backend (`.env`)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `SECRET_KEY` | Chave secreta do Django (gere a sua, não reutilize a do `.env.example`) | — |
| `DEBUG` | Ativa modo de depuração (nunca `True` em produção) | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por vírgula | `localhost,127.0.0.1` |
| `DATABASE_URL` | Connection string do banco (`sqlite:///...`, `postgres://...`) | `sqlite:///db.sqlite3` |
| `CORS_ALLOWED_ORIGINS` | Origens autorizadas a chamar a API, separadas por vírgula | `http://localhost:5173` |
| `CSRF_TRUSTED_ORIGINS` | Origens confiáveis pra validação de CSRF, separadas por vírgula | `http://localhost:5173` |

### Frontend (`.env`)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_BASE_URL` | URL base da API do backend | `http://localhost:8000/api` |

---

## Endpoints da API

### Produtos / Clientes / Vendedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/produtos/` `/api/clientes/` `/api/vendedores/` | Lista registros |
| `POST` | `/api/produtos/` `/api/clientes/` `/api/vendedores/` | Cria um registro |
| `GET` | `/api/produtos/{id}/` | Detalha um registro |
| `PUT` | `/api/produtos/{id}/` | Atualiza um registro |
| `DELETE` | `/api/produtos/{id}/` | Remove um registro |

### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/vendas/` | Lista vendas (paginado; aceita `?search=`, `?ordering=`, `?cliente=`, `?vendedor=`) |
| `POST` | `/api/vendas/` | Cria uma venda com seus itens numa única chamada |
| `GET` | `/api/vendas/{id}/` | Detalha uma venda |
| `PUT` | `/api/vendas/{id}/` | Atualiza a venda e substitui seus itens |
| `DELETE` | `/api/vendas/{id}/` | Remove a venda (itens em cascata) |

### Comissões

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/comissoes/?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD` | Total de vendas e de comissão por vendedor no período |

---

## Estrutura do Projeto

```
Challenge/
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI (testes) + CD (deploy via SSH)
│
├── backend/
│   ├── config/          # settings, urls
│   ├── catalogo/         # Produto (models, admin, serializers, views, tests)
│   ├── pessoas/          # Cliente, Vendedor
│   ├── vendas/           # Venda, ItemVenda
│   ├── comissoes/        # FaixaComissaoDia, services.py, endpoint de relatório
│   ├── conftest.py        # Fixtures compartilhadas entre testes
│   ├── Dockerfile
│   └── manage.py
│
├── frontend/
│   └── src/
│       ├── api/          # client.ts (chamadas HTTP), types.ts
│       ├── components/   # Layout (header, menu), ícones customizados
│       ├── pages/         # VendasPage, VendaFormPage, ComissoesPage
│       └── theme.ts       # Cores e tipografia customizadas
│
├── nginx/
│   ├── Dockerfile        # build do frontend + imagem final do nginx
│   └── nginx.conf        # proxy reverso por caminho + TLS
│
└── docker-compose.yml    # backend + nginx + certbot
```

---

## Testes

### Backend

```bash
cd backend
pytest -v
```

| Área | Casos testados |
|------|-----------------|
| **Produto (API)** | Listar, criar válido, criar inválido (comissão fora da faixa), atualizar, excluir |
| **Cliente/Vendedor (API)** | Listar, criar válido |
| **Venda (API)** | Criar com itens, quantidade inválida, atualizar substituindo itens, excluir em cascata, paginação, busca, ordenação |
| **Serviço de comissão** | Percentual efetivo (sem faixa, acima do máximo, abaixo do mínimo, dentro da faixa), comissão por item, comissão por venda, comissão agrupada por vendedor/período, contagem de vendas por vendedor |
| **Endpoint de comissões (API)** | Retorno correto por período, data inválida (400), parâmetros ausentes (400) |

### Frontend

```bash
cd frontend
npx vitest run
```

| Área | Casos testados |
|------|-----------------|
| **ComissoesPage** | Mensagem inicial antes de buscar, título do relatório |
| **VendasPage** | Lista vendas retornadas pela API |
| **VendaFormPage** | Botão "Finalizar" começa desabilitado até o formulário ser preenchido |

---

## Fluxo de Cálculo de Comissão

```
Venda criada, com um ou mais itens
         │
         ▼
Para cada item: percentual de comissão do Produto
         │
         ▼
Existe FaixaComissaoDia para o dia da semana da venda?
    │               │
   Não              Sim
    │               │
    ▼               ▼
Usa o percentual   Limita o percentual entre
do produto         a faixa mínima e máxima
    │               │
    └───────┬───────┘
            ▼
  Comissão do item = subtotal × percentual efetivo
            │
            ▼
  Comissão da venda = soma das comissões dos itens
            │
            ▼
  Comissão do vendedor no período = soma das comissões
  de todas as suas vendas no intervalo de datas
```

---

Desenvolvido por **Alexsandre Araujo** como desafio técnico para a **Spassu**.
