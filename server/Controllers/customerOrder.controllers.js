const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getCustomerOrder = async(req,res) => {
    try {
        const {customer_id}=req.params;
        const orderdetails = await prisma.customer_order.findMany({
            where : {customer_id : parseInt(customer_id)},
            select : {
                id:true,
                item_name:true,
                description:true,
                weight:true,
                status:true,
                due_date:true,
                productImages : {
                    select : {
                        filename:true
                    }
                }
            }
        })
        res.status(200).json({message : "Success",orderdetails})
    } catch (error) {
        console.log(error)
        res.status(404).json({error : "No order details fetched"})

    }
}



// const createCustomerOrder = async (req, res) => {
//   try {
//     const {
//       customer_id,
//       item_name,
//       description,
//       weight,
//       due_date
//     } = req.body;

   

//     const order = await prisma.customer_order.create({
//       data: {
//         customer_id: parseInt(customer_id),
//         item_name,
//         description,
//         weight: parseFloat(weight),
//         due_date: due_date ? new Date(due_date) : null
//       }
//     });

//     if (req.files && req.files.length > 0) {
//       const imageRecords = req.files.map(file => ({
//         customer_order_id: order.id,
//         filename: file.filename
//       }));

//       await prisma.product_multiple_images.createMany({
//         data: imageRecords
//       });
//     }

//     return res.status(201).json({
//       message: "Customer order created successfully",
//       data: order
//     });

//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res.status(500).json({ error: "Failed to create customer order" });
//   }
// };

const createCustomerOrder = async (req, res) => {
  try {
    const {
      customer_id,
      item_name,
      description,
      weight,
      due_date
    } = req.body;

    const names = Array.isArray(item_name) ? item_name : [item_name];
    const descriptions = Array.isArray(description) ? description : [description];
    const weights = Array.isArray(weight) ? weight : [weight];
    const dueDates = Array.isArray(due_date) ? due_date : [due_date];

    const createdOrders = [];

    for (let i = 0; i < names.length; i++) {
      const dueDate = new Date(dueDates[i]);
      if (isNaN(dueDate)) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const order = await prisma.customer_order.create({
        data: {
          customer_id: parseInt(customer_id),
          item_name: names[i],
          description: descriptions[i],
          weight: parseFloat(weights[i]),
          due_date: dueDate
        }
      });

      const filesForThisItem = (req.files || []).filter(file =>
        file.fieldname === `images_${i}[]`
      );

      if (filesForThisItem.length > 0) {
        const imageRecords = filesForThisItem.map(file => ({
          customer_order_id: order.id,
          filename: file.filename
        }));

        await prisma.product_multiple_images.createMany({
          data: imageRecords
        });
      }

      createdOrders.push(order);
    }

    return res.status(201).json({
      message: "Customer orders created successfully",
      data: createdOrders
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create customer order" });
  }
};


// const updateCustomerOrder = async (req, res) => {
//   try {
//     const orderId = parseInt(req.params?.orderId?.toString());
    
//     const {
//       item_name,
//       description,
//       weight,
//       due_date,
//       status
//     } = req.body;

//     const dataToUpdate = {};

//     if (item_name !== undefined) dataToUpdate.item_name = item_name;
//     if (description !== undefined) dataToUpdate.description = description;
//     if (weight !== undefined) dataToUpdate.weight = parseFloat(weight);
//     if (due_date !== undefined) {
//       const parsedDate = new Date(due_date);
//       if (isNaN(parsedDate.getTime())) {
//         return res.status(400).json({ error: "Invalid due_date format" });
//       }
//       dataToUpdate.due_date = parsedDate;
//     }
//     if (status !== undefined) dataToUpdate.status = status;

//     const updatedOrder = await prisma.customer_order.update({
//       where: { id: orderId },
//       data: dataToUpdate
//     });

//     if (req.files && req.files.length > 0) {
//       const imageRecords = req.files.map(file => ({
//         customer_order_id: orderId,
//         filename: file.filename
//       }));

//       await prisma.product_multiple_images.createMany({
//         data: imageRecords
//       });
//     }

//     return res.status(200).json({
//       message: "Order updated successfully",
//       data: updatedOrder
//     });

//   } catch (error) {
//     console.error("Error updating order:", error);
//     return res.status(500).json({ error: "Failed to update order" });
//   }
// };

const updateCustomerOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params?.orderId?.toString());

    const {
      item_name,
      description,
      weight,
      due_date,
      status,
    } = req.body;

    const dataToUpdate = {};

    if (item_name !== undefined) dataToUpdate.item_name = item_name;
    if (description !== undefined) dataToUpdate.description = description;
    if (weight !== undefined) dataToUpdate.weight = parseFloat(weight);
    if (due_date !== undefined) {
      const parsedDate = new Date(due_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid due_date format" });
      }
      dataToUpdate.due_date = parsedDate;
    }
    if (status !== undefined) dataToUpdate.status = status;

    const updatedOrder = await prisma.customer_order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    if (req.files && req.files.length > 0) {
      await prisma.product_multiple_images.deleteMany({
        where: { customer_order_id: orderId },
      });

      const imageRecords = req.files.map((file) => ({
        customer_order_id: orderId,
        filename: file.filename,
      }));

      await prisma.product_multiple_images.createMany({
        data: imageRecords,
      });
    }

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
};


const deleteCustomerOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params?.orderId?.toString());
    

    await prisma.product_multiple_images.deleteMany({
      where: { customer_order_id: orderId }
    });

    const deletedOrder = await prisma.customer_order.delete({
      where: { id: orderId }
    });

    res.status(200).json({ message: "Successfully deleted", data: deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};


module.exports = {getCustomerOrder,createCustomerOrder,updateCustomerOrder,deleteCustomerOrder}