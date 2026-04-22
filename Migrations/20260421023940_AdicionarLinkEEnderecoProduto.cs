using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CHA_CASA_NOVA_ADRIANA.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarLinkEEnderecoProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkProduto",
                table: "Produto",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinkProduto",
                table: "Produto");
        }
    }
}
