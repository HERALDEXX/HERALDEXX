// Theme toggle functionality
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const html = document.documentElement;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem("theme") || "dark";
if (currentTheme === "light") {
  html.setAttribute("data-theme", "light");
  themeIcon.textContent = "☀️";
}

themeToggle?.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Update icon with smooth transition
  themeIcon.style.transform = "rotate(360deg)";
  setTimeout(() => {
    themeIcon.textContent = newTheme === "light" ? "☀️" : "🌙";
    themeIcon.style.transform = "rotate(0deg)";
  }, 150);

  // Remove focus/hover state on mobile to hide tooltip
  if ("ontouchstart" in window) {
    themeToggle.blur();
  }
});

// Scroll progress indicator
const scrollProgress = document.getElementById("scroll-progress");
if (scrollProgress) {
  window.addEventListener(
    "scroll",
    () => {
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      scrollProgress.style.width = scrolled + "%";
    },
    { passive: true }
  );
}

// Hero typing effect
const typingEl = document.querySelector(".typing");
const phrases = [
  "Software Developer | Web & Cross-Platform Apps",
  "Automation · UX · Full-Stack Solutions",
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
  const delay = deleting ? 25 : 50;
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

    // Fetch language data for all repos in parallel
    const reposWithLanguages = await Promise.all(
      filtered.map(async (repo) => {
        try {
          const langRes = await fetch(
            `https://api.github.com/repos/HERALDEXX/${repo.name}/languages`,
            {
              headers: { Accept: "application/vnd.github.v3+json" },
            }
          );
          if (langRes.ok) {
            const languages = await langRes.json();
            return { ...repo, languages };
          }
        } catch (e) {
          console.warn(`Failed to fetch languages for ${repo.name}`);
        }
        return { ...repo, languages: null };
      })
    );

    root.setAttribute("aria-busy", "false");
    root.innerHTML = reposWithLanguages
      .map((repo) => {
        const desc = repo.description
          ? repo.description.replace(/</g, "&lt;")
          : "No description available";

        let languageTags = "";
        if (repo.languages && Object.keys(repo.languages).length > 0) {
          const total = Object.values(repo.languages).reduce(
            (a, b) => a + b,
            0
          );
          const langEntries = Object.entries(repo.languages)
            .map(([lang, bytes]) => ({
              lang,
              bytes,
              percent: ((bytes / total) * 100).toFixed(1),
            }))
            .sort((a, b) => b.bytes - a.bytes);

          languageTags = langEntries
            .map((entry, index) => {
              const isTop = index === 0;
              const star = isTop
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="#ffd479" style="flex-shrink: 0; margin-right: 0.25rem;" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>`
                : "";
              return `<li style="display: flex; align-items: center; ${
                isTop ? "font-weight: 600;" : ""
              }">${star}${entry.lang} ${entry.percent}%</li>`;
            })
            .join("");
        } else if (repo.language) {
          // Fallback to basic language if API call failed
          languageTags = `<li style="display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffd479" style="flex-shrink: 0;" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${repo.language}
          </li>`;
        }

        return `
          <article class="project-card" tabindex="0" style="position: relative;" 
                   data-name="${repo.name}" 
                   data-stars="${repo.stargazers_count || 0}" 
                   data-updated="${repo.updated_at || repo.created_at}">
            <h3>${repo.name}</h3>
            <p>${desc}</p>
            <ul class="tags">
              ${languageTags}
            </ul>
            <div class="actions">
              <a class="btn small outline" href="${
                repo.html_url
              }" target="_blank" rel="noopener">View on GitHub</a>
            </div>
            <div style="
              position: absolute;
              bottom: 10px;
              right: 10px;
              width: 1em;
              height: 1em;
              color: currentColor;
            ">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 100%; height: 100%;">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (e) {
    root.innerHTML = '<p style="opacity:.7">Failed to load projects.</p>';
    root.setAttribute("aria-busy", "false");
  }
}
loadProjects();

// Project filtering and search
const setupProjectFilters = () => {
  const searchInput = document.getElementById("project-search");
  const projectCards = document.querySelectorAll(".project-card");

  if (!searchInput || projectCards.length === 0) return;

  const allProjects = [];

  // Store project data for filtering
  projectCards.forEach((card) => {
    const languages = Array.from(card.querySelectorAll(".tags li")).map((tag) =>
      tag.textContent
        .trim()
        .replace(/\s+[\d.]+%$/, "")
        .trim()
    );
    const title = card.querySelector("h3")?.textContent || "";
    const description = card.querySelector("p")?.textContent || "";

    allProjects.push({
      element: card,
      languages,
      titleLower: title.toLowerCase(),
      descriptionLower: description.toLowerCase(),
    });
  });

  // Filter function
  const filterProjects = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    allProjects.forEach((project) => {
      const matchesSearch =
        !searchTerm ||
        project.titleLower.includes(searchTerm) ||
        project.descriptionLower.includes(searchTerm) ||
        project.languages.some((lang) =>
          lang.toLowerCase().includes(searchTerm)
        );

      if (matchesSearch) {
        project.element.style.display = "";
      } else {
        project.element.style.display = "none";
      }
    });
  };

  searchInput.addEventListener("input", filterProjects);
};

// Setup filters after projects are loaded
setTimeout(setupProjectFilters, 1000);

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
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    text: "Clean code always looks like it was written by someone who cares.",
    author: "Robert C. Martin",
  },
  {
    text: "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
  },
  {
    text: "It's not a bug – it's an undocumented feature.",
    author: "Anonymous",
  },
  {
    text: "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
  },
  {
    text: "The most disastrous thing that you can ever learn is your first programming language.",
    author: "Alan Kay",
  },
  {
    text: "Deleted code is debugged code.",
    author: "Jeff Sickel",
  },
  {
    text: "There are only two hard things in Computer Science: cache invalidation and naming things.",
    author: "Phil Karlton",
  },
  {
    text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
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
    // Use instant scroll on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  });
}
// Enhanced page transitions for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;

    e.preventDefault();
    const targetId = href.substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      // Add transition effect
      document.body.classList.add("transitioning");

      setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setTimeout(() => {
          document.body.classList.remove("transitioning");
        }, 100);
      }, 200);
    }
  });
});
