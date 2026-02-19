import mongoose, { Schema, model, models } from "mongoose";

const PromptSchema = new Schema({
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	prompt: {
		type: String,
		required: [true, "Prompt is required"],
	},
	tag: {
		type: [String],
		required: [true, "Tag is required"],
	},
	views: {
		type: Number,
		default: 0,
	},
	likes: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "User",
		default: [],
	},
});

const Prompt = models.Prompt || model("Prompt", PromptSchema);
export default Prompt;
