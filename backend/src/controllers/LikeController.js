const Dev = require('../models/Dev');

module.exports = {
  async store(req, res) {
    const { user } = req.headers;
    const { devId } = req.params;

    const loggedDev = await Dev.findById(user);
    const targetDev = await Dev.findById(devId);

    if (!targetDev) {
      return res.status(400).json({ error: 'Dev not exists' });
    }

    loggedDev.likes.push(targetDev._id);

    await loggedDev.save();

    if (targetDev.likes.includes(loggedDev._id)) {
      const loggedSocket = req.connectedUsers[loggedDev._id];
      const targetSocket = req.connectedUsers[targetDev._id];

      loggedDev.matchs.push(targetDev._id);
      await loggedDev.save();

      targetDev.matchs.push(loggedDev._id);
      await targetDev.save();

      if (loggedSocket) {
        req.io.to(loggedSocket).emit('match', targetDev);
      }

      if (targetSocket) {
        req.io.to(targetSocket).emit('match', loggedDev);
      }
    }

    return res.json(loggedDev);
  },
};
