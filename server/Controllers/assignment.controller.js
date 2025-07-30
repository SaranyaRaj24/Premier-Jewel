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
      return res.status(400).json({
        message: "Missing required fields for jobcard or total record.",
      });
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
      message: "Jobcard and Total record created successfully",
      jobcard,
      totalRecord,
    });
  } catch (error) {
    console.error("Error creating jobcard:", error);
    res.status(500).json({
      message: "Server error during jobcard creation",
      error: error.message,
    });
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
      include: {
        deliveries: true,
      },
    });

    const totalRecords = await prisma.total.findMany({
      where: {
        goldsmithId: parseInt(goldsmithId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      jobcards,
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching jobcards:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error during jobcard fetch",
    });
  }
};
const createItemDeliveries = async (req, res) => {
  try {
    const { goldsmithId, jobcardId, items } = req.body;

    if (!Array.isArray(items)) {
      console.error("Backend: Items is not an array!");
      return res.status(400).json({ error: "Items must be an array." });
    }

    if (!jobcardId) {
      console.error("Backend: jobcardId is missing for item deliveries!");
      return res
        .status(400)
        .json({ error: "jobcardId is required for item deliveries." });
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
          console.error(
            `Backend: Invalid wastage type received: ${item.wastageType}`
          );
          wastageTypeEnum = "TOUCH";
          finalPurity = parsedWastageValue;
      }

      try {
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
            jobcardId: parseInt(jobcardId),
            goldsmithId: parseInt(goldsmithId),
          },
        });
        console.log(
          "Backend: Successfully created item delivery:",
          entry.id,
          entry.itemName
        );
        createdItems.push(entry);
      } catch (dbError) {
        console.error(
          `Backend: Database error creating item delivery for item ${item.itemName}:`,
          dbError
        );
      }
    }

    if (createdItems.length === 0 && items.length > 0) {
      return res.status(500).json({
        error:
          "No items were created, check backend logs for individual item errors.",
      });
    }

    res.status(201).json(createdItems);
  } catch (error) {
    console.error("Backend: Error in createItemDeliveries:", error);
    res
      .status(500)
      .json({ error: "Internal server error during item delivery creation" });
  }
};

module.exports = {
  createJobcard,
  getJobcardsByGoldsmithId,
  createItemDeliveries,
};
