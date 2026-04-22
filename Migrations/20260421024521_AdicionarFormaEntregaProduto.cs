using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CHA_CASA_NOVA_ADRIANA.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarFormaEntregaProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FormaEntrega",
                table: "Produto",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FormaEntrega",
                table: "Produto");
        }
    }
}
