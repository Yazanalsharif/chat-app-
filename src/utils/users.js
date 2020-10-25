const users = [];

const addUser = ({id, userName, room}) => {
    userName = userName.trim().toLowerCase();
    room = room.split(' ').join('').toLowerCase();
    
    //both userName and room required
    if(!room || !userName){
        return {
            error: 'both userName and Room is required'
        }
    }

    //find the userName in specific room 
    const isExist = users.find(user => {
        return user.room === room && user.userName === userName
    })

    //validate userName 
    if(isExist) {
        return {
            error : 'the userName is already exist in the same room'
        }
    }

    const user = {id, userName, room};
    users.push(user);

    return {user};
}

const removeUser = (id) => {

    const index = users.findIndex(user => user.id === id);
    //validate is Exist
    console.log(index)
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUsersInRoom = (room) => {
    room = room.split(' ').join('').toLowerCase();
    const usrs = users.filter(user => {
        return user.room === room;
    })
    return usrs
}

const getUser = (id) => {
    const user = users.find(user => id === user.id);
    return user;
}

module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}