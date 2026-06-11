const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const LandingPageSetup = sequelize.define(
    "landing_page_setup",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      // ==================== HERO SECTION (Editable) ====================
      hero_headline: {
        type: DataTypes.STRING,
        defaultValue: "Converting effort into extraordinary outcomes.",
      },
      hero_subtext: {
        type: DataTypes.TEXT,
        defaultValue:
          "Integrating your workflows, analytics, and creativity to produce simple, powerful, and connected results.",
      },
      hero_image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded hero image path: /uploads/landing/...",
      },

      // ==================== EXPERTISE SECTION (Editable) ====================
      expertise_image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded expertise image path: /uploads/landing/...",
      },
      expertise_title: {
        type: DataTypes.STRING,
        defaultValue:
          "Your operations elevated, powered by our industry expertise",
      },
      expertise_description: {
        type: DataTypes.TEXT,
        defaultValue:
          "A modern, scalable solution built to improve decision-making, reduce friction, and drive consistent results securely and at any size.",
      },

      // ==================== TRUSTED LOGOS (Editable) ====================
      trusted_title: {
        type: DataTypes.STRING,
        defaultValue: "Trusted By Companies That Drive Change",
        comment: "This title is fixed — do not allow editing",
      },
      trusted_logos: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment:
          "Array of uploaded logo paths: ['/uploads/landing/logo1.png', ...]",
      },

      // ==================== SERVICES (How do we drive your success?) ====================
      services_title: {
        type: DataTypes.STRING,
        defaultValue: "How do we drive your success?",
        comment: "Fixed title — do not allow edit",
      },
      services_desc: {
        type: DataTypes.TEXT,
        defaultValue:
          "From planning to performance, we deliver intuitive solutions that streamline operations and unlock new opportunities for your business.",
        comment: "description — allow edit",
      },
      services: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment:
          "Editable array: [{ name: string, description: string, icon: string (uploaded path) }]",
      },

      // ==================== ABOUT US SECTION (Editable parts only) ====================
      about_hero_title: {
        type: DataTypes.TEXT,
        defaultValue:
          "Your platform should feel like an <span class='underline decoration-[#000000]/40 underline-offset-8'>advantage</span>, not a burden.",
        comment:
          'Admin can customize. Supports <span class="underline decoration-[#000000]/40 underline-offset-8">advantage</span>',
      },
      about_hero_desc: {
        type: DataTypes.TEXT,
        defaultValue:
          "Most tools promise efficiency — but deliver complexity and frustration. We built ours differently, with simplicity, clarity, and long-term reliability at the core.",
      },
      about_image1: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "About section floating image 1",
      },
      about_image2: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "About section floating image 2",
      },
      about_image3: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "About section floating image 3",
      },

      problems_title: {
        type: DataTypes.TEXT,
        defaultValue: "Where traditional platforms fall short",
      },

      problems_list: {
        type: DataTypes.JSON,
        defaultValue: [
          "Overloaded with features nobody uses",
          "Steep learning curves and endless training",
          "Rigid structures that don’t adapt",
          "Fragile scaling that requires constant fixes",
        ],
        comment:
          "bullet points under 'Where traditional CRMs go wrong problem title' — allow edit and max 4",
      },

      // Our Approach — Admin can edit content (max 4 steps enforced in UI)
      approach_steps: {
        type: DataTypes.JSON,
        defaultValue: [
          {
            step: "01",
            title: "Understand your real needs",
            desc: "We start by learning how your teams actually work and what truly moves your business forward.",
          },
          {
            step: "02",
            title: "Eliminate unnecessary complexity",
            desc: "Every extra step, confusing option, and hidden setting is removed so your team can focus on what matters.",
          },
          {
            step: "03",
            title: "Build smart, purposeful automation",
            desc: "Automation is added only where it saves time and improves outcomes — never for its own sake.",
          },
          {
            step: "04",
            title: "Grow seamlessly with you",
            desc: "As your business evolves, our platform adapts effortlessly — no painful migrations or costly rewrites.",
          },
        ],
        comment: "Max 4 steps. Admin can edit title & desc per step.",
      },

      customer_notice_title: {
        type: DataTypes.TEXT,
        defaultValue: "What our customers notice first",
      },

      customer_notice_list: {
        type: DataTypes.JSON,
        defaultValue: [
          "Teams get productive faster with minimal training",
          "Important tasks no longer slip through the cracks",
          "Information is always clear and accessible",
          "Leaders gain real insight instead of noise",
        ],
        comment: "section title. Max 4 bullet points. Editable content.",
      },

      // Long-term trust & CTA
      trust_title: {
        type: DataTypes.TEXT,
        defaultValue: "Built for long-term reliability",
      },
      trust_text: {
        type: DataTypes.TEXT,
        defaultValue:
          "We don’t chase short-term trends or quick wins. We focus on stability, security, and partnerships designed to last for years.",
      },
      trust_points: {
        type: DataTypes.JSON,
        defaultValue: [
          "99.9% uptime guarantee",
          "Enterprise-grade security",
          "Future-proof architecture",
        ],
        comment: "editable points displayed below trust text",
      },
      about_cta_text: {
        type: DataTypes.STRING,
        defaultValue:
          "If you’re ready to work smarter, not harder, let’s talk.",
      },
      about_cta_subtext: {
        type: DataTypes.STRING,
        defaultValue: "Contact Us Now. No pressure. No hard sell.",
        comment: "non editable",
      },

      // ==================== Our Most Recent Wins (Editable) ====================
      works_title: {
        type: DataTypes.STRING,
        defaultValue: "Our Most Recent Wins",
        comment: "non editable",
      },
      works_desc: {
        type: DataTypes.TEXT,
        defaultValue:
          "Browse examples of how our platform helps teams accelerate progress, reduce complexity, and create meaningful competitive advantages.",
      },
      works: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment:
          "Max 3 items: [{ title: string, description: string, image: string (uploaded path) }]",
      },

      // ==================== TESTIMONIALS (Editable) ====================
      testimonials_title: {
        type: DataTypes.TEXT,
        defaultValue: "Built for leaders who believe in real partnerships",
      },
      testimonials_subtext: {
        type: DataTypes.TEXT,
        defaultValue:
          "Genuine feedback from teams enhancing productivity, improving experiences, and thriving in a competitive world.",
      },
      testimonials: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment:
          "Array: [{ name, role, company, quote, image (uploaded path) }]",
      },

      // Stats (Admin can update numbers)
      stats_satisfaction: {
        type: DataTypes.INTEGER,
        defaultValue: 98,
      },
      stats_worldwide: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      stats_adoption: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}landing_page_setup`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  // Associations
  LandingPageSetup.associate = (models) => {
    LandingPageSetup.belongsTo(models.companySetup, {
      foreignKey: "org_id",
      as: "company",
    });
  };

  return LandingPageSetup;
};
