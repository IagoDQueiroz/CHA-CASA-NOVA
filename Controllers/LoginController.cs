using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using CHA_CASA_NOVA_ADRIANA.Helpers;
using System.Net;
using System.Net.Mail;

namespace CHA_CASA_NOVA_ADRIANA.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private const int MaxTentativasSessao = 5;
        private const int MaxTentativasIp = 10;
        private const int MaxEnviosIp = 3;
        private static readonly TimeSpan JanelaBloqueio = TimeSpan.FromMinutes(15);

        public LoginController(IConfiguration configuration, IMemoryCache cache)
        {
            _configuration = configuration;
            _cache = cache;
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
            var ip = AdminSecurity.GetClientIp(HttpContext);

            if (LimiteAtingido($"admin-code-send:{ip}", MaxEnviosIp))
            {
                TempData["MensagemErro"] = "Muitas solicitações de código. Tente novamente em alguns minutos.";
                return RedirectToAction("Index");
            }

            var codigo = AdminSecurity.GenerateAccessCode();
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

            IncrementarLimite($"admin-code-send:{ip}");

            try
            {
                MailMessage email = new MailMessage();
                email.From = new MailAddress(from);
                email.To.Add(to);
                email.Subject = "Código de acesso administrador";
                email.Body =
                    $"Seu código de acesso é: {codigo}\n\n" +
                    $"Gerado em: {geradoEm:dd/MM/yyyy HH:mm}\n" +
                    $"Válido até: {expiraEm:dd/MM/yyyy HH:mm}\n\n" +
                    "Este código só libera acesso no dispositivo que fizer o login.";
                email.IsBodyHtml = false;

                SmtpClient smtp = new SmtpClient(host, port);
                smtp.Credentials = new NetworkCredential(username, password);
                smtp.EnableSsl = true;
                smtp.Timeout = 15000;
                smtp.Send(email);
            }
            catch (SmtpException)
            {
                TempData["MensagemErro"] = "Não foi possível enviar o e-mail. Tente novamente em alguns minutos.";
                return RedirectToAction("Index");
            }

            HttpContext.Session.SetString("CodigoAdminHash", AdminSecurity.Hash(codigo));
            HttpContext.Session.SetString("CodigoAdminExpiraEm", DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds().ToString());
            HttpContext.Session.SetInt32("TentativasCodigoAdmin", 0);

            TempData["Mensagem"] = "Código enviado com sucesso.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Index(string codigo)
        {
            var ip = AdminSecurity.GetClientIp(HttpContext);
            var chaveTentativasIp = $"admin-login-fail:{ip}";

            if (LimiteAtingido(chaveTentativasIp, MaxTentativasIp))
            {
                ViewBag.Message = "Muitas tentativas inválidas. Tente novamente mais tarde.";
                return View();
            }

            var codigoInformado = (codigo ?? string.Empty).Trim().ToUpperInvariant();
            var codigoHash = HttpContext.Session.GetString("CodigoAdminHash");
            int tentativas = HttpContext.Session.GetInt32("TentativasCodigoAdmin") ?? 0;
            string? expiraEmTexto = HttpContext.Session.GetString("CodigoAdminExpiraEm");

            if (tentativas >= MaxTentativasSessao)
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

            if (AdminSecurity.HashEquals(codigoHash, codigoInformado))
            {
                HttpContext.Session.SetString("AdminLogado", "true");
                HttpContext.Session.SetString("AdminFingerprint", AdminSecurity.BuildDeviceFingerprint(HttpContext));
                HttpContext.Session.Remove("CodigoAdminHash");
                HttpContext.Session.Remove("CodigoAdminExpiraEm");
                HttpContext.Session.Remove("TentativasCodigoAdmin");
                _cache.Remove(chaveTentativasIp);
                return RedirectToAction("Admin", "Produtos");
            }

            HttpContext.Session.SetInt32("TentativasCodigoAdmin", tentativas + 1);
            IncrementarLimite(chaveTentativasIp);
            ViewBag.Message = "Código inválido.";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("AdminLogado");
            HttpContext.Session.Remove("AdminFingerprint");
            HttpContext.Session.Remove("CodigoAdminHash");
            HttpContext.Session.Remove("CodigoAdminExpiraEm");
            HttpContext.Session.Remove("TentativasCodigoAdmin");

            return RedirectToAction("Index", "Produtos");
        }

        private bool LimiteAtingido(string chave, int limite)
        {
            return _cache.TryGetValue(chave, out int total) && total >= limite;
        }

        private void IncrementarLimite(string chave)
        {
            var total = _cache.TryGetValue(chave, out int atual) ? atual + 1 : 1;
            _cache.Set(chave, total, JanelaBloqueio);
        }
    }
}
