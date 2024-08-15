/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('albums', function (table) {
        table.string('id')
        table.string('albumName')
        table.string('artist')
        table.string('releaseDate')
        table.string('genre')
        table.string('label')
        table.specificType('bandMembers', 'text[]')
        table.boolean('isBandTogether')
        table.string('rollingStoneReview')
        table.integer('albumsSold')
        table.string('youTubeAlbumURL')
        table.string('imgURL')

    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('albums') 
};
