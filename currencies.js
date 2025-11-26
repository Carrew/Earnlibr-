// currencies.js
// Self-initializing module to populate currency dropdown

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "LRD", name: "Liberian Dollar", symbol: "L$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" }
];

// Function to populate a dropdown
function populateCurrencyDropdown(selectId = 'currency') {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Clear any existing options
  select.innerHTML = '<option value="">Select currency</option>';

  currencies.forEach(currency => {
    const option = document.createElement("option");
    option.value = currency.code;
    option.textContent = `${currency.name} (${currency.symbol})`;
    select.appendChild(option);
  });
}

// Auto-populate as soon as the DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => populateCurrencyDropdown());
} else {
  // DOM already loaded
  populateCurrencyDropdown();
}

// Optional: export if other modules need it
export { currencies, populateCurrencyDropdown };
