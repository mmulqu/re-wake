import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function createDiscussions() {
  // Pages 3 through 9
  for (let page = 3; page <= 9; page++) {
    try {
      await octokit.graphql(`
        mutation {
          createDiscussion(input: {
            repositoryId: "R_kgDONaHjWA",
            categoryId: "DIC_kwDONaHjWM4ClAFi",
            title: "Re-Wake Page ${page}",
            body: "Discussion thread for Page ${page} of Re-Wake"
          }) {
            discussion {
              id
              url
            }
          }
        }
      `);
      
      console.log(`Created discussion for Page ${page}`);
    } catch (error) {
      console.error(`Error creating discussion for Page ${page}:`, error);
    }
  }
}

createDiscussions(); 