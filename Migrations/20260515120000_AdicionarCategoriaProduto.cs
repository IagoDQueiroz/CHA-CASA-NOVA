using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CHA_CASA_NOVA_ADRIANA.Migrations
{
    public partial class AdicionarCategoriaProduto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Produto",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Produto");
        }
    }
}
