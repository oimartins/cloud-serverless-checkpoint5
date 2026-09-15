exports.notifyOrder = (req, res) => {

  console.log(JSON.stringify({
    severity: "INFO",
    service: "notifyOrder",
    action: "notification_sent",
    orderId: req.body.orderId,
    timestamp: new Date().toISOString()
  }));

  return res.status(200).json({
    notification: "enviada"
  });
};