/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 *
 */
const albums = require("../../albums")
exports.seed = async function (knex) {
  try {
    await knex('albums').del()
    await knex.batchInsert('albums', albums)

  } catch (error) {
    console.log('Error:', error.message)
  }
};
