using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CHA_CASA_NOVA_ADRIANA.Data;
using CHA_CASA_NOVA_ADRIANA.Filters;
using CHA_CASA_NOVA_ADRIANA.Models;
using System.Net.Mail;

namespace CHA_CASA_NOVA_ADRIANA.Controllers
{
    public class ProdutosController : Controller
    {
        private readonly CHA_CASA_NOVA_ADRIANAContext _context;

        public ProdutosController(CHA_CASA_NOVA_ADRIANAContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Index(string? busca, string? status, string? categoria, decimal? valorMaximo)
        {
            var produtosQuery = _context.Produto.AsQueryable();

            if (!string.IsNullOrWhiteSpace(busca))
            {
                produtosQuery = produtosQuery.Where(p =>
                    p.Nome.Contains(busca) ||
                    p.Descricao.Contains(busca));
            }

            if (!string.IsNullOrWhiteSpace(categoria))
            {
                produtosQuery = produtosQuery.Where(p => p.Categoria == categoria);
            }

            if (valorMaximo.HasValue)
            {
                produtosQuery = produtosQuery.Where(p => p.Valor <= valorMaximo.Value);
            }

            if (status == "disponiveis")
            {
                produtosQuery = produtosQuery.Where(p => !p.Doado);
            }
            else if (status == "doados")
            {
                produtosQuery = produtosQuery.Where(p => p.Doado);
            }

            ViewBag.Busca = busca;
            ViewBag.Status = status;
            ViewBag.Categoria = categoria;
            ViewBag.ValorMaximo = valorMaximo;
            ViewBag.Categorias = _context.Produto
                .Where(p => !string.IsNullOrWhiteSpace(p.Categoria))
                .Select(p => p.Categoria!)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            var produtos = produtosQuery
                .OrderBy(p => p.Doado)
                .ThenBy(p => p.Nome)
                .ToList();

            return View(produtos);
        }

        [HttpGet]
        [AdminRequired]
        public IActionResult Admin()
        {
            var produtos = _context.Produto
                .OrderBy(p => p.Doado)
                .ThenBy(p => p.Nome)
                .ToList();

            ViewBag.Total = produtos.Count;
            ViewBag.Doados = produtos.Count(p => p.Doado);
            ViewBag.Disponiveis = produtos.Count(p => !p.Doado);
            ViewBag.ValorTotal = produtos.Sum(p => p.Valor);

            return View(produtos);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var produto = await _context.Produto
                .FirstOrDefaultAsync(m => m.Id == id);

            if (produto == null)
            {
                return NotFound();
            }

            return View(produto);
        }

        [HttpGet]
        [AdminRequired]
        public IActionResult Create()
        {
            return View(new Produto());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AdminRequired]
        public IActionResult Create(Produto produto)
        {
            if (ModelState.IsValid)
            {
                _context.Add(produto);
                _context.SaveChanges();

                return RedirectToAction(nameof(Index));
            }

            return View(produto);
        }

        [HttpGet]
        [AdminRequired]
        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var produto = _context.Produto.Find(id);

            if (produto == null)
            {
                return NotFound();
            }

            return View("Create", produto);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AdminRequired]
        public IActionResult Edit(Produto produto)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(produto);
                    _context.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ProdutoExists(produto.Id))
                    {
                        return NotFound();
                    }

                    throw;
                }

                return RedirectToAction(nameof(Index));
            }

            return View("Create", produto);
        }

        [HttpGet]
        [AdminRequired]
        public IActionResult Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var produto = _context.Produto.Find(id);

            if (produto == null)
            {
                return NotFound();
            }

            return View(produto);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AdminRequired]
        public IActionResult Delete(int id)
        {
            var produto = _context.Produto.Find(id);

            if (produto != null)
            {
                _context.Produto.Remove(produto);
                _context.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Doar(int id, string nome, string telefone, string? email, string formaEntrega)
        {
            var produto = _context.Produto.Find(id);

            if (produto == null)
            {
                return NotFound();
            }

            if (produto.Doado)
            {
                TempData["MensagemErro"] = "Este produto já foi doado.";
                return RedirectToAction("Details", new { id });
            }

            nome = nome.Trim();
            telefone = telefone.Trim();
            email = email?.Trim();
            formaEntrega = formaEntrega.Trim();

            if (string.IsNullOrWhiteSpace(nome) ||
                string.IsNullOrWhiteSpace(telefone) ||
                string.IsNullOrWhiteSpace(formaEntrega))
            {
                TempData["MensagemErro"] = "Preencha nome, telefone e forma de entrega.";
                return RedirectToAction("Details", new { id });
            }

            if (telefone.Length < 10)
            {
                TempData["MensagemErro"] = "Informe um telefone válido.";
                return RedirectToAction("Details", new { id });
            }

            if (!string.IsNullOrWhiteSpace(email) && !EmailValido(email))
            {
                TempData["MensagemErro"] = "Informe um e-mail válido.";
                return RedirectToAction("Details", new { id });
            }

            produto.Doado = true;
            produto.Doador = nome;
            produto.TelefoneDoador = telefone;
            produto.EmailDoador = email;
            produto.FormaEntrega = formaEntrega;

            _context.Produto.Update(produto);
            _context.SaveChanges();

            TempData["MensagemSucesso"] = "Doação registrada com sucesso!";
            return RedirectToAction("Obrigado", new { id });
        }

        [HttpGet]
        public IActionResult Obrigado(int id)
        {
            var produto = _context.Produto.Find(id);

            if (produto == null)
            {
                return NotFound();
            }

            return View(produto);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [AdminRequired]
        public IActionResult DesfazerDoacao(int id)
        {
            var produto = _context.Produto.Find(id);

            if (produto == null)
            {
                return NotFound();
            }

            produto.Doado = false;
            produto.Doador = null;
            produto.TelefoneDoador = null;
            produto.EmailDoador = null;
            produto.FormaEntrega = null;

            _context.Produto.Update(produto);
            _context.SaveChanges();

            TempData["MensagemSucesso"] = "Doação desfeita com sucesso.";
            return RedirectToAction("Details", new { id });
        }

        private bool ProdutoExists(int id)
        {
            return _context.Produto.Any(e => e.Id == id);
        }

        private static bool EmailValido(string email)
        {
            try
            {
                _ = new MailAddress(email);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
