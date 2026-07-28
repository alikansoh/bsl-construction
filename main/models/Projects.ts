import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProject extends Document {
  slug: string;
  title: string;
  shortDescription: string;

  category: string;
  client?: string;
  location?: string;

  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  completedAt?: Date;
  duration?: string;

  thumbnail: {
    url: string;
    publicId?: string;
    alt: string;
  };

  heroImage: {
    url: string;
    publicId?: string;
    alt: string;
  };

  gallery: {
    url: string;
    publicId?: string;
    alt: string;
  }[];

  overview: {
    title: string;
    content: string;
  };

  challenges: {
    title: string;
    items: string[];
  };

  solutions: {
    title: string;
    items: string[];
  };

  results: {
    title: string;
    items: string[];
  };

  technologies: string[];

  projectDetails: {
    label: string;
    value: string;
  }[];

  cta?: {
    title: string;
    content: string;
    buttonLabel: string;
    buttonHref: string;
  };

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

const OptionalPageCtaSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    buttonLabel: {
      type: String,
      trim: true,
      default: "",
    },

    buttonHref: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const ProjectSchema = new Schema<IProject>(
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

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    client: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
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

    completedAt: {
      type: Date,
    },

    duration: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: ImageSchema,
      required: true,
    },

    heroImage: {
      type: ImageSchema,
      required: true,
    },

    gallery: {
      type: [ImageSchema],
      default: [],
    },

    overview: {
      title: {
        type: String,
        default: "Overview",
      },

      content: {
        type: String,
        required: true,
      },
    },

    challenges: {
      title: {
        type: String,
        default: "Challenges",
      },

      items: {
        type: [String],
        default: [],
      },
    },

    solutions: {
      title: {
        type: String,
        default: "Solutions",
      },

      items: {
        type: [String],
        default: [],
      },
    },

    results: {
      title: {
        type: String,
        default: "Results",
      },

      items: {
        type: [String],
        default: [],
      },
    },

    technologies: {
      type: [String],
      default: [],
    },

    projectDetails: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },

        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    cta: {
      type: OptionalPageCtaSchema,
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

const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;