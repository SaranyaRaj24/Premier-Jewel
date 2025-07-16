const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAssignment = async (req, res) => {
  const {
    title,
    description,
    artisanId,
    openingBalance,
    totalInputPurity,
    totalBalance,
    metalInputs,
  } = req.body;

  console.log("Received request body for createAssignment:", req.body);

  try {
    if (!artisanId) {
      return res.status(400).json({ error: "artisanId is required." });
    }
    if (!metalInputs || metalInputs.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one metal input is required." });
    }

    const assignment = await prisma.workAssignment.create({
      data: {
        title,
        description,
        artisan: {
          connect: { id: artisanId },
        },
        openingBalance,
        totalInputPurity,
        totalBalance,

        metalInputs: {
          create: metalInputs.map((input) => ({
            weight: parseFloat(input.weight || 0),
            touch: parseFloat(input.touch || 0),
            purity: parseFloat(input.purity || 0),
          })),
        },
      },
      include: { metalInputs: true },
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Error creating assignment:", err);
    if (err.code === "P2025") {
      res
        .status(404)
        .json({ error: "Goldsmith (artisan) not found with the provided ID." });
    } else if (err.name === "PrismaClientValidationError") {
      res.status(400).json({ error: "Validation error: " + err.message });
    } else {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  }
};

const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const assignmentId = parseInt(id);

  const {
    netWeight,
    itemTouch,
    adjustmentType,
    finalPurity,
    balanceDirection,
    balanceAmount,
    finishedProducts: incomingFinishedProducts,
    materialLosses: incomingMaterialLosses,
    wastage,
    description,
    metalInputs: incomingMetalInputs,
  } = req.body;

  try {
    const existingAssignment = await prisma.workAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        finishedProducts: true,
        materialLosses: true,
        metalInputs: true,
      },
    });

    if (!existingAssignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    const existingFinishedProductIds = new Set(
      existingAssignment.finishedProducts.map((p) => p.id)
    );
    const incomingFinishedProductIds = new Set(
      incomingFinishedProducts.filter((p) => p.id).map((p) => p.id)
    );

    const productsToCreate = incomingFinishedProducts.filter((p) => !p.id);
    const productsToUpdate = incomingFinishedProducts.filter(
      (p) => p.id && existingFinishedProductIds.has(p.id)
    );
    const productsToDelete = existingAssignment.finishedProducts.filter(
      (p) => !incomingFinishedProductIds.has(p.id)
    );
    const existingMaterialLossIds = new Set(
      existingAssignment.materialLosses.map((l) => l.id)
    );
    const incomingMaterialLossIds = new Set(
      incomingMaterialLosses.filter((l) => l.id).map((l) => l.id)
    );

    const lossesToCreate = incomingMaterialLosses.filter((l) => !l.id);
    const lossesToUpdate = incomingMaterialLosses.filter(
      (l) => l.id && existingMaterialLossIds.has(l.id)
    );
    const lossesToDelete = existingAssignment.materialLosses.filter(
      (l) => !incomingMaterialLossIds.has(l.id)
    );
    const existingMetalInputIds = new Set(
      existingAssignment.metalInputs.map((m) => m.id)
    );
    const incomingMetalInputIds = new Set(
      incomingMetalInputs.filter((m) => m.id).map((m) => m.id)
    );

    const metalInputsToCreate = incomingMetalInputs.filter((m) => !m.id);
    const metalInputsToUpdate = incomingMetalInputs.filter(
      (m) => m.id && existingMetalInputIds.has(m.id)
    );
    const metalInputsToDelete = existingAssignment.metalInputs.filter(
      (m) => !incomingMetalInputIds.has(m.id)
    );

    const result = await prisma.$transaction(async (prisma) => {
      const updatedAssignment = await prisma.workAssignment.update({
        where: { id: assignmentId },
        data: {
          netWeight,
          itemTouch,
          adjustmentType,
          finalPurity,
          balanceDirection,
          balanceAmount: parseFloat(balanceAmount || 0),
          wastage: parseFloat(wastage || 0),
          description: description,
        },
      });

      if (productsToDelete.length > 0) {
        await prisma.finishedProduct.deleteMany({
          where: {
            id: { in: productsToDelete.map((p) => p.id) },
          },
        });
      }

      for (const product of productsToUpdate) {
        await prisma.finishedProduct.update({
          where: { id: product.id },
          data: {
            weight: parseFloat(product.weight || 0),
            itemType: product.itemType,
          },
        });
      }
      if (productsToCreate.length > 0) {
        await prisma.finishedProduct.createMany({
          data: productsToCreate.map((product) => ({
            assignmentId: assignmentId,
            weight: parseFloat(product.weight || 0),
            itemType: product.itemType,
          })),
        });
      }
      if (lossesToDelete.length > 0) {
        await prisma.materialLoss.deleteMany({
          where: {
            id: { in: lossesToDelete.map((l) => l.id) },
          },
        });
      }
      for (const loss of lossesToUpdate) {
        await prisma.materialLoss.update({
          where: { id: loss.id },
          data: {
            type: loss.type,
            customType: loss.customType,
            weight: parseFloat(loss.weight || 0),
          },
        });
      }
      if (lossesToCreate.length > 0) {
        await prisma.materialLoss.createMany({
          data: lossesToCreate.map((loss) => ({
            assignmentId: assignmentId,
            type: loss.type,
            customType: loss.customType,
            weight: parseFloat(loss.weight || 0),
          })),
        });
      }
      if (metalInputsToDelete.length > 0) {
        await prisma.metalInput.deleteMany({
          where: {
            id: { in: metalInputsToDelete.map((m) => m.id) },
          },
        });
      }
      for (const metalInput of metalInputsToUpdate) {
        await prisma.metalInput.update({
          where: { id: metalInput.id },
          data: {
            weight: parseFloat(metalInput.weight || 0),
            touch: parseFloat(metalInput.touch || 0),
            purity: parseFloat(metalInput.purity || 0),
          },
        });
      }
      if (metalInputsToCreate.length > 0) {
        await prisma.metalInput.createMany({
          data: metalInputsToCreate.map((metalInput) => ({
            assignmentId: assignmentId,
            weight: parseFloat(metalInput.weight || 0),
            touch: parseFloat(metalInput.touch || 0),
            purity: parseFloat(metalInput.purity || 0),
          })),
        });
      }
      const fullyUpdatedAssignment = await prisma.workAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          artisan: true,
          metalInputs: true,
          finishedProducts: true,
          materialLosses: true,
        },
      });

      return fullyUpdatedAssignment;
    });

    res.json(result);
  } catch (err) {
    console.error("Error updating assignment:", err);
    if (err.name === "PrismaClientValidationError") {
      res.status(400).json({ error: "Validation error: " + err.message });
    } else if (err.code === "P2025") {
      res.status(404).json({ error: "Record to update not found." });
    } else {
      res
        .status(500)
        .json({ error: "Failed to update assignment", details: err.message });
    }
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await prisma.workAssignment.findMany({
      include: {
        artisan: true,
        metalInputs: true,
        finishedProducts: true,
        materialLosses: true,
      },
    });
    res.json(assignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};
const getAssignmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await prisma.workAssignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        artisan: true,
        metalInputs: true,
        finishedProducts: true,
        materialLosses: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Error fetching assignment by ID:", err);
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
};
const getAssignmentsByArtisan = async (req, res) => {
  const { artisanId } = req.params;
  try {
    const assignments = await prisma.workAssignment.findMany({
      where: {
        artisanId: parseInt(artisanId),
      },
      include: {
        artisan: true,
        metalInputs: true,
        finishedProducts: true,
        materialLosses: true,
      },
    });

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching artisan assignments:", err);
    res.status(500).json({ error: "Failed to fetch artisan assignments" });
  }
};
const deleteAssignment = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.finishedProduct.deleteMany({
      where: { assignmentId: parseInt(id) },
    });
    await prisma.materialLoss.deleteMany({
      where: { assignmentId: parseInt(id) },
    });
    await prisma.metalInput.deleteMany({
      where: { assignmentId: parseInt(id) },
    });

    const deletedAssignment = await prisma.workAssignment.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      message: "Assignment deleted successfully",
      deletedAssignment,
    });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    if (err.code === "P2025") {
      res.status(404).json({ error: "Assignment not found." });
    } else {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  }
};
const getArtisanLastBalance = async (req, res) => {
  const { artisanId } = req.params;

  try {
    const lastAssignment = await prisma.workAssignment.findFirst({
      where: {
        artisanId: parseInt(artisanId),
      },
      orderBy: {
        createdAt: "desc", 
      },
      select: {
        balanceAmount: true,
        balanceDirection: true,
      },
    });

    if (!lastAssignment) {
      return res
        .status(200)
        .json({ balanceAmount: 0.0, balanceDirection: "Goldsmith" }); 
    }

    res.status(200).json({
      balanceAmount: lastAssignment.balanceAmount,
      balanceDirection: lastAssignment.balanceDirection,
    });
  } catch (err) {
    console.error("Error fetching goldsmith last balance:", err);
    res.status(500).json({ error: "Failed to fetch goldsmith last balance" });
  }
};
module.exports = {
  createAssignment,
  updateAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentsByArtisan,
  deleteAssignment,
  getArtisanLastBalance,
};
