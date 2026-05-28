using System.Security.Cryptography;
using System.Text;

namespace CHA_CASA_NOVA_ADRIANA.Helpers
{
    public static class AdminSecurity
    {
        private const string CodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        public static string GenerateAccessCode(int length = 8)
        {
            Span<char> code = stackalloc char[length];
            Span<byte> randomBytes = stackalloc byte[length];

            RandomNumberGenerator.Fill(randomBytes);

            for (int i = 0; i < length; i++)
            {
                code[i] = CodeAlphabet[randomBytes[i] % CodeAlphabet.Length];




            }

            return new string(code);
        }

        public static string Hash(string value)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(bytes);
        }

        public static bool HashEquals(string? expectedHash, string value)
        {
            if (string.IsNullOrWhiteSpace(expectedHash))
            {
                return false;
            }

            try
            {
                var currentHash = Hash(value);
                return CryptographicOperations.FixedTimeEquals(
                    Convert.FromHexString(expectedHash),
                    Convert.FromHexString(currentHash));
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public static string BuildDeviceFingerprint(HttpContext context)
        {
            var request = context.Request;
            var ip = GetClientIp(context);

            var fingerprint = string.Join("|",
                request.Headers.UserAgent.ToString(),
                request.Headers.AcceptLanguage.ToString(),
                request.Headers["Sec-CH-UA"].ToString(),
                request.Headers["Sec-CH-UA-Platform"].ToString(),
                ip);

            return Hash(fingerprint);
        }

        public static string GetClientIp(HttpContext context)
        {
            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}
