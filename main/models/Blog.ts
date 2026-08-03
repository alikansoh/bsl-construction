import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlog extends Document {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  updatedAt: Date;

  category: string;
  author: string;
  tags: string[];

  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  publishedAt?: Date;
  readTime?: string;

  thumbnail: {
    url: string;
    publicId?: string;
    alt: string;
  };

  coverImage: {
    url: string;
    publicId?: string;
    alt: string;
  };

  content: string;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    alt: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const BlogSchema = new Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
    },

    readTime: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: ImageSchema,
      required: true,
    },

    coverImage: {
      type: ImageSchema,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    seo: {
      metaTitle: {
        type: String,
        required: true,
        trim: true,
      },

      metaDescription: {
        type: String,
        required: true,
        trim: true,
      },

      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;