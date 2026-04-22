using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace CHA_CASA_NOVA_ADRIANA.Controllers
{
    public class LoginController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult EnviarCodigo()
        {
            int codigo = new Random().Next(1000, 9999);

            HttpContext.Session.SetInt32("CodigoAdmin", codigo);

            MailMessage email = new MailMessage();
            email.From = new MailAddress("seuemail@gmail.com");
            email.To.Add("emailfixo@gmail.com");
            email.Subject = "Código de acesso administrador";
            email.Body = $"Seu código de acesso é: {codigo}";
            email.IsBodyHtml = false;

            SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587);
            smtp.Credentials = new NetworkCredential("seuemail@gmail.com", "SUA_SENHA_DE_APP");
            smtp.EnableSsl = true;

            smtp.Send(email);

            TempData["Mensagem"] = "Código enviado com sucesso.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Index(int codigo)
        {
            int? codigoSalvo = HttpContext.Session.GetInt32("CodigoAdmin");

            if (codigoSalvo.HasValue && codigoSalvo.Value == codigo)
            {
                HttpContext.Session.SetString("AdminLogado", "true");
                return RedirectToAction("Index", "Produtos");
            }

            ViewBag.Message = "Código inválido.";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("AdminLogado");
            HttpContext.Session.Remove("CodigoAdmin");

            return RedirectToAction("Index", "Produtos");
        }
    }
}