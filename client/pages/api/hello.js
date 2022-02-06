import handlers from "../../lib/mid";

export default async function handler(req, res) {
  await handlers(req, res);
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        res.status(200).json({ name: "Majid Ahmed" });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      try {
        res.status(200).json({ name: "Majid Ahmed" });
        /* create a new model in the database */
      } catch (error) {
        res.status(400).json(error.message);
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
