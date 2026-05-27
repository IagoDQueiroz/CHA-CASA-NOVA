# Cha de Casa Nova

Aplicacao web para organizar uma lista de presentes de cha de casa nova.

O projeto permite cadastrar produtos, exibir a lista para convidados e registrar contribuicoes de forma simples. A area administrativa e protegida por codigo enviado por e-mail.

## O que o projeto faz

- Exibe uma lista publica de presentes.
- Permite buscar e filtrar produtos.
- Mostra status dos itens disponiveis e ja presenteados.
- Permite que convidados registrem uma contribuicao.
- Possui painel administrativo para gerenciar produtos.
- Envia codigo de acesso por e-mail para login administrativo.
- Protege a sessao administrativa com validacao por dispositivo.

## Utilidade

O sistema substitui listas manuais ou planilhas.

Ele centraliza os presentes em uma pagina publica, facilita a escolha dos convidados e ajuda o administrador a acompanhar o que ja foi escolhido.

Tambem pode ser adaptado para outros eventos, como casamento, aniversario, cha de bebe ou listas colaborativas.

## Tecnologias

- ASP.NET Core MVC
- Razor Views
- Entity Framework Core
- MySQL
- Bootstrap
- CSS customizado
- SMTP para envio de e-mail
- Session e MemoryCache para controle de acesso

## Banco de dados

O projeto usa MySQL.

A connection string deve ser configurada fora do codigo, por variavel de ambiente ou User Secrets.

Nome esperado:

```txt
ConnectionStrings__CHA_CASA_NOVA_ADRIANAContext
```

## Configuracao de e-mail

O envio de codigo administrativo usa SMTP.

Variaveis esperadas:

```txt
AdminEmail__From
AdminEmail__To
AdminEmail__SmtpHost
AdminEmail__SmtpPort
AdminEmail__Username
AdminEmail__Password
```

Exemplo de host SMTP:

```txt
smtp.gmail.com
```

Porta comum:

```txt
587
```

## Execucao local

Configure os segredos localmente com User Secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:CHA_CASA_NOVA_ADRIANAContext" "SUA_CONNECTION_STRING"
dotnet user-secrets set "AdminEmail:From" "SEU_EMAIL"
dotnet user-secrets set "AdminEmail:To" "EMAIL_DESTINO"
dotnet user-secrets set "AdminEmail:SmtpHost" "smtp.gmail.com"
dotnet user-secrets set "AdminEmail:SmtpPort" "587"
dotnet user-secrets set "AdminEmail:Username" "SEU_EMAIL"
dotnet user-secrets set "AdminEmail:Password" "SUA_SENHA_DE_APP"
```

Depois execute:

```powershell
dotnet run
```

## Publicacao

Para publicar:

```powershell
dotnet publish -c Release
```

Na hospedagem, configure as variaveis de ambiente antes de iniciar o site.

## Seguranca

O projeto evita manter senhas no repositorio.

As configuracoes sensiveis devem ficar em:

- User Secrets no ambiente local.
- Variaveis de ambiente no servidor.

A area administrativa usa codigo temporario por e-mail, limite de tentativas e validacao da sessao por caracteristicas do dispositivo.

## Empresa

Desenvolvido por WithCode.
