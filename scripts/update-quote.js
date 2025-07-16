const fs = require("fs");

const readmePath = "README.md";

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

const quote = quotes[Math.floor(Math.random() * quotes.length)];
const quoteFormatted = `🧠  
                                                                        > *"${quote.text}"*  
                                                                        > — ${quote.author}
                                                                        `;

let readme = fs.readFileSync(readmePath, "utf-8");

const newQuoteSection = `<!--START_SECTION:quote-->\n${quoteFormatted}\n<!--END_SECTION:quote-->`;

readme = readme.replace(
  /<!--START_SECTION:quote-->[\s\S]*<!--END_SECTION:quote-->/,
  newQuoteSection
);

fs.writeFileSync(readmePath, readme);
