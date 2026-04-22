using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CHA_CASA_NOVA_ADRIANA.Data;
using CHA_CASA_NOVA_ADRIANA.Models;

namespace CHA_CASA_NOVA_ADRIANA.Controllers
{
    public class ProdutosController : Controller
    {
        private readonly CHA_CASA_NOVA_ADRIANAContext _context;

        public ProdutosController(CHA_CASA_NOVA_ADRIANAContext context)
        {
            _context = context;
        }

        private bool AdminEstaLogado()
        {
            return HttpContext.Session.GetString("AdminLogado") == "true";
        }

        [HttpGet]
        public IActionResult Index()
        {
            var produtos = _context.Produto.ToList();
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
        public IActionResult Create()
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

            return View(new Produto());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Produto produto)
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

            if (ModelState.IsValid)
            {
                _context.Add(produto);
                _context.SaveChanges();

                return RedirectToAction(nameof(Index));
            }

            return View(produto);
        }

        [HttpGet]
        public IActionResult Edit(int? id)
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

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
        public IActionResult Edit(Produto produto)
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

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
                    else
                    {
                        throw;
                    }
                }

                return RedirectToAction(nameof(Index));
            }

            return View("Create", produto);
        }

        [HttpGet]
        public IActionResult Delete(int? id)
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

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
        public IActionResult Delete(int id)
        {
            if (!AdminEstaLogado())
            {
                return RedirectToAction("Index", "Login");
            }

            var produto = _context.Produto.Find(id);

            if (produto != null)
            {
                _context.Produto.Remove(produto);
                _context.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        private bool ProdutoExists(int id)
        {
            return _context.Produto.Any(e => e.Id == id);
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

            produto.Doado = true;
            produto.Doador = nome;
            produto.TelefoneDoador = telefone;
            produto.EmailDoador = email;
            produto.FormaEntrega = formaEntrega;

            _context.Produto.Update(produto);
            _context.SaveChanges();

            TempData["MensagemSucesso"] = "Doação registrada com sucesso!";
            return RedirectToAction("Details", new { id });
        }
    }
}