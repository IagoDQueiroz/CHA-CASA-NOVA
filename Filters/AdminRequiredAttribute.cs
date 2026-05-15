using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CHA_CASA_NOVA_ADRIANA.Filters
{
    public class AdminRequiredAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.HttpContext.Session.GetString("AdminLogado") == "true")
            {
                return;
            }

            context.Result = new RedirectToActionResult("Index", "Login", null);
        }
    }
}
