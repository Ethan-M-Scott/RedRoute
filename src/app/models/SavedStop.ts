import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISavedStop extends Document {
  userId: string;
  passioStopId: string;
  stopName: string;
}

const savedStopSchema = new Schema<ISavedStop>({
  userId: { type: String, required: true, index: true },
  passioStopId: { type: String, required: true },
  stopName: { type: String, required: true },
});

const SavedStop: Model<ISavedStop> =
  mongoose.models.SavedStop ||
  mongoose.model<ISavedStop>("SavedStop", savedStopSchema);

export default SavedStop;
