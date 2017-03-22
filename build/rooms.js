'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _reselect = require('reselect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var usersSelector = function usersSelector(state) {
  return state.users;
};
var roomsSelector = function roomsSelector(state) {
  return state.rooms;
};
var roomUserSelector = (0, _reselect.createSelector)(usersSelector, roomsSelector, function (users, rooms) {
  var detailRooms = {};
  console.log("**********");
  console.log(users);
  Object.keys(rooms).forEach(function (roomId) {
    detailRooms[roomId] = {};
    Object.keys(rooms[roomId]).forEach(function (userId) {
      detailRooms[roomId][userId] = users[userId];
    });
  });
  console.log(detailRooms);
  return detailRooms;
});

var Rooms = function () {
  function Rooms(store) {
    _classCallCheck(this, Rooms);

    this.store = store;
  }

  _createClass(Rooms, [{
    key: 'createRoom',
    value: function createRoom(roomId) {
      var store = this.store;
      store.dispatch({
        type: 'CREATE_ROOM',
        payload: {
          roomId: roomId
        }
      });
    }
  }, {
    key: 'addUser',
    value: function addUser(_ref) {
      var lineId = _ref.lineId,
          replyToken = _ref.replyToken,
          roomId = _ref.roomId,
          displayName = _ref.displayName;

      var store = this.store;
      store.dispatch({
        type: 'ADD_USER',
        payload: {
          user: {
            lineId: lineId,
            replyToken: replyToken,
            roomId: roomId,
            displayName: displayName
          }
        }
      });
    }

    // deleteRooms({ roomName }) {
    //   delete this.rooms[roomName]
    // }

    // checkUserExist(roomName, id) {
    //   return this.rooms[roomName].hasOwnProperty(id)
    // }

  }, {
    key: 'removeUser',
    value: function removeUser(_ref2) {
      var lineId = _ref2.lineId;

      var store = this.store;
      store.dispatch({
        type: 'REMOVE_USER',
        payload: {
          user: {
            lineId: lineId
          }
        }
      });
    }
  }, {
    key: 'broadCastAll',
    value: function broadCastAll(callback) {
      var state = this.store.getState();
      Object.keys(state.rooms).forEach(function (roomId) {
        Object.keys(state.rooms[roomId]).forEach(function (key) {
          var user = state.rooms[roomId][key];
          callback(user);
        });
      });
    }
  }, {
    key: 'broadCast',
    value: function broadCast(_ref3) {
      var roomId = _ref3.roomId,
          callback = _ref3.callback;

      var state = this.store.getState();
      Object.keys(state.rooms[roomId]).forEach(function (key) {
        var user = state.rooms[roomId][key];
        callback(user);
      });
    }
  }, {
    key: 'listHighscore',
    value: function listHighscore(_ref4) {
      var userId = _ref4.userId,
          callback = _ref4.callback;

      var state = this.store.getState();
      var detailRooms = roomUserSelector(state);
      console.log(state.users[userId]);
      if (!state.users[userId] || !state.users[userId].activeRoomId) {

        var high = Object.keys(state.users).map(function (key) {
          return state.users[key];
        }).sort(function (a, b) {
          return b.score - a.score;
        });

        callback({ user: { lineId: userId }, highscores: high });
        return;
      }
      var roomId = state.users[userId].activeRoomId;
      var highscores = Object.keys(detailRooms[roomId]).map(function (key) {
        var user = detailRooms[roomId][key];
        return user;
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      Object.keys(detailRooms[roomId]).forEach(function (key) {
        var user = detailRooms[roomId][key];
        callback({ user: user, highscores: highscores });
      });
    }
  }, {
    key: 'onlineUser',
    value: function onlineUser(_ref5) {
      var roomId = _ref5.roomId,
          callback = _ref5.callback;

      var state = this.store.getState();
      var detailRooms = roomUserSelector(state);
      var users = Object.keys(detailRooms[roomId]).map(function (key) {
        var user = detailRooms[roomId][key];
        return user;
      });
      callback({ users: users });
    }
  }, {
    key: 'checkUserExist',
    value: function checkUserExist(_ref6) {
      var lineId = _ref6.lineId;

      var state = this.store.getState();

      return state.users[lineId] && state.users[lineId].activeRoomId;
    }
  }, {
    key: 'syncScore',
    value: function syncScore(_ref7) {
      var database = _ref7.database;

      var state = this.store.getState();
      var user = state.users;
      console.log(user);
      database.ref('users/').set(user);
    }
  }, {
    key: 'syncReducer',
    value: function syncReducer(_ref8) {
      var database = _ref8.database;

      var store = this.store;
      var state = store.getState();
      var result = null;
      database.ref('users').once('value').then(function (snapshot) {
        result = snapshot.val();
        if (result) {
          store.dispatch({
            type: 'SYNC',
            payload: {
              users: result
            }
          });
        }
      });
    }
  }]);

  return Rooms;
}();

exports.default = Rooms;