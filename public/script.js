// Dynamic Pricing Logic
const serviceCategory = document.getElementById("serviceCategory");
const subService = document.getElementById("subService");
const priceDisplay = document.getElementById("calculatedPrice");
const userType = document.getElementById("userType");

// Mapping of service categories to sub-services and base prices
const subServices = {
  "online-individual": [
    { name: "Teletherapy - Video", basePrice: 899 },
    { name: "E-Counseling - Chat", basePrice: 699 },
    { name: "Resilience Navigator", basePrice: 0 },
    { name: "Oasis: Mindfulness Sanctuary", basePrice: 0 },
    { name: "Well-Be Stress Manager App", basePrice: 0 },
    { name: "Gamified Learning Module", basePrice: 200 },
    { name: "Psychoeducation Library Access", basePrice: 0 }
  ],
  "community-programs": [
    { name: "Caring for the Carers (C4C)", basePrice: 5000 },
    { name: "CareTalk Circles", basePrice: 3500 },
    { name: "Indigenous Wellness Dialogues", basePrice: 7000 },
    { name: "Substance Use Recovery Support", basePrice: 5000 },
    { name: "Community Resilience Workshop", basePrice: 7000 },
    { name: "PFA Training", basePrice: 8000 }
  ],
  "organizational-training": [
    { name: "Mental Health Policy Co-Design", basePrice: 15000 },
    { name: "PFA Certification", basePrice: 8000 },
    { name: "Burnout Prevention Workshop", basePrice: 7000 },
    { name: "Cultural Competence Training", basePrice: 4500 },
    { name: "Case Management System Setup", basePrice: 7000 },
    { name: "MH Integration into Emergency Plans", basePrice: 9000 }
  ],
  "research-policy": [
    { name: "Mental Health Systems Audit", basePrice: 12000 },
    { name: "Data Collection & Monitoring", basePrice: 8000 },
    { name: "Behavioral Segmentation Analysis", basePrice: 6000 },
    { name: "Program Impact Assessment", basePrice: 10000 },
    { name: "Ethical AI Dashboard Setup", basePrice: 15000 },
    { name: "Policy Implementation Planning", basePrice: 9000 }
  ]
};

// Populate sub-service dropdown
serviceCategory.addEventListener("change", function () {
  const selectedCategory = this.value;
  subService.innerHTML = "<option value=''>Select Sub-Service</option>";
  if (selectedCategory && subServices[selectedCategory]) {
    subServices[selectedCategory].forEach(option => {
      const opt = document.createElement("option");
      opt.value = option.name;
      opt.textContent = option.name;
      opt.dataset.price = option.basePrice;
      subService.appendChild(opt);
    });
    subService.disabled = false;
  } else {
    subService.disabled = true;
  }
});

// Estimate price dynamically
subService.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const basePrice = parseFloat(selectedOption.dataset.price || 0);
  const participants = parseInt(document.querySelector("[name='participants']")?.value || 1);

  // Adjust price based on number of participants (group pricing)
  let totalPrice = basePrice;
  if (participants > 1) {
    totalPrice = basePrice + (participants - 1) * 500; // Add per-person cost
  }

  // Apply subsidy if applicable
  const vulnerableSegment = document.querySelector("[name='vulnerableSegment']")?.value || "none";
  const subsidyRates = {
    none: 1.0,
    pwd: 0.7,
    lgbtq: 0.8,
    indigenous: 0.6,
    frontliner: 0.8,
    student: 0.7
  };

  totalPrice *= subsidyRates[vulnerableSegment] || 1.0;

  priceDisplay.textContent = `₱${totalPrice.toFixed(2)}`;
});

// Optional: Handle form submission
document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const res = await fetch("https://your-server-url.onrender.com/api/booking ", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("Booking submitted successfully!");
    this.reset();
    priceDisplay.textContent = "To be determined";
  } else {
    alert("Failed to submit booking.");
  }
});
