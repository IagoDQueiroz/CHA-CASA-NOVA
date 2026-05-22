# Contexto do Projeto

## Visão geral

Aplicação ASP.NET Core MVC para uma lista de presentes de Chá de Casa Nova.

A home pública mostra produtos disponíveis. Visitantes escolhem um item, informam seus dados e registram a doação. A área administrativa permite cadastrar, editar, excluir produtos, ver doadores e desfazer doações.

## Empresa

- Nome: WithCode
- WhatsApp: 82 99322-4753
- E-mail: iagofilipe21y@outlook.com

Essas informações aparecem no rodapé público e em pontos de contato da aplicação.

## Stack

- .NET 10
- ASP.NET Core MVC
- Razor Views
- Entity Framework Core
- MySQL
- Bootstrap
- CSS próprio em `wwwroot/css/site.css`

## Arquivos principais

- `Program.cs`: configura MVC, sessão, banco, migrations e fallback da coluna `Categoria`.
- `Models/Produto.cs`: modelo dos itens da lista.
- `Data/CHA_CASA_NOVA_ADRIANAContext.cs`: DbContext.
- `Controllers/ProdutosController.cs`: home, detalhes, doação, admin e CRUD.
- `Controllers/LoginController.cs`: login admin por código.
- `Filters/AdminRequiredAttribute.cs`: proteção das rotas administrativas.

## Fluxo público

1. Usuário acessa a home.
2. Filtra produtos por busca, status, categoria ou valor máximo.
3. Abre detalhes ou clica em `Quero Doar`.
4. Informa nome, telefone, e-mail opcional e forma de entrega.
5. Confirma a doação.
6. Produto fica marcado como doado.
7. Usuário vai para a página de obrigado.

## Fluxo admin

1. Admin acessa a área administrativa.
2. Solicita código.
3. Informa o código recebido ou o código local em desenvolvimento.
4. Acessa o painel admin.
5. Pode cadastrar, editar, excluir, ver detalhes e desfazer doações.

## Login admin

- Usa sessão.
- Código de 4 dígitos.
- Validade de 15 minutos.
- Limite de 5 tentativas.
- Em desenvolvimento, se o SMTP falhar, o código aparece na tela.

## Banco

O projeto foi adaptado para MySQL para deploy na SmarterASP.NET.

Provider atual:

```xml
Pomelo.EntityFrameworkCore.MySql
```

O app usa `Database.EnsureCreated()` no startup para criar as tabelas quando o banco estiver vazio.

Connection string padrão local:

```json
"Server=localhost;Port=3306;Database=cha_casa_nova_adriana;User=root;Password=1234;"
```

Na SmarterASP.NET, substituir pelos dados reais do painel MySQL.

## Views principais

- `Views/Produtos/Index.cshtml`: home pública.
- `Views/Produtos/Details.cshtml`: detalhes e formulário de doação.
- `Views/Produtos/Create.cshtml`: cadastro e edição.
- `Views/Produtos/Admin.cshtml`: painel administrativo.
- `Views/Produtos/Obrigado.cshtml`: confirmação pós-doação.
- `Views/Login/Index.cshtml`: login admin.

## Comandos úteis

```powershell
dotnet build
dotnet run
dotnet ef database update
```

## Observações

- O app ainda usa SMTP Gmail, que pode falhar por bloqueio de rede ou porta 587.
- Para produção, mover credenciais para variáveis de ambiente ou User Secrets.
- O projeto não usa ASP.NET Identity.
