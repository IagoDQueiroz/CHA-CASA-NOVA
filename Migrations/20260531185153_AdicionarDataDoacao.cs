using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CHA_CASA_NOVA_ADRIANA.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDataDoacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataDoacao",
                table: "Produto",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataDoacao",
                table: "Produto");
        }
    }
}
