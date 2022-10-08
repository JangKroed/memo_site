const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  value: String,
  doneAt: Date,
  order: Number,
});

/**
 * virtual Schema 사용 : 고유한 값을 todoId에 부여
 */ 
TodoSchema.virtual("todoId").get(function () {
  return this._id.toHexString();
});
/**
 * toJSON으로 변환될때 virtual Schema를 포함
 */
TodoSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Todo", TodoSchema);
