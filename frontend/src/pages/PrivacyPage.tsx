import { LegalLayout } from '../components/LegalLayout';

// Keep in sync with the code: retention periods live in backend/migrations/005, 007 and 008
export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy policy">
      <p className="lead">
        Mosaic-Me needs no account, sets no cookies, loads no third-party scripts and does not keep
        the photos you upload. This page explains what is processed anyway and why.
      </p>

      <h2>1. Controller</h2>
      <p>
        Mosaic-Me is a private, non-commercial project run by Jonathan Tiedchen, Denmark.<br />
        Email: <a href="mailto:jonathantiedchen@gmail.com">jonathantiedchen@gmail.com</a>
      </p>

      <h2>2. Hosting and server logs</h2>
      <p>
        The website and its API are hosted by Vercel Inc., USA. The servers that run the API are in
        Frankfurt, Germany. When you open the site, your browser sends technical data that the host
        processes to deliver it and keep it secure: IP address, date and time, requested address,
        browser type (user agent) and referring page. Vercel keeps these request logs only for a limited
        period as described in its privacy policy. Our application's own logs contain no IP addresses
        and no photos.
      </p>
      <p>
        Legal basis: Art. 6(1)(f) GDPR (our legitimate interest in running a secure, working website).
        Vercel is a US company; transfers to the USA rely on the EU-US Data Privacy Framework and the EU
        Standard Contractual Clauses. We have a data processing agreement with Vercel.
      </p>

      <h2>3. Photos you upload</h2>
      <p>
        To create a mosaic, your photo is sent to our server, converted into a grid of brick colors in
        memory and discarded as soon as the result is returned to your browser. The photo is never
        written to disk, a database or a log. Edits you make happen in your browser; when you download a
        file, only the grid of color codes is sent to the server to build it, and that is not stored
        either.
      </p>
      <p>Legal basis: Art. 6(1)(b) GDPR (providing the service you request).</p>

      <h2>4. Usage statistics</h2>
      <p>
        When a mosaic is created or a file downloaded, we store a record of that event: its type and
        time, the chosen size, piece type and file type, a random ID for the mosaic, and a visitor ID.
        The visitor ID is a SHA-256 hash of your IP address, your browser's user agent, the current date
        and a secret key. Your IP address and user agent themselves are not stored. Because the date is
        part of the hash, the visitor ID changes every day.
      </p>
      <p>
        This data is pseudonymous, not anonymous: the mosaic ID can connect events about the same
        mosaic across days, and whoever holds the secret key could in principle test whether a given IP
        address produced a given ID. We use it only to count visitors, mosaics and downloads, never to
        identify or profile anyone, and never share it.
      </p>
      <p>
        Legal basis: Art. 6(1)(f) GDPR (our legitimate interest in understanding how the service is
        used). These statistics store nothing on your device.
        Individual events are deleted after 90 days; only daily totals (counts) are kept longer.
      </p>

      <h2>5. Saving mosaics</h2>
      <p>
        <strong>In this browser.</strong> When you click "Save in this browser", the mosaic, a small
        preview and your original photo are stored in your browser's own storage (IndexedDB) on your
        device. They are never sent to us. The order checklist also remembers which steps you ticked in
        your browser's local storage. You can delete saved mosaics in the app at any time, or by
        clearing this site's data in your browser.
      </p>
      <p>
        <strong>Share links.</strong> When you click "Get a share link", we store the mosaic's brick
        colors, its size and piece type under a random link, together with when it was created and last
        opened. Your photo is not stored, and nothing about who created the link. Anyone who has the
        link can open the mosaic. A link is deleted 365 days after it was last opened.
      </p>
      <p>
        Legal basis: Art. 6(1)(b) GDPR (providing the service you request). Storing data on your device
        only happens when you ask for it, so it is strictly necessary for that service and needs no
        consent under the ePrivacy rules (in Denmark, the Executive Order on cookies).
      </p>

      <h2>6. Feedback</h2>
      <p>
        If you send feedback, we store your rating (thumbs up or down), your optional comment (up to
        1000 characters), the mosaic ID if the feedback is about a mosaic, the visitor ID described
        above and the time. Please do not include personal details in comments. Feedback is deleted
        after 365 days.
      </p>
      <p>Legal basis: Art. 6(1)(f) GDPR (our legitimate interest in improving the service).</p>

      <h2>7. Database</h2>
      <p>
        Usage statistics, share links and feedback are stored in a PostgreSQL database run by Supabase Inc. in Frankfurt, Germany (region eu-central-1).
        We have a data processing agreement with Supabase.
      </p>

      <h2>8. Fonts</h2>
      <p>
        The fonts on this site (DM Sans and DM Serif Display) are served from our own domain. Your
        browser does not connect to Google or any other font provider.
      </p>

      <h2>9. External links</h2>
      <p>
        We link to LEGO Pick-a-Brick, BrickLink and Unsplash. These sites are only contacted if
        you click a link; from then on their own privacy policies apply.
      </p>

      <h2>10. Admin area</h2>
      <p>
        The admin dashboard is only for the site operator. Logging in stores a session token in that
        browser's local storage. Admin email addresses, password hashes and login times are stored to
        secure the account. Visitors are never asked to log in.
      </p>

      <h2>11. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>access the data we hold about you (Art. 15 GDPR),</li>
        <li>have it corrected (Art. 16) or erased (Art. 17),</li>
        <li>restrict its processing (Art. 18) and receive it in a portable format (Art. 20),</li>
        <li>
          <strong>object at any time</strong> to processing based on our legitimate interests
          (Art. 21), and
        </li>
        <li>lodge a complaint with a data protection supervisory authority (Art. 77), for example
          the one where you live or the Danish Data Protection Agency (Datatilsynet,{' '}
          <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">datatilsynet.dk</a>).</li>
      </ul>
      <p>
        Because we cannot tell from the stored data who you are, please tell us enough for us to find
        your data (for example the time of your feedback and its wording). Contact:{' '}
        <a href="mailto:jonathantiedchen@gmail.com">jonathantiedchen@gmail.com</a>.
      </p>
      <p>
        You are not obliged to provide any data, but without sending a photo the service cannot create a
        mosaic. There is no automated decision-making or profiling.
      </p>

      <h2>12. Changes</h2>
      <p>We update this policy when the service changes. Last updated: 15 November 2026.</p>
    </LegalLayout>
  );
}
