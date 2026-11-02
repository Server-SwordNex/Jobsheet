class PricingPlanModel {
  constructor(data = {}) {
    this.id = data.id || "";

    this.name = data.name || "";

    this.billingType =
      data.billingType || "monthly";

    this.price = Number(
      data.price || 0
    );

    this.tagLine =
      data.tagLine || "";

    this.jobSheetLimit = Number(
      data.jobSheetLimit || 0
    );

    this.staffLimit = Number(
      data.staffLimit || 0
    );

    this.subuserLimit = Number(
      data.subuserLimit || 0
    );

    this.popular = Boolean(
      data.popular
    );

    this.features =
      Array.isArray(data.features)
        ? data.features
        : [];

    this.createdAt =
      data.createdAt || new Date();

    this.updatedAt =
      data.updatedAt || null;
  }

  toFirestore() {
    return {
      id: this.id,

      name: this.name,

      billingType:
        this.billingType,

      price: this.price,

      tagLine: this.tagLine,

      jobSheetLimit:
        this.jobSheetLimit,

      staffLimit:
        this.staffLimit,

      subuserLimit:
        this.subuserLimit,

      popular: this.popular,

      features: this.features,

      createdAt: this.createdAt,

      updatedAt: this.updatedAt,
    };
  }
}

export default PricingPlanModel;