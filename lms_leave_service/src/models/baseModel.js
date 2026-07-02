const { Model } = require("objection");
class BaseModel extends Model {
  created_at;
  updated_at;
  /*static get columns(){
        created_at:'created_at';
        updated_at:'updated_at';
    }*/
  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }
  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}
module.exports = BaseModel;
