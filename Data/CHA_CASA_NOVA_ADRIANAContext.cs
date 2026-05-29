using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CHA_CASA_NOVA_ADRIANA.Models;

namespace CHA_CASA_NOVA_ADRIANA.Data
{
    public class CHA_CASA_NOVA_ADRIANAContext : DbContext
    {
        public CHA_CASA_NOVA_ADRIANAContext (DbContextOptions<CHA_CASA_NOVA_ADRIANAContext> options)
            : base(options)
        {
        }

        public DbSet<CHA_CASA_NOVA_ADRIANA.Models.Produto> Produto { get; set; } = default!;
        public DbSet<CHA_CASA_NOVA_ADRIANA.Models.Recado> Recado { get; set; } = default!;
    }
}
