// Hero typing effect
const typingEl = document.querySelector(".typing");
const phrases = [
  "Software Engineer | Full-Stack Developer",
  "Python · JavaScript · Django · React · Go",
  "Automation · UX · Cross-Platform Apps",
  "Always building · Always learning",
];
if (typingEl) typingEl.textContent = phrases[0].slice(0, 1);
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
function typeLoop() {
  const current = phrases[phraseIndex];
  if (!deleting) {
    charIndex++;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    charIndex--;
    typingEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  const delay = deleting ? 40 : 80;
  setTimeout(typeLoop, delay);
}
setTimeout(typeLoop, 250);

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navMenu.dataset.open = String(!open);
  navToggle.textContent = !open ? "✕" : "☰";
});

// Close mobile menu when clicking a link
navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.dataset.open = "false";
    navToggle.textContent = "☰";
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    navMenu?.dataset.open === "true" &&
    !navMenu.contains(e.target) &&
    !navToggle?.contains(e.target)
  ) {
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.dataset.open = "false";
    navToggle.textContent = "☰";
  }
});

// Projects list (fetch latest repos similar to README automation)
async function loadProjects() {
  const root = document.getElementById("projects-list");
  if (!root) return;
  try {
    const res = await fetch(
      "https://api.github.com/users/HERALDEXX/repos?type=owner&sort=created&direction=desc&per_page=15",
      {
        headers: { Accept: "application/vnd.github.v3+json" },
      }
    );
    if (!res.ok) throw new Error("GitHub API error");
    const data = await res.json();
    const filtered = data.filter((r) => !r.fork && !r.archived).slice(0, 9);
    root.setAttribute("aria-busy", "false");
    root.innerHTML = filtered
      .map((repo) => {
        const desc = repo.description
          ? repo.description.replace(/</g, "&lt;")
          : "No description";
        return (
          `<article class="project-card" tabindex="0">` +
          `<h3>${repo.name}</h3>` +
          `<p>${desc}</p>` +
          `<div class="actions"><a class="btn small outline" href="${repo.html_url}" target="_blank" rel="noopener">View Repo</a></div>` +
          `</article>`
        );
      })
      .join("");
  } catch (e) {
    root.innerHTML = '<p style="opacity:.7">Failed to load projects.</p>';
    root.setAttribute("aria-busy", "false");
  }
}
loadProjects();

// Quote of the day (random from local list)
const quotes = [
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  {
    text: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
  },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
];
function setQuote() {
  const el = document.getElementById("quote-text");
  if (!el) return;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  el.innerHTML = `<p>“${q.text}”</p><footer>— ${q.author}</footer>`;
  el.setAttribute("cite", q.author);
}
setQuote();

// Year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Accessibility: focus main when skipping
if (location.hash && location.hash.length > 1) {
  const target = document.querySelector(location.hash);
  target?.focus?.();
}

// Scroll-triggered animations
const animateOnScroll = () => {
  const elements = document.querySelectorAll("[data-animate]:not(.animated)");
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  elements.forEach((el) => {
    const { top } = el.getBoundingClientRect();
    // Trigger slightly earlier for better perceived performance
    if (top <= viewportHeight * 0.9) {
      el.classList.add("animated");
    }
  });
};

// Initial check
animateOnScroll();

// Listen for scroll events (throttled for performance)
let scrollTimeout;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      animateOnScroll();
    });
  },
  { passive: true }
);

// Stagger animation for skill blocks and project cards
const staggerElements = (selector, delay = 100) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * delay}ms`;
  });
};

// Apply stagger after content loads
setTimeout(() => {
  staggerElements(".skill-block", 80);
  staggerElements(".project-card", 100);
}, 300);

// Back to top button
const backToTopBtn = document.querySelector(".back-to-top");
if (backToTopBtn && !backToTopBtn.dataset.tooltip) {
  backToTopBtn.setAttribute("data-tooltip", "Back to top");
}

if (backToTopBtn) {
  // Show/hide button on scroll
  const toggleBackToTop = () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  };

  // Check initial scroll position
  toggleBackToTop();

  // Listen to scroll
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  // Smooth scroll to top on click
  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
