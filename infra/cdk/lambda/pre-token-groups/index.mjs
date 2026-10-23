// Cognito pre-token-generation trigger: puts the signed-in user's IAM
// Identity Center group names into the standard `cognito:groups` claim
// (ID and access tokens). Identity Center doesn't send group membership
// in SAML assertions for custom apps, so it's looked up here by the email
// the assertion does carry. Any lookup failure throws, which fails the
// sign-in -- deliberately closed rather than issuing a token with no groups.
// Only Identity Center sign-ins are looked up (see the handler).
import {
  IdentitystoreClient,
  GetUserIdCommand,
  ListGroupMembershipsForMemberCommand,
  DescribeGroupCommand,
} from '@aws-sdk/client-identitystore';

const client = new IdentitystoreClient({});
const IdentityStoreId = process.env.IDENTITY_STORE_ID;

const IDENTITY_CENTER_PROVIDER = 'IdentityCenter';

function isIdentityCenterUser(identities) {
  if (!identities) return false;
  try {
    return JSON.parse(identities).some((i) => i.providerName === IDENTITY_CENTER_PROVIDER);
  } catch {
    return false;
  }
}

export const handler = async (event) => {
  // Only Identity Center users have groups. Site-registered accounts have
  // no `identities` attribute; social sign-ins (Google etc., 2026-10) do,
  // but naming another provider -- and their email proves nothing about
  // Identity Center, so looking it up there could hand a stranger a staff
  // member's groups (Microsoft's email is unchecked). A site account
  // joined to a Google sign-in lists Google too, never Identity Center.
  if (!isIdentityCenterUser(event.request.userAttributes.identities)) return event;

  const email = event.request.userAttributes.email;
  if (!email) throw new Error('no email attribute on user');

  const { UserId } = await client.send(new GetUserIdCommand({
    IdentityStoreId,
    AlternateIdentifier: { UniqueAttribute: { AttributePath: 'emails.value', AttributeValue: email } },
  }));

  const groupIds = [];
  let NextToken;
  do {
    const page = await client.send(new ListGroupMembershipsForMemberCommand({ IdentityStoreId, MemberId: { UserId }, NextToken }));
    groupIds.push(...page.GroupMemberships.map((m) => m.GroupId));
    NextToken = page.NextToken;
  } while (NextToken);

  const groups = await Promise.all(groupIds.map(async (GroupId) =>
    (await client.send(new DescribeGroupCommand({ IdentityStoreId, GroupId }))).DisplayName));

  event.response.claimsOverrideDetails = { groupOverrideDetails: { groupsToOverride: groups } };
  return event;
};
