exports.validateOrder = (req, res) => {

  const order = req.body;

  console.log(JSON.stringify({
    severity: "INFO",
    service: "validateOrder",
    action: "validation_started",
    orderId: order.id || null,
    timestamp: new Date().toISOString()
  }));

  if (!order.id) {

    console.error(JSON.stringify({
      severity: "ERROR",
      service: "validateOrder",
      action: "validation_failed",
      reason: "missing_order_id",
      timestamp: new Date().toISOString()
    }));

    return res.status(400).json({
      error: "Pedido sem ID"
    });
  }

  console.log(JSON.stringify({
    severity: "INFO",
    service: "validateOrder",
    action: "validation_success",
    orderId: order.id,
    timestamp: new Date().toISOString()
  }));

  return res.status(200).json({
    valid: true,
    orderId: order.id
  });
};