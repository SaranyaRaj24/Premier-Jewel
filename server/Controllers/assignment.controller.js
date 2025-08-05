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
        deliveries: {
          orderBy: { createdAt: "asc" },
        },
        received: {
          orderBy: { createdAt: "asc" },
        },
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
  console.log("created items", req.body);
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
          finalPurity = item.finalPurity ?? parsedWastageValue;
          wastageTypeEnum = "TOUCH";
          break;
        case "%":
          finalPurity =
            item.finalPurity ??
            netWeight + (parsedWastageValue / 100) * netWeight;
          wastageTypeEnum = "PERCENTAGE";
          break;
        case "+":
          finalPurity = item.finalPurity ?? netWeight + parsedWastageValue;
          wastageTypeEnum = "FIXED";
          break;
        default:
          console.error(
            `Backend: Invalid wastage type received: ${item.wastageType}`
          );
          wastageTypeEnum = "TOUCH";
          finalPurity = item.finalPurity ?? parsedWastageValue;
      }

      try {
        console.log("Passed final purity", finalPurity);
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
        console.log(" item delivery testtttttt:", entry);
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
const createReceivedSection = async (req, res) => {
  try {
    console.log("Received details", req.body);
    const { weight, touch, goldsmithId, jobcardId } = req.body;
    if (!weight || !touch || !goldsmithId || !jobcardId) {
      return res.status(400).json({
        success: false,
        error:
          "All fields (weight, touch, goldsmithId, jobcardId) are required",
      });
    }
    const weightNum = parseFloat(weight);
    const touchNum = parseFloat(touch);
    const goldsmithIdNum = parseInt(goldsmithId);
    const jobcardIdNum = parseInt(jobcardId);

    if (
      isNaN(weightNum) ||
      isNaN(touchNum) ||
      isNaN(goldsmithIdNum) ||
      isNaN(jobcardIdNum)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid numeric values provided",
      });
    }
    const purity = (weightNum * touchNum) / 100;

    const jobcardExists = await prisma.jobcard.findUnique({
      where: { id: jobcardIdNum },
    });

    if (!jobcardExists) {
      return res.status(404).json({
        success: false,
        error: "Jobcard not found",
      });
    }
    const goldsmithExists = await prisma.goldsmith.findUnique({
      where: { id: goldsmithIdNum },
    });

    if (!goldsmithExists) {
      return res.status(404).json({
        success: false,
        error: "Goldsmith not found",
      });
    }
    const receivedSection = await prisma.receivedsection.create({
      data: {
        weight: weightNum,
        touch: touchNum,
        purity: purity,
        jobcard: { connect: { id: jobcardIdNum } },
        goldsmith: { connect: { id: goldsmithIdNum } },
      },
      include: {
        jobcard: true,
        goldsmith: true,
      },
    });

    const existingBalance = await prisma.balances.findFirst({
      where: { goldsmithId: goldsmithIdNum },
    });

    if (existingBalance) {
      await prisma.balances.update({
        where: { id: existingBalance.id },
        data: {
          totalReceivedWeight: { increment: weightNum },
          totalReceivedPurity: { increment: purity },
          totalReceivedTouch: { increment: touchNum },
        },
      });
    } else {
      await prisma.balances.create({
        data: {
          goldsmithId: goldsmithIdNum,
          totalReceivedWeight: weightNum,
          totalReceivedPurity: purity,
          totalReceivedTouch: touchNum,
          totalDeliveries: 0,
          totalItemWeight: 0,
          totalNetWeight: 0,
          totalPurity: 0,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: receivedSection,
      message: "Received section created successfully",
    });
  } catch (error) {
    console.error("Error creating received section:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "This jobcard already has a received section record",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  createJobcard,
  getJobcardsByGoldsmithId,
  createItemDeliveries,
  createReceivedSection,
};
