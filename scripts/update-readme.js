const fs = require("fs");
const https = require("https");

const username = "HERALDEXX";
const readmePath = "README.md";
const token = process.env.GH_TOKEN;

// GitHub API options
const options = {
  hostname: "api.github.com",
  path: `/users/${username}/repos?sort=created&direction=desc&per_page=5`,
  headers: {
    "User-Agent": "HERALDEXX-readme-bot", // Required
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${token}`,
  },
};

https
  .get(options, (res) => {
    let data = "";

    res.on("data", (chunk) => (data += chunk));

    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);

        // Check if GitHub returned an error
        if (!Array.isArray(parsed)) {
          console.error("GitHub API error:", parsed.message || parsed);
          process.exit(1); // Fail the GitHub Action
        }

        const formatted = parsed
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
          /<!--START_SECTION:latest_repos-->[\s\S]*?<!--END_SECTION:latest_repos-->/,
          newRepoSection
        );

        fs.writeFileSync(readmePath, readme);
        console.log("README updated with latest repos.");
      } catch (err) {
        console.error("Failed to parse JSON or write file:", err.message);
        process.exit(1);
      }
    });
  })
  .on("error", (err) => {
    console.error("Request failed:", err.message);
    process.exit(1);
  });
