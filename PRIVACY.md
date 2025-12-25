# Privacy & Data Protection

Mosaic-Me is designed with privacy as a core principle. This document explains our data practices and GDPR compliance.

## Analytics Data

### What We Collect
We collect **truly anonymous** usage statistics to understand how the app is used:
- Daily unique visitor counts
- Number of mosaics created
- Download statistics (PNG exports, CSV exports)
- Baseplate size preferences

### What We DO NOT Collect
- ❌ No names, email addresses, or contact information (for regular users)
- ❌ No IP addresses stored in the database
- ❌ No long-term tracking of individuals
- ❌ No personal identifiable information
- ❌ No cookies for tracking purposes

### How It Works (Technical Details)

Our analytics system uses **daily rotating hashes**:

1. When you visit, we create a temporary hash from:
   - Your IP address
   - Your browser's user agent
   - **The current date**
   - A secret salt

2. This hash:
   - Is unique to you **for today only**
   - Changes automatically every day
   - Cannot be reversed to identify you
   - Cannot link your behavior across days

**Example:**
- Monday: You get hash `abc123...`
- Tuesday: You get hash `xyz789...` (completely different)

This means we can count "10 unique visitors on Monday" but we **cannot** tell if any of those 10 came back on Tuesday. This makes the data truly anonymous.

### Data Retention

- Analytics events are **automatically deleted after 90 days**
- Cleanup runs on every application startup
- No historical tracking beyond the retention period

### Legal Basis

Under GDPR, **truly anonymous data is not personal data**. Our analytics qualify as truly anonymous because:

✅ Data cannot identify individuals
✅ Data cannot link behavior over time
✅ Data cannot be combined to re-identify someone
✅ Hash changes daily, preventing long-term tracking

Therefore, **no consent is required** for our analytics.

## Admin Dashboard Data

For site administrators only:
- Admin email addresses (for authentication)
- Password hashes (bcrypt)
- Login timestamps

This data is:
- Used only for authentication
- Not shared with third parties
- Secured with industry-standard encryption

## Data Protection Rights

Even though our analytics data is truly anonymous, you still have rights:

- **Right to Information**: This document explains what we collect
- **Right to Object**: You can use ad blockers or disable JavaScript to prevent analytics
- **Right to Erasure**: Contact us to request deletion of any data

## Contact

For privacy concerns or data deletion requests:
- GitHub Issues: [mosaic-me-web/issues](https://github.com/jonathantiedchen/mosaic-me-web/issues)

## Changes to This Policy

We may update this privacy policy. Changes will be reflected in this document with the date below.

**Last Updated**: 2025-12-25
