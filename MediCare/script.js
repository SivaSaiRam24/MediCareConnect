// Open subscription form

function openForm(plan) {
  const form = document.getElementById("subscriptionForm");
  const selectedPlan = document.getElementById("selectedPlan");

  if (!form || !selectedPlan) {
    alert("Subscription form HTML is missing!");
    return;
  }

  selectedPlan.value = plan;
  form.style.display = "block";

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// Close subscription form

function closeForm() {
  document.getElementById("subscriptionForm").style.display = "none";
}
