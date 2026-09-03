import mongoose, { Document, Model, Schema } from "mongoose";

export interface IQuoteSection {
  title: string;
  bullets: string[];
  note?: string;
  price: number;
}

export interface IQuote extends Document {
  quoteNumber: string;
  seq: number;
  status: "sent" | "accepted" | "declined";
  date: Date;
  validUntil?: Date;
  project: string;
  location: string;
  preparedBy: string;
  client: {
    name: string;
    addressLines: string[];
    email?: string;
    phone?: string;
  };
  intro?: string;
  sections: IQuoteSection[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<IQuoteSection>(
  {
    title: { type: String, required: true, trim: true },
    bullets: { type: [String], default: [] },
    note: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const QuoteSchema = new Schema<IQuote>(
  {
    quoteNumber: { type: String, required: true, unique: true, trim: true },
    seq: { type: Number, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["sent", "accepted", "declined"],
      default: "sent",
      required: true,
    },
    date: { type: Date, required: true },
    validUntil: { type: Date },
    project: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    preparedBy: { type: String, trim: true, default: "" },
    client: {
      name: { type: String, required: true, trim: true },
      addressLines: { type: [String], default: [] },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },
    intro: { type: String, trim: true, default: "" },
    sections: { type: [SectionSchema], default: [] },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Quote: Model<IQuote> =
  mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);

export default Quote;
