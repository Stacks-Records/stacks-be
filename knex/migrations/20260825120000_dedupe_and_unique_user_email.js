// users.email has never had a unique constraint, and both /api/v1/users/me and
// POST /api/v1/users auto-provision with a check-then-insert (see api/index.js).
// Two concurrent first-login requests can both pass the "no existing user" check
// and both insert, leaving two rows for the same email — which then makes every
// `.where('email', email).first()` lookup ambiguous (e.g. a role promotion by id
// can land on the row `.first()` never returns). This migration merges any
// existing duplicates before locking the column down so it can't happen again.

const ROLE_RANK = { admin: 2, moderator: 1, user: 0 };

exports.up = async function (knex) {
    const duplicateEmails = await knex('users')
        .select('email')
        .groupBy('email')
        .havingRaw('count(*) > 1');

    for (const { email } of duplicateEmails) {
        const rows = await knex('users').where('email', email).orderBy('id', 'asc');

        const survivor = rows.reduce((best, row) => {
            const bestRank = ROLE_RANK[best.role] ?? 0;
            const rowRank = ROLE_RANK[row.role] ?? 0;
            return rowRank > bestRank ? row : best;
        }, rows[0]);
        const losers = rows.filter(row => row.id !== survivor.id);
        const loserIds = losers.map(row => row.id);

        const mergedStack = new Map();
        for (const row of rows) {
            for (const album of row.mystack || []) {
                mergedStack.set(album.id, album);
            }
        }

        await knex('users').where('id', survivor.id).update({
            mystack: [...mergedStack.values()],
        });

        // user_preferences.user_id is unique, so a loser's preferences row can only
        // move to the survivor if the survivor doesn't already have one.
        const survivorHasPreferences = await knex('user_preferences')
            .where('user_id', survivor.id).first();
        if (!survivorHasPreferences) {
            const loserPreferences = await knex('user_preferences')
                .whereIn('user_id', loserIds).orderBy('user_id', 'asc').first();
            if (loserPreferences) {
                await knex('user_preferences')
                    .where('id', loserPreferences.id)
                    .update({ user_id: survivor.id });
            }
        }

        await knex('user_preferences').whereIn('user_id', loserIds).del();
        await knex('users').whereIn('id', loserIds).del();
    }

    await knex.schema.alterTable('users', function (table) {
        table.unique('email');
    });
};

exports.down = function (knex) {
    // The duplicate merge above is not reversible (rows were deleted); down()
    // only removes the constraint.
    return knex.schema.alterTable('users', function (table) {
        table.dropUnique('email');
    });
};
