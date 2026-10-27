import { LegalLayout, Placeholder } from '../components/LegalLayout';

export function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <p className="lead">Legal notice according to § 5 DDG (Digitale-Dienste-Gesetz).</p>

      <h2>Provider</h2>
      <p>
        <Placeholder>Full name</Placeholder><br />
        <Placeholder>Street and house number</Placeholder><br />
        <Placeholder>Postal code and city</Placeholder><br />
        <Placeholder>Country</Placeholder>
      </p>

      <h2>Contact</h2>
      <p>
        Email: <Placeholder>email address</Placeholder><br />
        Phone (optional): <Placeholder>phone number</Placeholder>
      </p>

      <h2>Responsible for content</h2>
      <p>
        Responsible according to § 18 (2) MStV: <Placeholder>Full name, address as above</Placeholder>
      </p>

      <h2>Trademark notice</h2>
      <p>
        LEGO® is a trademark of the LEGO Group, which does not sponsor, authorize or endorse this site.
        Mosaic-Me is an independent project and is not affiliated with the LEGO Group or BrickLink.
      </p>

      <h2>Liability for links</h2>
      <p>
        This site links to external websites (for example LEGO Pick-a-Brick, BrickLink, GitHub and
        Unsplash). Their operators are solely responsible for their content. No unlawful content was
        apparent when the links were set; if we become aware of any, we will remove the link.
      </p>

      <h2>Online dispute resolution</h2>
      <p>
        We are neither obliged nor willing to take part in dispute resolution proceedings before a
        consumer arbitration board.
      </p>
    </LegalLayout>
  );
}
