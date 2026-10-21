export const shorthands = undefined;

// Email updates on new blog posts (packages/server/src/postMailer.js and
// services/subscriptionService.js).
export function up(pgm) {
  // One row per address. 'pending' until the confirmation link is used
  // (double opt-in) -- or created 'active' straight away for a signed-in
  // user subscribing their own, already-verified account email.
  pgm.createTable('email_subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Lowercased on the way in; the unique key.
    email: { type: 'text', notNull: true, unique: true },
    status: { type: 'text', notNull: true, default: 'pending', check: "status IN ('pending', 'active')" },
    // sha256 of the emailed confirmation token -- the token itself is only
    // ever in the email.
    confirm_token_hash: { type: 'text', unique: true },
    // When the last confirmation email went out: both its expiry clock and
    // the resend throttle (one per address per few hours, so the form
    // can't be used to flood someone's inbox).
    confirm_sent_at: { type: 'timestamptz' },
    confirmed_at: { type: 'timestamptz' },
    // In every email's unsubscribe link and List-Unsubscribe header --
    // stable for the subscription's life, since old emails keep working.
    unsubscribe_token: { type: 'text', notNull: true, unique: true },
    user_id: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Every post that has been emailed (or deliberately skipped): the
  // dedupe that makes "email each new post once" survive restarts and
  // more than one server replica -- whoever inserts the row sends.
  pgm.createTable('blog_post_mailings', {
    slug: { type: 'text', primaryKey: true },
    // false for the posts that already existed when mailing first ran:
    // recorded so they're never sent, not because they were.
    sent: { type: 'boolean', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
}

export function down(pgm) {
  pgm.dropTable('blog_post_mailings');
  pgm.dropTable('email_subscriptions');
}
