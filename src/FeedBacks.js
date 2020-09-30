class FeedBacks {
  constructor(db) {
    this.db = db;
  }

  getSentFeedBacks(userID) {
    return this.db.getFeedBacks(userID, 'sender');
  }

  getReceivedFeedBacks(userID) {
    return this.db.getFeedBacks(userID, 'recipient');
  }

  addFeedBack(userID, feedBack) {
    return this.db.addFeedBack({ ...feedBack, sender: userID });
  }
}

module.exports = { FeedBacks };
