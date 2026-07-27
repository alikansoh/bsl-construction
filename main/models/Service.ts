import mongoose, { Document, Model, Schema } from "mongoose";

export interface IService extends Document {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: {
      url: string;
      publicId?: string;
      alt: string;
    };
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };

  sections: {
    id: string;
    layout: "image-left" | "image-right";
    title: string;
    content: string;
    image?: {
      url?: string;
      publicId?: string;
      alt?: string;
    };
    cta?: {
      label?: string;
      href?: string;
    };
  }[];

  whatsIncluded: {
    title: string;
    intro: string;
    items: string[];
  };

  process: {
    title: string;
    description: string;
    steps: {
      step: number;
      title: string;
      content: string;
    }[];
  };

  gallery: {
    url: string;
    publicId?: string;
    alt: string;
  }[];

  faqs: {
    question: string;
    answer: string;
  }[];

  cta?: {
    title?: string;
    content?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

/* Strict versions — used where the field is genuinely required (hero). */

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
  { _id: false }
);

const CtaSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    href: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

/*
  Optional versions — used for content sections, where the image and CTA
  are genuinely optional. Without these, Mongoose still validates the
  inner fields of the shared ImageSchema/CtaSchema as required even when
  the parent field itself isn't marked required, causing save() to fail
  on empty strings.
*/

const OptionalImageSchema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },
    publicId: {
      type: String,
      trim: true,
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const OptionalCtaSchema = new Schema(
  {
    label: {
      type: String,
      trim: true,
      default: "",
    },
    href: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

/*
  Optional version of the page-level CTA block (different shape from the
  section CTA above: title/content/buttonLabel/buttonHref instead of
  label/href). Using a real Schema type here — rather than a plain nested
  object literal — means that if `cta` is omitted entirely, Mongoose won't
  create the subdocument at all, so its fields are never validated.
*/

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
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
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

    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    categoryName: {
      type: String,
      required: true,
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

    hero: {
      eyebrow: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      image: {
        type: ImageSchema,
        required: true,
      },
      primaryCta: {
        type: CtaSchema,
        required: true,
      },
      secondaryCta: {
        type: CtaSchema,
        required: true,
      },
    },

    sections: [
      {
        id: {
          type: String,
          required: true,
        },
        layout: {
          type: String,
          enum: ["image-left", "image-right"],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        image: {
          type: OptionalImageSchema,
        },
        cta: {
          type: OptionalCtaSchema,
        },
      },
    ],

    whatsIncluded: {
      title: {
        type: String,
        required: true,
      },
      intro: {
        type: String,
        required: true,
      },
      items: {
        type: [String],
        default: [],
      },
    },

    process: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      steps: [
        {
          step: {
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
        },
      ],
    },

    gallery: {
      type: [ImageSchema],
      default: [],
    },

    faqs: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
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
      },
      metaDescription: {
        type: String,
        required: true,
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

const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);

export default Service;