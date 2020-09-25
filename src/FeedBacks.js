const feedBacks = [
  {
    nameToShow: 'Shashi kumar',
    recipient: 'ram',
    relatedTo: 'Teachers day presentation',
    sender: 'thanya',
    suggestion: 'your presentation was awsome',
    time: '2020-09-24T06:20:46.266Z',
  },
  {
    nameToShow: 'Anonymous',
    recipient: 'thanya',
    relatedTo: 'new year Party',
    sender: 'micheal',
    suggestion: 'next time give invitation little earlier',
    time: '2020-01-2T06:20:46.266Z',
  },
];

class FeedBacks {
  constructor(db) {
    this.db = db;
    this.feedBacks = feedBacks;
  }

  has(userID) {
    return this.db.getUsersList().then((usersList) => {
      const hasUser = usersList.find((user) => user.id === userID);
      return hasUser ? Promise.resolve(true) : Promise.resolve(false);
    });
  }

  getSentFeedBacks(userID) {
    return new Promise((resolve) => {
      const sent = this.feedBacks.filter(
        (feedBack) => feedBack.sender === userID
      );
      resolve(sent);
    });
  }

  getReceivedFeedBacks(userID) {
    return new Promise((resolve) => {
      const received = this.feedBacks.filter(
        (feedBack) => feedBack.recipient === userID
      );
      resolve(received);
    });
  }

  addFeedBack(userID, feedBack) {
    const { nameToShow, recipient, relatedTo, suggestion } = feedBack;
    this.feedBacks.push({
      nameToShow,
      recipient,
      relatedTo,
      suggestion,
      sender: userID,
      time: new Date(),
      id: FeedBacks.length,
    });
    return new Promise((resolve) => resolve({ added: true }));
  }
}

module.exports = { FeedBacks };
