const { Model } = require("../connection");
class Month extends Model {
  month_name;
  month_num;
  static get tableName() {
    return "months";
  }
}
module.exports = Month;
