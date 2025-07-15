const fs = require('fs');
const https = require('https');

const username = 'HERALDEXX';
const readmePath = 'README.md';

const options = {
  hostname: 'api.github.com',
  path: `/users/${username}/repos?sort=created&direction=desc&per_page=5`,
  headers: { 'User-Agent': 'Node.js' }
};

https.get(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const repos = JSON.parse(data);
    const formatted = repos.map(repo =>
      `- [${repo.name}](${repo.html_url}) - ${repo.description || 'No description'}`
    ).join('\n');

    let readme = fs.readFileSync(readmePath, 'utf-8');
    const newSection = `<!--START_SECTION:latest_repos-->\n${formatted}\n<!--END_SECTION:latest_repos-->`;
    readme = readme.replace(/<!--START_SECTION:latest_repos-->[\s\S]*<!--END_SECTION:latest_repos-->/, newSection);

    fs.writeFileSync(readmePath, readme);
  });
});
