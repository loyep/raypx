import { defineRelations } from "drizzle-orm";
import {
  account,
  apikey,
  invitation,
  member,
  oauthAccessToken,
  oauthApplication,
  oauthConsent,
  passkey,
  session,
  user,
} from "../auth";
import { organization } from "../organizations";

export const authRelations = defineRelations(
  {
    user,
    session,
    account,
    oauthApplication,
    oauthAccessToken,
    oauthConsent,
    apikey,
    passkey,
    member,
    invitation,
    organization,
  },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      oauthApplications: r.many.oauthApplication({
        from: r.user.id,
        to: r.oauthApplication.userId,
      }),
      oauthAccessTokens: r.many.oauthAccessToken({
        from: r.user.id,
        to: r.oauthAccessToken.userId,
      }),
      oauthConsents: r.many.oauthConsent({
        from: r.user.id,
        to: r.oauthConsent.userId,
      }),
      apikeys: r.many.apikey({
        from: r.user.id,
        to: r.apikey.userId,
      }),
      passkeys: r.many.passkey({
        from: r.user.id,
        to: r.passkey.userId,
      }),
      memberships: r.many.member({
        from: r.user.id,
        to: r.member.userId,
      }),
      sentInvitations: r.many.invitation({
        from: r.user.id,
        to: r.invitation.inviterId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    passkey: {
      user: r.one.user({
        from: r.passkey.userId,
        to: r.user.id,
      }),
    },
    oauthApplication: {
      user: r.one.user({
        from: r.oauthApplication.userId,
        to: r.user.id,
      }),
      oauthAccessTokens: r.many.oauthAccessToken({
        from: r.oauthApplication.clientId,
        to: r.oauthAccessToken.clientId,
      }),
      oauthConsents: r.many.oauthConsent({
        from: r.oauthApplication.clientId,
        to: r.oauthConsent.clientId,
      }),
    },
    oauthAccessToken: {
      oauthApplication: r.one.oauthApplication({
        from: r.oauthAccessToken.clientId,
        to: r.oauthApplication.clientId,
      }),
      user: r.one.user({
        from: r.oauthAccessToken.userId,
        to: r.user.id,
      }),
    },
    oauthConsent: {
      oauthApplication: r.one.oauthApplication({
        from: r.oauthConsent.clientId,
        to: r.oauthApplication.clientId,
      }),
      user: r.one.user({
        from: r.oauthConsent.userId,
        to: r.user.id,
      }),
    },
    apikey: {
      user: r.one.user({
        from: r.apikey.userId,
        to: r.user.id,
      }),
    },
    member: {
      user: r.one.user({
        from: r.member.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id,
      }),
    },
    invitation: {
      inviter: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),
    },
  }),
);
