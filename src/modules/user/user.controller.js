import { findUserById } from "./user.model.js";

export async function getUserByIdHandler(req, res) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user id" });

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user" });
  }
}

export async function getCurrentUserHandler(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user" });
  }
}
