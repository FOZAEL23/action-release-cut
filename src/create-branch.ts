import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github";

export async function createBranch(github: any, context: Context, branch: string) {
  const toolkit : GitHub = new github(githubToken());
    let branchExists;
    // throws HttpError if branch already exists.
    try {
      await toolkit.repos.getBranch({
        ...context.repo,
        branch
      })

      branchExists = true;
    } catch(error) {
      if(error.name === 'HttpError' && error.status === 404) {
        // Sometimes branch might come in with refs/heads already
        console.log(`Incoming Branch: ${branch}`);
        branch = branch.replace('refs/heads/', '');
        console.log(`Replaced branch: ${branch}`);
        await toolkit.git.createRef({
          ref: `refs/heads/${branch}`,
          sha: context.sha,
          ...context.repo
        })
      } else {
        throw Error(error)
      }
    }
}

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    throw ReferenceError('No token defined in the environment variables');
  return token;
}
