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
        public IActionResult Index(string senha)
        {
            var ip = AdminSecurity.GetClientIp(HttpContext);
            var chaveTentativasIp = $"admin-login-fail:{ip}";

            if (LimiteAtingido(chaveTentativasIp, MaxTentativasIp))
            {
                ViewBag.Message = "Muitas tentativas inválidas. Tente novamente mais tarde.";
                return View();
            }

            var senhaInformada = (senha ?? string.Empty).Trim();

            // Variáveis de ambiente configuradas no servidor com fallbacks para testes locais
            var senhaAdriana = _configuration["ADMIN_PASSWORD_ADRIANA"] ?? "adriana123";
            var senhaWithCode = _configuration["ADM_PASSWORD_WITHCODE"] ?? "withcode123";

            if (senhaInformada == senhaAdriana || senhaInformada == senhaWithCode)
            {
                HttpContext.Session.SetString("AdminLogado", "true");
                HttpContext.Session.SetString("AdminFingerprint", AdminSecurity.BuildDeviceFingerprint(HttpContext));
                _cache.Remove(chaveTentativasIp);
                return RedirectToAction("Admin", "Produtos");
            }

            IncrementarLimite(chaveTentativasIp);
            ViewBag.Message = "Senha incorreta.";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("AdminLogado");
            HttpContext.Session.Remove("AdminFingerprint");

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
