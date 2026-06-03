using System.ComponentModel.DataAnnotations;

namespace CHA_CASA_NOVA_ADRIANA.Models
{
    public class Produto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do produto é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome pode ter no máximo 100 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(500, ErrorMessage = "A descrição pode ter no máximo 500 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório.")]
        [Range(0.01, 999999.99, ErrorMessage = "Informe um valor válido.")]
        public decimal Valor { get; set; }

        [Display(Name = "URL da Imagem")]
        [Url(ErrorMessage = "Informe uma URL de imagem válida.")]
        [StringLength(500)]
        public string? ImagemUrl { get; set; }

        [StringLength(50)]
        public string? Categoria { get; set; }

        public bool Doado { get; set; } = false;

        [Display(Name = "Nome do Doador")]
        [StringLength(100)]
        public string? Doador { get; set; }

        [StringLength(20)]
        public string? TelefoneDoador { get; set; }

        [StringLength(150)]
        public string? EmailDoador { get; set; }

        [Range(1, 999, ErrorMessage = "A quantidade deve ser no mínimo 1.")]
        public int Quantidade { get; set; } = 1;

        [Display(Name = "Link do Produto")]
        [Url(ErrorMessage = "Informe um link válido.")]
        [StringLength(500)]
        public string? LinkProduto { get; set; }

        [StringLength(50)]
        public string? FormaEntrega { get; set; }

        [Display(Name = "Data da Doação")]
        public DateTime? DataDoacao { get; set; }
    }
}
