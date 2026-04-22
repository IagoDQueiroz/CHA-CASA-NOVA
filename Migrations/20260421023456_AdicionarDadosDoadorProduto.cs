using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CHA_CASA_NOVA_ADRIANA.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDadosDoadorProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailDoador",
                table: "Produto",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefoneDoador",
                table: "Produto",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailDoador",
                table: "Produto");

            migrationBuilder.DropColumn(
                name: "TelefoneDoador",
                table: "Produto");
        }
    }
}
