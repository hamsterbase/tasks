import { execSync } from 'node:child_process';
import { buildCli, cliVersion, CLI_PACKAGE_NAME } from '../utils/buildCli.js';
import { checkUncommittedChanges } from '../utils/git.js';

/**
 * The repository `.npmrc` points at a mirror that cannot be published to, and
 * it applies to the build output because that output lives inside the repo.
 */
const NPM_REGISTRY = 'https://registry.npmjs.org/';

interface CliPublishOptions {
  dryRun?: boolean;
  tag?: string;
  allowDirty?: boolean;
  otp?: string;
}

export async function cliPublishCommand(options: CliPublishOptions = {}): Promise<void> {
  try {
    const version = cliVersion();

    if (!options.allowDirty && checkUncommittedChanges()) {
      console.error('[cli] Error: uncommitted changes detected. Commit them or pass --allow-dirty.');
      process.exit(1);
    }

    if (isPublished(version)) {
      console.error(
        `[cli] Error: ${CLI_PACKAGE_NAME}@${version} is already published. Bump "cliVersion" in tasks/package.json.`
      );
      process.exit(1);
    }

    console.log('[cli] Building CLI...');
    const distDir = await buildCli();

    const args = ['publish', '--access', 'public', `--registry=${NPM_REGISTRY}`];
    if (options.tag) args.push('--tag', options.tag);
    if (options.dryRun) args.push('--dry-run');
    // An account with 2FA enabled rejects the publish with EOTP unless the
    // one-time password rides along with it — the prompt npm would otherwise
    // show never reaches the caller through execSync. `pnpm run` swallows a
    // `--otp` of its own, so NPM_OTP is the way through when this script is
    // reached via the package scripts rather than tsx directly.
    const otp = options.otp || process.env.NPM_OTP;
    if (otp) args.push('--otp', otp);

    console.log(`[cli] npm ${redactOtp(args).join(' ')}`);
    execSync(`npm ${args.join(' ')}`, { cwd: distDir, stdio: 'inherit' });

    if (options.dryRun) {
      console.log(`[cli] Dry run completed. ${CLI_PACKAGE_NAME}@${version} was not published.`);
      return;
    }
    console.log(`[cli] Published ${CLI_PACKAGE_NAME}@${version}`);
  } catch (error) {
    console.error('Error publishing CLI:', error);
    process.exit(1);
  }
}

/** Keeps the one-time password out of the echoed command line. */
function redactOtp(args: string[]): string[] {
  const index = args.indexOf('--otp');
  if (index === -1) {
    return args;
  }
  return args.map((arg, i) => (i === index + 1 ? '<redacted>' : arg));
}

function isPublished(version: string): boolean {
  try {
    // An existing package with an unpublished version exits 0 with empty output.
    const result = execSync(`npm view ${CLI_PACKAGE_NAME}@${version} version --registry=${NPM_REGISTRY}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return result.trim().length > 0;
  } catch {
    // Unknown package or unknown version: both mean this version is publishable.
    return false;
  }
}
