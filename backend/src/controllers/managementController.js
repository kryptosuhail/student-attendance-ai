export const getManagementSummary = (req, res) => {
  res.json({
    message: "Management summary API working",
    user: req.user
  });
};
