
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createJobcard = async (req, res) => {
  try {
    const {
      goldsmithId,
      description,
      weight,
      touch,
      purity,
      openingBalance,
      totalPurity,
      totalBalance,
    } = req.body;

    if (
      !goldsmithId ||
      weight == null ||
      touch == null ||
      purity == null ||
      openingBalance == null ||
      totalPurity == null ||
      totalBalance == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const jobcard = await prisma.jobcard.create({
      data: {
        goldsmithId: parseInt(goldsmithId),
        description,
        weight,
        touch,
        purity,
      },
    });

    const totalRecord = await prisma.total.create({
      data: {
        goldsmithId: parseInt(goldsmithId),
        openingBalance,
        totalPurity,
        totalBalance,
      },
    });

    return res.status(201).json({
      message: "Jobcard and Total saved successfully",
      jobcard,
      totalRecord,
    });
  } catch (error) {
    console.error("Error creating jobcard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobcardsByGoldsmithId = async (req, res) => {
  try {
    const { goldsmithId } = req.params;

    const jobcards = await prisma.jobcard.findMany({
      where: {
        goldsmithId: parseInt(goldsmithId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.total.findMany({
      where: {
        goldsmithId: parseInt(goldsmithId),
      },
    });

    return res.status(200).json({
      success: true,
      jobcards,
      total,
    });
  } catch (error) {
    console.error("Error fetching jobcards:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const createItemDeliveries = async (req, res) => {
  try {
    const { goldsmithId, jobcardId, items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array." });
    }

    const createdItems = [];

    for (const item of items) {
      const parsedItemWeight = parseFloat(item.itemWeight || 0);
      const parsedStoneWeight = parseFloat(item.stoneWeight || 0);
      const parsedWastageValue = parseFloat(item.wastageValue || 0);
      const netWeight = parsedItemWeight - parsedStoneWeight;

      let finalPurity;
      let wastageTypeEnum;

      switch (item.wastageType) {
        case "Touch":
          finalPurity = parsedWastageValue;
          wastageTypeEnum = "TOUCH";
          break;
        case "%":
          finalPurity = netWeight + (parsedWastageValue / 100) * netWeight;
          wastageTypeEnum = "PERCENTAGE";
          break;
        case "+":
          finalPurity = netWeight + parsedWastageValue;
          wastageTypeEnum = "FIXED";
          break;
        default:
          throw new Error(`Invalid wastage type: ${item.wastageType}`);
      }

      const entry = await prisma.itemDelivery.create({
        data: {
          itemName: item.itemName,
          itemWeight: parsedItemWeight,
          type: item.type || "Jewelry",
          stoneWeight: parsedStoneWeight,
          netWeight,
          wastageType: wastageTypeEnum,
          wastageValue: parsedWastageValue,
          finalPurity,
          jobcardId,
          goldsmithId,
        },
      });

      createdItems.push(entry);
    }

    res.status(201).json(createdItems);
  } catch (error) {
    console.error("Error in createItemDeliveries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createJobcard,
  getJobcardsByGoldsmithId,
  createItemDeliveries,
};
