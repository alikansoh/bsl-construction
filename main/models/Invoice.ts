import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  seq: number;
  status: "sent" | "paid";
  issueDate: Date;
  dueDate: Date;
  reference?: string;
  client: {
    name: string;
    addressLines: string[];
    email?: string;
    phone?: string;
  };
  workDescription?: string;
  lineItems: IInvoiceLineItem[];
  vatRate: number;
  discount: number;
  notes?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<IInvoiceLineItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    unitPrice: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    seq: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["sent", "paid"],
      default: "sent",
      required: true,
    },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    reference: { type: String, trim: true, default: "" },
    client: {
      name: { type: String, required: true, trim: true },
      addressLines: { type: [String], default: [] },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },
    workDescription: { type: String, trim: true, default: "" },
    lineItems: { type: [LineItemSchema], default: [] },
    vatRate: { type: Number, default: 20, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, default: "" },
    paymentTerms: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
