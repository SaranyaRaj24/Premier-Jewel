const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getCustomerOrder = async(req,res) => {
    try {
        const {customer_id}=req.body;
        const orderdetails = await prisma.customer_order.findMany({
            where : {customer_id},
            select : {
                item_name:true,
                description:true,
                weight:true,
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



const createCustomerOrder = async (req, res) => {
  try {
    const {
      customer_id,
      item_name,
      description,
      weight,
      due_date
    } = req.body;

   

    const order = await prisma.customer_order.create({
      data: {
        customer_id: parseInt(customer_id),
        item_name,
        description,
        weight: parseFloat(weight),
        due_date: due_date ? new Date(due_date) : null
      }
    });

    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map(file => ({
        customer_order_id: order.id,
        filename: file.filename
      }));

      await prisma.product_multiple_images.createMany({
        data: imageRecords
      });
    }

    return res.status(201).json({
      message: "Customer order created successfully",
      data: order
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create customer order" });
  }
};


module.exports = {getCustomerOrder,createCustomerOrder}