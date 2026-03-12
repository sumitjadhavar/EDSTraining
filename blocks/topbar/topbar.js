export default function decorate(block) {
  const replacements = {
    "phone": "📱",
    "home": "🏠",
    "time": "🕒"
  };

  block.querySelectorAll("div").forEach((el) => {
    const text = el.textContent.toLowerCase();
    Object.keys(replacements).forEach((key) => {
      if (text.includes(key)) {
        el.innerHTML = `${replacements[key]} ${el.innerHTML}`;
      }
    });
  });
}
