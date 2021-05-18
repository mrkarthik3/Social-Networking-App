// const { ObjectID } = require('bson')

const usersCollection = require('../db').db().collection('users')
const followsCollection = require('../db').db().collection('follows')
const ObjectID = require('mongodb').ObjectID

let Follow = function(followedUsername, authorId) {
    // authorId => _id of the current logged in User
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function () {
    if(typeof(this.followedUsername) != "string") {
        this.followedUsername = ""
        // overwrite malicious username value
    }
}

Follow.prototype.validate = async function (action) {
    // followedUsername must exist in database
    let followedAccount = await usersCollection.findOne({username: this.followedUsername})
    if(followedAccount) {
        this.followedId = followedAccount._id
        // If there is a matching username, then save the _id 
    } else {
        this.errors.push("You cannot follow a user that does not exist.")
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})

    if(action == "create"){
        if(doesFollowAlreadyExist) {
            // If you are already following the 
            this.errors.push("You are already following this user.")
        }
    }
    if(action == "delete"){
        if(!doesFollowAlreadyExist) {
            // 
            this.errors.push("You can't stop following someone you do not already follow.")
        }
    }
    // should not be able to follow yourself
    if(this.followedId.equals(this.authorId)) {
        this.errors.push("You cannot follow yourself.")
    }
}

Follow.prototype.create = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("create")

        if(!this.errors.length) {
            // If there are no errors, then store the follow details
            // into the database
            followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })
}


Follow.prototype.delete = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("delete")

        if(!this.errors.length) {
            // If there are no errors, then delete the follow details
            // from the database
            followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })

}

Follow.isVisitorFollowing = async function (followedId, visitorId) {
    let followDoc = await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})

    if(followDoc) {
        return true
    } else {
        return false
    }
    
}




module.exports = Follow