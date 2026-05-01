/***********************
 * 📦 DATA
 ***********************/
const data = COURIER_DATA;

/***********************
 * 🧠 SESSION
 ***********************/
let session = {
  intent: null,
  step: null,
  origin: null,
  destination: null,
  weight: null
};

function resetSession() {
  return {
    intent: null,
    step: null,
    origin: null,
    destination: null,
    weight: null
  };
}

/***********************
 * 🌍 COUNTRY DETECTION
 * - Exact code match (File 1 fix)
 * - Aliases, Dubai, UK/USA shortcuts (File 2)
 ***********************/
function getCountry(input) {
  input = input.toLowerCase().trim();
  // ✅ Strip punctuation so "uk?" "usa." "singapore," all match correctly
  const clean = input.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.split(" ");

  return data.supportedCountries.find(c => {
    const name = c.name.toLowerCase();
    const code = c.code.toLowerCase();
    const aliases = c.aliases || [];

    return (
      clean.includes(name) ||
      words.includes(code) ||
      clean.replace(/\s/g, "").includes(name.replace(/\s/g, "")) ||
      aliases.some(a => clean.includes(a.toLowerCase())) ||
      (code === "us" && (words.includes("usa") || words.includes("us"))) ||
      (code === "gb" && words.includes("uk")) ||
      (code === "ae" && (words.includes("dubai") || clean.includes("dubai")))
    );
  });
}

/***********************
 * ⚖️ WEIGHT DETECTION
 * - kg (File 1)
 * - grams support (File 2)
 ***********************/
function getWeight(input) {
  let kg = input.match(/(\d+(\.\d+)?)\s*kg/);
  if (kg) return parseFloat(kg[1]);

  let g = input.match(/(\d+)\s*g(?!b)/i); // avoid matching "gb" (gigabytes)
  if (g) return parseFloat(g[1]) / 1000;

  return null;
}

/***********************
 * 📦 GET WEIGHT SLAB
 ***********************/
function getSlab(weight) {
  return data.weightSlabs.find(s => weight <= s.maxKg);
}

/***********************
 * 🎯 INTENT DETECTION
 * - Rate/cost/shipping (both files)
 * - ETA, track, human, FAQs, terms (File 2)
 * - One-shot smart detection (File 1)
 ***********************/
function getIntent(input) {
  input = input.toLowerCase();

  if (input.includes("rate") || input.includes("price") || input.includes("cost") || input.includes("shipping"))
    return "rate";

  if (input.includes("delivery") || input.includes("time") || input.includes("days") || input.includes("eta"))
    return "eta";

  if (input.includes("track"))
    return "track";

  if (input.includes("support") || input.includes("contact") || input.includes("human"))
    return "human";

  // ✅ Smart one-shot detection (File 1): e.g. "2kg usa"
  if (getCountry(input) && getWeight(input))
    return "rate";

  if (data.faqs) {
    for (let faq of data.faqs) {
      if (faq.keywords.some(k => input.includes(k)))
        return { type: "faq", faq };
    }
  }

  if (data.terms) {
    for (let key in data.terms) {
      if (data.terms[key].keywords.some(k => input.includes(k)))
        return { type: "term", key };
    }
  }

  return "unknown";
}

/***********************
 * 💰 CALCULATE RATE
 ***********************/
function calculateRate() {
  if (session.weight > 30)
    return data.fallback.overweight || "❌ Weight exceeds maximum limit of 30kg.";

  let slab = getSlab(session.weight);
  if (!slab) return data.fallback.invalidWeight;

  let price = data.rates["IN"]?.[session.destination.code]?.[slab.id];
  if (!price) return data.fallback.unsupportedRoute;

  let eta = data.deliveryEstimates["IN"]?.[session.destination.code];

  return `💰 Cost: ₹${price.toLocaleString()} <br> ⏱ Delivery: ${eta.min} to ${eta.max} days`;
}

/***********************
 * 🤖 BOT ENGINE
 ***********************/
function botReply(input) {
  const raw = input;
  input = input.toLowerCase().trim();

  let country = getCountry(input);
  let weight = getWeight(input);

  /******** ✅ ONE-SHOT: country + weight in one message (File 1) ********/
  if (!session.intent && country && weight && country.code !== "IN") {
    session.destination = country;
    session.origin = { code: "IN", name: "India" };
    session.weight = weight;

    let result = calculateRate();
    session = resetSession();
    return result;
  }

  /******** NO ACTIVE SESSION — detect intent ********/
  if (!session.intent) {
    let intent = getIntent(input);

    if (intent === "rate") {
      session.intent = "rate";

      // Was destination already saved from a PREVIOUS message?
      const destFromPrior = !!session.destination;

      // Pre-fill destination if mentioned in THIS message
      if (country && country.code !== "IN") {
        session.destination = country;
      }

      // Pre-fill weight if mentioned in THIS message
      if (weight) {
        session.weight = weight;
      }

      // ─────────────────────────────────────────────
      // CASE A: No destination at all → ask destination
      // e.g. "shipping", "2kg"
      // ─────────────────────────────────────────────
      if (!session.destination) {
        session.step = "destination";
        return "🌍 Enter destination country (e.g., USA, Singapore, UK)";
      }

      // ─────────────────────────────────────────────
      // CASE B: Destination came from a PRIOR message → ask origin (confirmation)
      // e.g. "usa" → "shipping"
      // ─────────────────────────────────────────────
      if (destFromPrior) {
        session.step = "origin";
        return "📍 Enter origin country (India only)";
      }

      // ─────────────────────────────────────────────
      // CASE C: Destination came in THIS message → auto-set India, skip origin
      // e.g. "usa shipping", "2kg usa shipping"
      // ─────────────────────────────────────────────
      session.origin = { code: "IN", name: "India" };

      if (!session.weight) {
        // e.g. "usa shipping" → ask weight
        session.step = "weight";
        return "⚖️ Enter parcel weight (e.g., 2 kg or 500 g)";
      }

      // e.g. "2kg usa shipping" → result directly
      let result = calculateRate();
      session = resetSession();
      return result;
    }

    if (intent === "eta") {
      session.intent = "eta";

      // Pre-fill destination if already mentioned
      if (country && country.code !== "IN") {
        session.destination = country;
      }

      // ✅ If destination already known (from prior message), return ETA directly
      if (session.destination) {
        let eta = data.deliveryEstimates["IN"]?.[session.destination.code];
        let name = session.destination.name;
        session = resetSession();
        if (!eta) return data.fallback?.unsupportedRoute || "❌ Route not supported currently.";
        return `⏱ Delivery to <strong>${name}</strong>: ${eta.min} to ${eta.max} days`;
      }

      session.step = "destination";
      return "🌍 Enter destination country (e.g., USA, Singapore, UK)";
    }

    if (intent === "track")
      return "📦 Track your shipment using your tracking ID on our website.";

    if (intent === "human")
      return `👨‍💼 Contact our support team: ${data.contact?.email || "support@shiphit.com"}`;

    if (intent?.type === "faq")
      return intent.faq.answer;

    if (intent?.type === "term")
      return data.terms[intent.key].body;

    if (country && country.code !== "IN") {
      // ✅ Save destination now so the next message ("shipping rate") can reuse it
      session.destination = country;
      return `📦 Got it! You mentioned <strong>${country.name}</strong>.<br>What would you like to check?<br><br>💰 Shipping rate<br>⏱ Delivery time`;
    }

    return "👋 I can help with shipping rates, delivery time, or tracking. Try something like: <em>\"USA shipping\"</em> or <em>\"2kg Singapore\"</em>.";
  }

  /******** RATE FLOW ********/
  if (session.intent === "rate") {

    if (session.step === "destination") {
      if (!country)
        return "❌ Sorry, I couldn't recognize that country. Try again (e.g., Singapore, USA, UK).";

      if (country.code === "IN")
        return "❌ Destination cannot be India. Please enter a different country.";

      session.destination = country;

      // Skip weight step if already known
      if (session.weight) {
        let result = calculateRate();
        session = resetSession();
        return result;
      }

      session.step = "weight";
      return "⚖️ Enter parcel weight (e.g., 2 kg or 500 g)";
    }

    // ✅ Origin step: only reached when destination came from a prior message
    if (session.step === "origin") {
      if (!country)
        return "❌ Please enter a valid origin country (example: India).";

      if (country.code !== "IN")
        return data.fallback?.unsupportedOrigin || "❌ Only India is supported as origin currently.";

      session.origin = country;

      if (!session.weight) {
        session.step = "weight";
        return "⚖️ Enter parcel weight (e.g., 2 kg or 500 g)";
      }

      // weight already known → result directly
      let result = calculateRate();
      session = resetSession();
      return result;
    }

    if (session.step === "weight") {
      if (!weight)
        return "❌ Please enter a valid weight (e.g., 2 kg or 500 g).";

      session.weight = weight;

      let result = calculateRate();
      session = resetSession();
      return result;
    }
  }

  /******** ETA FLOW ********/
  if (session.intent === "eta") {
    if (session.step === "destination") {
      if (!country)
        return "❌ Please enter a valid destination country.";

      let eta = data.deliveryEstimates["IN"]?.[country.code];

      if (!eta) {
        session = resetSession();
        return data.fallback?.unsupportedRoute || "❌ Route not supported currently.";
      }

      session = resetSession();
      return `⏱ Delivery to <strong>${country.name}</strong>: ${eta.min} to ${eta.max} days`;
    }
  }

  return data.fallback?.unknown || "👋 Try: \"USA shipping\" or \"2kg Singapore\"";
}

/***********************
 * 💬 SEND MESSAGE
 ***********************/
function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");

  setTimeout(() => {
    let reply = botReply(text);
    addMessage(reply, "bot");
  }, 300);

  input.value = "";
}

/***********************
 * 💬 UI — ADD MESSAGE (File 2 style with avatars)
 ***********************/
function addMessage(text, type) {
  let chat = document.getElementById("chatBox");

  let container = document.createElement("div");

  if (type === "user") {
    container.style.display = "flex";
    container.style.justifyContent = "flex-end";
    container.style.alignItems = "flex-end";
    container.style.marginBottom = "8px";

    container.innerHTML = `
      <div class="user">${text}</div>
      <img src="https://cdn-icons-png.flaticon.com/512/2922/2922561.png"
           style="margin-left:8px; width:22px; height:22px; object-fit:contain;" alt="user">
    `;
  } else {
    container.style.display = "flex";
    container.style.alignItems = "flex-end";
    container.style.marginBottom = "8px";

    container.innerHTML = `
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
           style="margin-right:8px; width:22px; height:22px; object-fit:contain;" alt="bot">
      <div class="bot">${text}</div>
    `;
  }

  chat.appendChild(container);
  chat.scrollTop = chat.scrollHeight;
}

/***********************
 * 🚀 INIT
 ***********************/
window.addEventListener("load", () => {
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const closeBtn = document.getElementById("closeChat");
  const openBtn = document.getElementById("openChat");
  const chatWidget = document.querySelector(".chat-widget") || document.getElementById("chatWidget");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  sendBtn.addEventListener("click", sendMessage);

  if (closeBtn && openBtn && chatWidget) {
    closeBtn.addEventListener("click", () => {
      chatWidget.style.display = "none";
      openBtn.style.display = "block";
    });

    openBtn.addEventListener("click", () => {
      chatWidget.style.display = "flex";
      openBtn.style.display = "none";
    });
  }

  addMessage(data.greeting?.welcome || "Hi! I'm Shiphit's assistant. How can I help you today?", "bot");
});
