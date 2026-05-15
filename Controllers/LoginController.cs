using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace CHA_CASA_NOVA_ADRIANA.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private const int MaxTentativas = 5;

        public LoginController(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult EnviarCodigo()
        {
            int codigo = new Random().Next(1000, 9999);
            var geradoEm = DateTime.Now;
            var expiraEm = geradoEm.AddMinutes(15);

            var from = _configuration["AdminEmail:From"];
            var to = _configuration["AdminEmail:To"];
            var host = _configuration["AdminEmail:SmtpHost"];
            var port = _configuration.GetValue<int>("AdminEmail:SmtpPort");
            var username = _configuration["AdminEmail:Username"];
            var password = _configuration["AdminEmail:Password"];

            if (string.IsNullOrWhiteSpace(from) ||
                string.IsNullOrWhiteSpace(to) ||
                string.IsNullOrWhiteSpace(host) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(password))
            {
                TempData["MensagemErro"] = "Configuração de e-mail não encontrada.";
                return RedirectToAction("Index");
            }

            var emailEnviado = false;

            try
            {
                MailMessage email = new MailMessage();
                email.From = new MailAddress(from);
                email.To.Add(to);
                email.Subject = "Código de acesso administrador";
                email.Body =
                    $"Seu código de acesso é: {codigo}\n\n" +
                    $"Gerado em: {geradoEm:dd/MM/yyyy HH:mm}\n" +
                    $"Válido até: {expiraEm:dd/MM/yyyy HH:mm}";
                email.IsBodyHtml = false;

                SmtpClient smtp = new SmtpClient(host, port);
                smtp.Credentials = new NetworkCredential(username, password);
                smtp.EnableSsl = true;
                smtp.Timeout = 15000;
                smtp.Send(email);

                emailEnviado = true;
            }
            catch (SmtpException)
            {
                if (!_environment.IsDevelopment())
                {
                    TempData["MensagemErro"] = "Não foi possível enviar o e-mail. Verifique internet, firewall ou bloqueio da porta 587.";
                    return RedirectToAction("Index");
                }
            }

            HttpContext.Session.SetInt32("CodigoAdmin", codigo);
            HttpContext.Session.SetString("CodigoAdminExpiraEm", DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds().ToString());
            HttpContext.Session.SetInt32("TentativasCodigoAdmin", 0);

            TempData["Mensagem"] = emailEnviado
                ? "Código enviado com sucesso."
                : $"E-mail não enviado. Código local: {codigo}";

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Index(int codigo)
        {
            int? codigoSalvo = HttpContext.Session.GetInt32("CodigoAdmin");
            int tentativas = HttpContext.Session.GetInt32("TentativasCodigoAdmin") ?? 0;
            string? expiraEmTexto = HttpContext.Session.GetString("CodigoAdminExpiraEm");

            if (tentativas >= MaxTentativas)
            {
                ViewBag.Message = "Limite de tentativas atingido. Solicite um novo código.";
                return View();
            }

            if (string.IsNullOrWhiteSpace(expiraEmTexto) ||
                !long.TryParse(expiraEmTexto, out var expiraEm) ||
                DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expiraEm)
            {
                ViewBag.Message = "Código expirado. Solicite um novo código.";
                return View();
            }

            if (codigoSalvo.HasValue && codigoSalvo.Value == codigo)
            {
                HttpContext.Session.SetString("AdminLogado", "true");
                HttpContext.Session.Remove("CodigoAdmin");
                HttpContext.Session.Remove("CodigoAdminExpiraEm");
                HttpContext.Session.Remove("TentativasCodigoAdmin");
                return RedirectToAction("Index", "Produtos");
            }

            HttpContext.Session.SetInt32("TentativasCodigoAdmin", tentativas + 1);
            ViewBag.Message = "Código inválido.";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("AdminLogado");
            HttpContext.Session.Remove("CodigoAdmin");
            HttpContext.Session.Remove("CodigoAdminExpiraEm");
            HttpContext.Session.Remove("TentativasCodigoAdmin");

            return RedirectToAction("Index", "Produtos");
        }
    }
}
