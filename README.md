# Chá de Casa Nova

Aplicação web para gerenciamento de uma lista de presentes de Chá de Casa Nova.

O projeto permite que visitantes visualizem os produtos disponíveis, escolham um item e registrem a doação. Também possui uma área administrativa para cadastrar, editar, excluir e acompanhar os itens da lista.

## Funcionalidades

- Listagem pública de presentes.
- Filtro por busca, status, categoria e valor máximo.
- Página de detalhes de cada produto.
- Registro de doação com nome, telefone, e-mail e forma de entrega.
- Marcação automática de produto como doado.
- Página de confirmação após a doação.
- Área administrativa protegida por código.
- Painel administrativo com resumo da lista.
- Cadastro, edição e exclusão de produtos.
- Opção para desfazer doação.
- Preview da imagem no cadastro do produto.
- Layout responsivo para desktop e mobile.
- Favicon personalizado.

## Tecnologias

- .NET 10
- ASP.NET Core MVC
- Razor Views
- Entity Framework Core
- MySQL
- Bootstrap

## Estrutura do projeto

```text
Controllers/
  LoginController.cs
  ProdutosController.cs

Data/
  CHA_CASA_NOVA_ADRIANAContext.cs

Filters/
  AdminRequiredAttribute.cs

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

## Como funciona

### Fluxo público

1. O visitante acessa a página inicial.
2. Visualiza os produtos da lista.
3. Filtra os produtos se desejar.
4. Abre os detalhes de um item.
5. Preenche os dados da doação.
6. Confirma a doação.
7. O item fica marcado como doado.
8. O visitante é redirecionado para a página de agradecimento.

### Fluxo administrativo

1. O administrador acessa a área administrativa.
2. Solicita um código de acesso.
3. Informa o código recebido.
4. Acessa o painel administrativo.
5. Pode cadastrar, editar, excluir produtos e desfazer doações.

## Modelo principal

O sistema trabalha principalmente com o modelo `Produto`.

Campos principais:

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

## Banco de dados

O projeto está configurado para usar MySQL.

Connection string em `appsettings.json`:

```json
"ConnectionStrings": {
  "CHA_CASA_NOVA_ADRIANAContext": "Server=localhost;Port=3306;Database=cha_casa_nova_adriana;User=root;Password=1234;"
}
```

Para hospedagem, substitua pelos dados do provedor.

Exemplo:

```json
"ConnectionStrings": {
  "CHA_CASA_NOVA_ADRIANAContext": "Server=SERVIDOR;Port=3306;Database=BANCO;User=USUARIO;Password=SENHA;"
}
```

O projeto usa:

```csharp
Database.EnsureCreated();
```

Isso cria as tabelas automaticamente caso o banco esteja vazio.

## Configuração de e-mail

O login administrativo usa envio de código por e-mail.

Configuração em `appsettings.json`:

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

Em ambiente de desenvolvimento, se o envio de e-mail falhar, o sistema mostra o código localmente na tela.

## Como rodar localmente

1. Clone o repositório.

```bash
git clone URL_DO_REPOSITORIO
```

2. Entre na pasta do projeto.

```bash
cd CHA-CASA-NOVA-ADRIANA-master
```

3. Configure a connection string do MySQL no `appsettings.json`.

4. Restaure e compile o projeto.

```bash
dotnet restore
dotnet build
```

5. Rode a aplicação.

```bash
dotnet run
```

6. Acesse a URL exibida no terminal.

## Deploy

O projeto foi adaptado para hospedagem com MySQL, como em provedores que oferecem banco MySQL para aplicações ASP.NET.

Antes de publicar:

- Configure a connection string real do MySQL.
- Configure os dados SMTP.
- Remova senhas sensíveis do repositório.
- Use variáveis de ambiente ou configuração segura do provedor.
- Confirme se o provedor suporta a versão do .NET usada no projeto.

## Segurança

O projeto possui:

- Proteção simples da área administrativa por sessão.
- Código de acesso com validade.
- Limite de tentativas.
- Validação antiforgery em formulários sensíveis.
- Proteção básica em links externos com `rel="noopener noreferrer"`.

## Personalização

Informações usadas no projeto:

- Empresa: WithCode
- WhatsApp: 82 99322-4753
- E-mail: iagofilipe21y@outlook.com

Essas informações aparecem no rodapé e em pontos de contato da aplicação.

## Status

Projeto funcional para:

- listar presentes;
- registrar doações;
- administrar produtos;
- rodar com MySQL;
- publicar em hospedagem ASP.NET com suporte a MySQL.
