using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using CHA_CASA_NOVA_ADRIANA.Helpers;

namespace CHA_CASA_NOVA_ADRIANA.Filters
{
    public class AdminRequiredAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            var fingerprintSalvo = session.GetString("AdminFingerprint");
            var fingerprintAtual = AdminSecurity.BuildDeviceFingerprint(context.HttpContext);

            if (session.GetString("AdminLogado") == "true" &&
                fingerprintSalvo == fingerprintAtual)
            {
                return;
            }

            session.Remove("AdminLogado");
            session.Remove("AdminFingerprint");
            context.Result = new RedirectToActionResult("Index", "Login", null);
        }
    }
}
