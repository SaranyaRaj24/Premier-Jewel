const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createBullionPurchase = async (req, res) => {
  const {
    bullionId,
    grams,
    touch,
    purity,
    rate,
    amount,
    balance,
    givenDetails = [],
  } = req.body;

  try {
    const purchase = await prisma.bullionPurchase.create({
      data: {
        bullionId,
        grams,
        touch,
        purity,
        rate,
        amount,
        balance,
        givenDetails: {
          create: givenDetails.map((entry) => ({
            amount: entry.amount,
            grams: entry.grams,
          })),
        },
      },
      include: {
        bullion: true,
        givenDetails: true,
      },
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Failed to create purchase" });
  }
};
exports.updateGivenDetailsOnly = async (req, res) => {
  const { id } = req.params;
  const { givenDetails } = req.body;

  if (!Array.isArray(givenDetails) || givenDetails.length === 0) {
    return res
      .status(400)
      .json({ error: "givenDetails must be a non-empty array" });
  }

  try {
    await prisma.givenDetail.deleteMany({
      where: { purchaseId: parseInt(id) },
    });

    const updated = await prisma.bullionPurchase.update({
      where: { id: parseInt(id) },
      data: {
        givenDetails: {
          create: givenDetails.map((entry) => ({
            amount: entry.amount,
            grams: entry.grams,
          })),
        },
      },
      include: {
        bullion: true,
        givenDetails: true,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Given Details Error:", error);
    res.status(500).json({ error: "Failed to update given details" });
  }
};
exports.getAllBullionPurchases = async (req, res) => {
  try {
    const purchases = await prisma.bullionPurchase.findMany({
      include: {
        bullion: true,
        givenDetails: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Get All Error:", error);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};

exports.deleteBullionPurchase = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.bullionPurchase.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Bullion purchase deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      error: error.message || "Failed to delete bullion purchase",
    });
  }
};
