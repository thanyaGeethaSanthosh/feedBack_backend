exports.up = function (knex) {
  return knex.transaction(async function (trx) {
    await trx.schema.dropTableIfExists('users');
    await trx.schema.dropTableIfExists('feedbacks');
    await trx.schema.dropTableIfExists('groups');

    await trx.schema.createTable('users', function (table) {
      table.string('id', 30).notNullable().primary();
      table.integer('github_id').notNullable().unique();
      table.string('full_name', 30).notNullable().defaultTo('Anonymous');
      table.string('avatar_url', 100).notNullable();
    });

    await trx.schema.createTable('feedbacks', function (table) {
      table.increments('feed_back_id');
      table
        .string('given_sender_name', 30)
        .notNullable()
        .defaultTo('Anonymous');
      table.string('sender', 30).notNullable().unique();
      table.string('recipient', 30).notNullable().unique();
      table.string('topic', 50).notNullable();
      table.string('suggestion', 300).notNullable();
      table.timestamp('send_time').defaultTo(trx.fn.now());
      table.foreign('sender').references('users.id');
      table.foreign('recipient').references('users.id');
    });

    await trx.schema.createTable('groups', function (table) {
      table.string('group_id', 30).notNullable().unique();
      table.string('group_name', 30).notNullable().primary();
      table.string('member_names', 30).notNullable().defaultTo('[]');
    });
  });
};

exports.down = function (knex) {
  return knex.transaction(async function (trx) {
    await trx.schema.dropTableIfExists('users');
    await trx.schema.dropTableIfExists('feedbacks');
    await trx.schema.dropTableIfExists('groups');
  });
};
