const groups = [
  {
    name: 'step',
    id: '5555',
    memberNames: ['asna', 'thanya', 'ram'],
    members: [
      {
        userID: 'asna',
        fullName: 'Fathimathul Asna',
        src:
          'https://res.cloudinary.com/dzkeqw3qc/image/upload/v1600925421/myAvatar_3_urvkvu.png',
      },
      {
        userID: 'micheal',
        fullName: 'Micheal Desauza',
        src:
          'https://res.cloudinary.com/dzkeqw3qc/image/upload/v1600893457/myAvatar_2_h2oqj2.png',
      },
      {
        userID: 'ram',
        fullName: 'Ram jeevan',
        src:
          'https://res.cloudinary.com/dzkeqw3qc/image/upload/v1600893457/myAvatar_1_kputbe.png',
      },
    ],
  },
];

class Groups {
  constructor(db) {
    this.db = db;
    this.groups = groups;
  }

  getGroupsOf(userID) {
    return new Promise((resolve) => {
      const groupList = this.groups.filter((group) =>
        group.memberNames.includes(userID)
      );
      resolve({ groupList });
    });
  }

  getMembersOf(groupID) {
    return Promise.resolve({
      members: this.groups[0].members,
      groupName: groups[0].name,
      groupID: groups[0].id,
    });
  }
}

module.exports = { Groups };
