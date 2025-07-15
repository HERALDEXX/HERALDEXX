const fs = require("fs");
const https = require("https");

const username = "HERALDEXX";
const readmePath = "README.md";

// ========== QUOTE GENERATOR ==========
const quotes = [
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
  },
  {
    text: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
  },
  {
    text: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
];

const hourUTC = new Date().getUTCHours();

let quoteFormatted = null;

if (hourUTC === 0) {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteFormatted = `🧠  
> *"${quote.text}"*  
> — ${quote.author}
`;
}

// ========== LATEST REPOS FETCHER ==========
const options = {
  hostname: "api.github.com",
  path: `/users/${username}/repos?sort=created&direction=desc&per_page=5`,
  headers: { "User-Agent": "Node.js" },
};

https.get(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const repos = JSON.parse(data);
    const formatted = repos
      .map(
        (repo) =>
          `- [${repo.name}](${repo.html_url}) - ${
            repo.description || "No description"
          }`
      )
      .join("\n");

    let readme = fs.readFileSync(readmePath, "utf-8");

    // Inject repos
    const newRepoSection = `<!--START_SECTION:latest_repos-->\n${formatted}\n<!--END_SECTION:latest_repos-->`;
    readme = readme.replace(
      /<!--START_SECTION:latest_repos-->[\s\S]*<!--END_SECTION:latest_repos-->/,
      newRepoSection
    );

    // Inject quote — only if it's midnight
    if (quoteFormatted) {
      const newQuoteSection = `<!--START_SECTION:quote-->\n${quoteFormatted}\n<!--END_SECTION:quote-->`;
      readme = readme.replace(
        /<!--START_SECTION:quote-->[\s\S]*<!--END_SECTION:quote-->/,
        newQuoteSection
      );
    }

    fs.writeFileSync(readmePath, readme);
  });
});
