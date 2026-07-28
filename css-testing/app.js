const toggle = document.getElementById("billingToggle");
const amounts = document.querySelectorAll(".price__amount");

toggle.addEventListener("click", () => {
  const isYearly = toggle.getAttribute("aria-pressed") === "false";
  toggle.setAttribute("aria-pressed", String(isYearly));

  amounts.forEach((el) => {
    el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
  });
});

document.querySelectorAll(".card__cta").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = btn.closest(".card").querySelector(".card__tag").textContent;
    alert(`You selected the ${plan} plan! 🎉`);
  });
});
