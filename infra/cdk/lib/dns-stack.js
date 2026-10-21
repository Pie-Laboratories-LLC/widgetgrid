import { Stack } from 'aws-cdk-lib';
import { HostedZone, MxRecord, TxtRecord } from 'aws-cdk-lib/aws-route53';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';

const DOMAIN = 'pie-laboratories.com';
export const EMAIL_DOMAIN = DOMAIN;

// Split from DevGatewayStack deliberately: this holds the two things that
// should almost never be torn down/recreated -- the hosted zone and the
// cert. DevGatewayStack, by contrast, will get replaced/extended a lot as
// the real app gets deployed on top of it.
//
// HostedZone.fromLookup, not `new HostedZone()`: pie-laboratories.com turns
// out to already be registered *through* Route53 directly (confirmed by
// inspecting the account -- there's a hosted zone with the "HostedZone
// created by Route53 Registrar" comment, and its NS records are the ones
// actually live on the public internet for this domain). Creating a new
// zone here would just produce a second, orphaned one with no NS
// delegation pointed at it -- learned that the hard way on the first
// attempt at this stack, which had to be torn down. No registrar-side NS
// update needed at all as a result -- Route53 already is the registrar.
export class DnsStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: DOMAIN,
    });

    // Only dev.* for now -- test.* isn't being provisioned yet (see the
    // plan this stack was built from). Adding it later is just another SAN
    // + another Route53 record, not a structural change.
    this.certificate = new Certificate(this, 'DevCertificate', {
      domainName: `dev.${DOMAIN}`,
      validation: CertificateValidation.fromDns(this.hostedZone),
    });

    // Root-domain mail routing for webmaster@pie-laboratories.com ->
    // forwarded to Gmail via ImprovMX (a free third-party forwarder, not
    // AWS SES+Lambda -- chosen specifically because it needs no nameserver
    // migration off Route53, unlike Cloudflare Email Routing, which would
    // break the HostedZone.fromLookup pattern this whole stack depends on).
    // ImprovMX's MX hosts and SPF-include value are fixed/published, not
    // account-specific -- the actual alias (webmaster -> Gmail address) is
    // configured in ImprovMX's own dashboard after signing up there, not
    // here; this only makes mail for the domain route to them at all.
    new MxRecord(this, 'MailMx', {
      zone: this.hostedZone,
      values: [
        { priority: 10, hostName: 'mx1.improvmx.com' },
        { priority: 20, hostName: 'mx2.improvmx.com' },
      ],
    });
    new TxtRecord(this, 'MailSpf', {
      zone: this.hostedZone,
      values: ['v=spf1 include:spf.improvmx.com ~all'],
    });

    // Outbound mail from the site itself (blog subscription confirmations
    // and new-post emails, see packages/server/src/emailSender.js) goes
    // through SES -- separate from the inbound forwarding above, which it
    // doesn't touch. publicHostedZone has CDK write the three DKIM CNAMEs
    // into this zone, and the custom MAIL FROM gets its own MX + SPF on the
    // mail. subdomain -- so the root SPF record above (ImprovMX's) stays
    // as is, while SPF and DKIM both align with the From domain for DMARC.
    // A new SES account starts in the sandbox (sends only to verified
    // addresses) -- production access is requested once, by hand, in the
    // SES console.
    new EmailIdentity(this, 'EmailIdentity', {
      identity: Identity.publicHostedZone(this.hostedZone),
      mailFromDomain: `mail.${DOMAIN}`,
    });
    // Monitor-only (p=none): asks receivers to report, enforces nothing.
    // Gmail and Yahoo expect a DMARC record from anyone sending in bulk.
    new TxtRecord(this, 'MailDmarc', {
      zone: this.hostedZone,
      recordName: '_dmarc',
      values: [`v=DMARC1; p=none; rua=mailto:webmaster@${DOMAIN}`],
    });
  }
}
