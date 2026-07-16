import passport from 'passport';
import {
  Strategy as GitHubStrategy,
  type Profile as GitHubPassportProfile,
} from 'passport-github2';

import { environment, logger } from './index';
import { authenticateGithubUser } from '../services';
import type { GithubProfile } from '../types';

type GitHubVerifyCallback = (error: Error | null, user?: Express.User | false) => void;

const getProfileEmail = (profile: GitHubPassportProfile): string => {
  const email = profile.emails?.find((profileEmail) => profileEmail.value)?.value;

  if (email) {
    return email;
  }

  return `${profile.username}-${profile.id}@users.noreply.github.com`;
};

const getAvatarUrl = (profile: GitHubPassportProfile): string | undefined => {
  return profile.photos?.find((photo) => photo.value)?.value;
};

const toGithubProfile = (profile: GitHubPassportProfile): GithubProfile => {
  return {
    githubId: profile.id,
    username: profile.username ?? profile.displayName ?? `github-${profile.id}`,
    email: getProfileEmail(profile),
    avatarUrl: getAvatarUrl(profile),
    name: profile.displayName,
  };
};

passport.use(
  new GitHubStrategy(
    {
      clientID: environment.GITHUB_CLIENT_ID,
      clientSecret: environment.GITHUB_CLIENT_SECRET,
      callbackURL: environment.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubPassportProfile,
      done: GitHubVerifyCallback,
    ) => {
      authenticateGithubUser(toGithubProfile(profile))
        .then((user) => {
          done(null, {
            ...user,
            githubAccessToken: _accessToken,
          });
        })
        .catch((error: unknown) => {
          logger.error('GitHub authentication failed', {
            githubId: profile.id,
            error: error instanceof Error ? error.message : 'Unknown GitHub authentication error',
          });

          done(error instanceof Error ? error : new Error('GitHub authentication failed'));
        });
    },
  ),
);

export { passport };
