exports.seed = async function (knex) {
  await knex("months").del();

  await knex("months").insert([
    { month_name: "January", month_num: 1 },
    { month_name: "February", month_num: 2 },
    { month_name: "March", month_num: 3 },
    { month_name: "April", month_num: 4 },
    { month_name: "May", month_num: 5 },
    { month_name: "June", month_num: 6 },
    { month_name: "July", month_num: 7 },
    { month_name: "August", month_num: 8 },
    { month_name: "September", month_num: 9 },
    { month_name: "October", month_num: 10 },
    { month_name: "November", month_num: 11 },
    { month_name: "December", month_num: 12 },
  ]);
};
