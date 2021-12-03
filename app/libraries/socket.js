const {Server}= require('socket.io')
const mongoose = require('mongoose')
const shortid = require('shortid')
const logger = require('./logger')
const events = require('events')
const eventEmitter = new events.EventEmitter()
const token = require('./token')
const check = require('./check')
const response = require('./responselib')
// const io = new Server({ })
const Chat = mongoose.model('Chat')

const { createServer } = require('http')
const express = require('express')
const app = express()
const httpServer =createServer(app)



let setServer = (server)=>{
    const io = new Server(server,{ allowEIO3: true})
     let allOnLineUsers = []
    // let io = Server.listen(server);

    let myIo = io.of('/chat')
    myIo.on('connection',(socket)=>{
        
        console.log('on connection-- emitting verify user')
        socket.emit('verifyUser','')
        // code to verify the user and make him online

        socket.on('set-user',(authToken)=>{
           
            token.verifyClaimWithoutSecret(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth err',{status : 500 , err : 'please provide vaild authToken'})
                }else{
                    console.log('user is verified...setting details')
                    let currentUser = user.data
                    socket.userId = currentUser.userId
                   
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`)

                    let userObj = {userId:currentUser.userId , fullName:fullName}
                    allOnLineUsers.push(userObj)
                    console.log(allOnLineUsers)

                    socket.room = 'chat'
                    socket.join(socket.room)
                    socket.to(socket.room).emit('online-user-list',allOnLineUsers)
                    
                }
            })
        })

        socket.on('disconnect',()=>{
            console.log('user is disconnected')
            console.log(socket.userId)
            
            var removeIndex = allOnLineUsers.map(function(user) {return user.userId}).indexOf(socket.userId)
            allOnLineUsers.splice(removeIndex,1)
            console.log(allOnLineUsers)

            socket.to(socket.room).emit('online-user-list',allOnLineUsers)
            socket.leave(socket.room)
           
        })


        socket.on('chat-message',(data)=>{
            console.log('socket chat msg called')
            console.log(data)
            data['chatId']= shortid.generate()
            console.log(data)
            setTimeout(function(){
                eventEmitter.emit('save-chat',data)
            },2000)
            myIo.emit(data.receiverId,data)
        })

        socket.on('typing',(fullName)=>{
            socket.to(socket.room).emit('typing',fullName)
        })
     },(err)=>{
         console.log(err,'er...')
     })
}


// database operations are kept outside of socket.io code.

// saving chats to database.
eventEmitter.on('save-chat',(data)=>{
    
    let newChat = new Chat({
        chatId : data.chatId,
        senderName:data.senderName,
        senderId:data.senderId,
        receiverName: data.receiverName,
        receiverId : data.receiverId,
        message : data.message,
        chatRoom : data.chatRoom,
        createdOn : data.createdOn

    })
    newChat.save((err,result)=>{
        if(err){
            console.log(`error occured : ${err}`)
        }else if(result == undefined || result == null || result == " "){
            console.log('chat is not saved')
        }else {
            console.log('chat saved')
            console.log(result)
        }
    })
})

module.exports={
    setServer:setServer
}