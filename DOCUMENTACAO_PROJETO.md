# Documentação do Projeto - Chá de Casa Nova

## 1. Visão geral

O projeto **Chá de Casa Nova** é uma aplicação web desenvolvida em ASP.NET Core MVC para gerenciar uma lista de presentes.

A aplicação permite que visitantes visualizem produtos disponíveis, escolham um item e registrem uma doação. Também possui uma área administrativa protegida para gerenciamento completo da lista.

O sistema foi pensado para ser simples, direto e funcional, com foco em uso real por convidados e administração prática.

## 2. Empresa

O projeto é desenvolvido pela **WithCode**.

Informações da empresa:

- Nome: WithCode
- WhatsApp: 82 99322-4753
- E-mail: iagofilipe21y@outlook.com

A WithCode aparece no rodapé da aplicação como responsável pelo desenvolvimento.

## 3. Objetivo da aplicação

O objetivo é oferecer uma plataforma simples para:

- exibir uma lista de presentes;
- permitir que convidados escolham um produto;
- registrar a intenção de doação;
- evitar doações duplicadas para o mesmo item;
- facilitar o controle administrativo da lista.

## 4. Tecnologias utilizadas

- .NET 10
- ASP.NET Core MVC
- Razor Views
- Entity Framework Core
- MySQL
- Pomelo.EntityFrameworkCore.MySql
- Bootstrap
- CSS customizado
- Sessão ASP.NET Core
- SMTP para envio de código administrativo

## 5. Banco de dados

O projeto foi adaptado para usar **MySQL**, pensando em hospedagem web com suporte a esse banco.

Provider usado:

```xml
Pomelo.EntityFrameworkCore.MySql
```

O banco é acessado pelo `CHA_CASA_NOVA_ADRIANAContext`.

O projeto usa:

```csharp
Database.EnsureCreated();
```

Isso permite criar as tabelas automaticamente quando o banco estiver vazio.

## 6. Modelo principal

O principal modelo do sistema é `Produto`.

Campos:

- `Id`
- `Nome`
- `Descricao`
- `Valor`
- `ImagemUrl`
- `Categoria`
- `Doado`
- `Doador`
- `TelefoneDoador`
- `EmailDoador`
- `Quantidade`
- `LinkProduto`
- `FormaEntrega`

## 7. Fluxo público

O visitante acessa a página inicial e visualiza a lista de presentes.

Na home, ele pode:

- buscar produto por texto;
- filtrar por status;
- filtrar por categoria;
- filtrar por valor máximo;
- abrir detalhes do produto;
- iniciar uma doação.

Ao doar, o visitante informa:

- nome;
- telefone;
- e-mail opcional;
- forma de entrega.

Após confirmar, o produto é marcado como doado e o visitante é enviado para uma página de agradecimento.

## 8. Fluxo administrativo

A área administrativa permite:

- acessar painel admin;
- cadastrar produto;
- editar produto;
- excluir produto;
- visualizar doador;
- desfazer doação;
- ver resumo geral da lista.

O painel administrativo mostra:

- total de produtos;
- produtos disponíveis;
- produtos doados;
- valor total dos itens;
- tabela com ações por produto.

## 9. Autenticação administrativa

O login administrativo é feito por código enviado por e-mail.

Características atuais:

- código alfanumérico com 8 caracteres;
- geração com `RandomNumberGenerator`;
- validade de 15 minutos;
- limite de tentativas por sessão;
- limite de tentativas por IP;
- limite de solicitações de código por IP;
- código armazenado em hash SHA-256;
- comparação segura contra timing attack;
- sessão vinculada ao dispositivo/acesso.

## 10. Segurança de sessão

A sessão admin é vinculada a um fingerprint gerado a partir de:

- navegador;
- idioma;
- client hints;
- IP.

Se alguém copiar o cookie de sessão e tentar usar em outro ambiente, o sistema invalida o acesso e redireciona para o login.

Configuração do cookie:

- `HttpOnly`
- `Secure`
- `SameSite=Strict`
- expiração de 20 minutos

## 11. Segurança geral

Medidas aplicadas:

- uso de Entity Framework Core com queries parametrizadas;
- proteção contra SQL Injection;
- Razor encoding automático contra XSS básico;
- validação antiforgery em formulários POST;
- links externos com `rel="noopener noreferrer"`;
- validação para aceitar apenas URLs HTTPS em links e imagens;
- headers básicos de segurança:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`

## 12. Pontos importantes de segurança

As credenciais foram removidas do `appsettings.json`.

Para produção, as credenciais devem ser configuradas via:

- variáveis de ambiente;
- painel da hospedagem;
- User Secrets em ambiente local.

Não devem ser versionados:

- senha do banco;
- usuário do banco;
- senha SMTP;
- app password do Gmail;
- qualquer token sensível.

## 13. Frontend

O frontend usa Razor Views com CSS próprio.

Principais telas:

- Home pública;
- Detalhes do produto;
- Formulário de doação;
- Página de obrigado;
- Login administrativo;
- Painel administrativo;
- Cadastro/edição de produto;
- Exclusão de produto.

O layout possui:

- favicon personalizado;
- footer compartilhado;
- identidade da WithCode;
- responsividade para mobile;
- cards de produtos;
- filtros;
- painel admin responsivo.

## 14. Estrutura de arquivos

```text
Controllers/
  LoginController.cs
  ProdutosController.cs

Data/
  CHA_CASA_NOVA_ADRIANAContext.cs

Filters/
  AdminRequiredAttribute.cs

Helpers/
  AdminSecurity.cs

Models/
  Produto.cs

Views/
  Login/
  Produtos/
  Shared/

wwwroot/
  css/
  favicon.png
```

## 15. Arquivos principais

### `Program.cs`

Configura:

- banco MySQL;
- MVC;
- sessão;
- cookies;
- headers de segurança;
- criação automática do banco;
- rotas.

### `ProdutosController.cs`

Controla:

- home pública;
- filtros;
- detalhes;
- doação;
- página de obrigado;
- CRUD admin;
- desfazer doação.

### `LoginController.cs`

Controla:

- envio do código;
- validação do código;
- login admin;
- logout;
- rate limit.

### `AdminSecurity.cs`

Responsável por:

- gerar código seguro;
- criar hash;
- comparar hash com segurança;
- gerar fingerprint do dispositivo;
- obter IP do cliente.

### `AdminRequiredAttribute.cs`

Protege rotas administrativas e valida se a sessão pertence ao mesmo ambiente/dispositivo.

## 16. Configuração local

Exemplo de connection string MySQL:

```json
"ConnectionStrings": {
  "CHA_CASA_NOVA_ADRIANAContext": "Server=localhost;Port=3306;Database=cha_casa_nova_adriana;User=root;Password=1234;"
}
```

Exemplo de configuração SMTP:

```json
"AdminEmail": {
  "From": "email-origem",
  "To": "email-destino",
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "Username": "usuario-smtp",
  "Password": "senha-smtp"
}
```

## 17. Como executar

Restaurar pacotes:

```powershell
dotnet restore
```

Compilar:

```powershell
dotnet build
```

Executar:

```powershell
dotnet run
```

## 18. Deploy

Para publicar em hospedagem web:

1. Confirmar suporte à versão do .NET.
2. Criar banco MySQL no painel da hospedagem.
3. Configurar connection string real.
4. Configurar SMTP real.
5. Garantir HTTPS ativo.
6. Publicar a aplicação.
7. Testar login admin.
8. Testar cadastro de produto.
9. Testar fluxo de doação.

## 19. Melhorias futuras

Sugestões para evolução:

- autenticação com ASP.NET Identity;
- painel de logs de acesso;
- histórico de doações;
- exportação de doadores;
- upload real de imagens;
- categorias cadastráveis;
- página de configurações para contato, endereço e PIX;
- integração com WhatsApp;
- serviço SMTP transacional;
- dashboard administrativo mais completo.

## 20. Estado atual

O projeto atualmente possui:

- lista pública funcional;
- painel administrativo;
- login admin reforçado;
- MySQL configurado;
- frontend responsivo;
- favicon personalizado;
- footer compartilhado;
- validações básicas;
- proteções iniciais de segurança;
- estrutura pronta para hospedagem web.
