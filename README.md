# 🏠 Chá de Casa Nova — Vitória & Rodrigo

> Uma aplicação web premium, elegante e moderna desenvolvida em **ASP.NET Core MVC** para gerenciar listas de presentes e interação de convidados em eventos especiais.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído seguindo as melhores práticas da arquitetura MVC e design responsivo moderno:

* **Backend**: `.NET 10.0 (ASP.NET Core MVC)`
* **Persistência & ORM**: `Entity Framework Core 9.0`
* **Banco de Dados**: `MySQL` (via Pomelo Entity Framework Core Provider)
* **Frontend**: `HTML5`, `CSS3 (Vanilla Premium)`, `Javascript (ES6+)`
* **Sessão & Segurança**: Caching em memória, Criptografia C-Sharp nativa, Tokens Anti-forgery (CSRF).

---

## ✨ Funcionalidades Principais

### 🌟 Para os Convidados (Público)
* **Landing Page Elegante**: Design minimalista e premium com efeitos de transição suaves, sessão de história do casal e cards Polaroids interativos.
* **Catálogo Completo de Presentes**: Grade de presentes com busca instantânea por texto, ordenação de preços/desejos e filtros inteligentes por categorias (Cozinha, Banheiro, Quarto, Eletros, etc.) sem recarregar a página.
* **Modal de Reserva Intuitivo**: Permite escolher a forma de entrega (Pix com cópia de chave rápida, entrega física ou em mãos) registrando o doador diretamente no banco de dados.
* **Mural de Recados Dinâmico**: Os convidados podem deixar mensagens de carinho que são gravadas no banco de dados e exibidas instantaneamente no mural principal.

### 🛡️ Para os Administradores (Área Restrita)
* **Login Criptografado por Senha**: Autenticação limpa validada via variáveis de ambiente do servidor, garantindo segurança robusta sem hardcode de credenciais.
* **Prevenção de Ataques (Brute Force & Session Hijacking)**: Limite de tentativas de login por IP e validação criptográfica de sessão baseada na assinatura do dispositivo do administrador (*Fingerprint*).
* **Indicadores Financeiros Dinâmicos**: Cards de métricas exibindo o total de itens, valor total do catálogo, valor já recebido (doado) e valor pendente (disponível).
* **Gestão de Itens & Recados**: CRUD completo de produtos (Cadastrar, Editar, Excluir) e gerenciador de recados (Log e exclusão de mensagens inadequadas).
* **Histórico de Doações (Log)**: Tabela de logs mostrando a data/hora exata de cada reserva, informações de contato do doador, forma de entrega escolhida e opção de "Liberar Item" para reverter o status caso necessário.

---

## 🔑 Configuração de Variáveis de Ambiente

Para o funcionamento correto do site em produção e desenvolvimento, defina as seguintes configurações:

### 1. Banco de Dados MySQL
* **Chave**: `ConnectionStrings:CHA_CASA_NOVA_ADRIANAContext`
* **Descrição**: String de conexão padrão do seu banco de dados MySQL.

### 2. Credenciais de Login
* **Chave**: `ADMIN_PASSWORD_ADRIANA`
  * *Descrição*: Senha mestra de acesso da Adriana (noiva/cliente).
* **Chave**: `ADM_PASSWORD_WITHCODE`
  * *Descrição*: Senha de suporte administrativo da equipe de desenvolvimento.

---

## 🚀 Execução Local (Desenvolvimento)

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   cd nome-do-repositorio
   ```

2. **Configurar Segredos Locais**:
   Adicione as senhas e a string de conexão no arquivo local `appsettings.json` ou use o comando `dotnet user-secrets`:
   ```bash
   dotnet user-secrets set "ConnectionStrings:CHA_CASA_NOVA_ADRIANAContext" "server=seu_servidor;database=seu_banco;user=usuario;password=senha"
   dotnet user-secrets set "ADMIN_PASSWORD_ADRIANA" "sua_senha_adriana"
   dotnet user-secrets set "ADM_PASSWORD_WITHCODE" "sua_senha_suporte"
   ```
   *Nota: Caso as variáveis de ambiente locais estejam vazias, o sistema utilizará as senhas de fallback padrão (`adriana123` e `withcode123`) para facilitar a depuração.*

3. **Restaurar e Rodar a Aplicação**:
   ```bash
   dotnet restore
   dotnet run
   ```
   Acesse a aplicação no navegador em: `http://localhost:5000` ou `https://localhost:5001`.

---

## 📦 Publicação & Deploy

Para empacotar a aplicação para o seu servidor IIS / SmarterASP.NET:

```bash
dotnet publish -c Release -o ./publish
```

*Importante: Lembre-se de criar e registrar as variáveis `ConnectionStrings:CHA_CASA_NOVA_ADRIANAContext`, `ADMIN_PASSWORD_ADRIANA` e `ADM_PASSWORD_WITHCODE` no painel de controle da sua hospedagem antes de iniciar o pool de aplicativos.*

---

## 💻 Desenvolvido por

Este projeto foi desenvolvido com dedicação e profissionalismo pela equipe **Withcode**.  
Precisa de suporte ou novas soluções web? Fale conosco:  
📞 **Contato/WhatsApp**: [+55 (82) 99322-4753](https://wa.me/5582993224753)
