const socket = io('http://localhost:3000/chat')
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InEycmFZZVA4OSIsImlhdCI6MTYzODUyMDA3ODAxOCwiZXhwIjoxNjM4NjA2NDc4LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6ImU1WGlkMV9SXyIsImZpcnN0TmFtZSI6InNhbmp1IiwibGFzdE5hbWUiOiJyb24iLCJlbWFpbCI6InNhbkBnLmNvbSIsIm1vYmlsZU51bWJlciI6ODg4ODh9fQ.RKQ2n7BgN-T1KPN7LRLWWuMDXZSYDHlYFticngcEZ4w"
const userId = "e5Xid1_R_"

let chatMessage = {
    createdOn : Date.now(),
    receiverId : 'e36nHi-Ue',
    receiverName : 'Rohini ',
    senderId : userId,
    senderName : 'Sonu'

}

let chatSocket = () =>{
    socket.on('verifyUser',(data)=>{
        console.log('socket trying to verify user')
        socket.emit('set-user',authToken)
    })

    socket.on(userId ,(data)=>{
        console.log('you received a message from'+data.senderName)
        console.log(data.message)
    })
   

    socket.on('online-user-list',(data)=>{
        console.log('online user list is updated')
        console.log(data)
    })

     
    socket.on('typing',(data)=>{
        console.log(data+'is typing')
    })

    $('#send').on('click',()=>{
        let messageText = $('#messageToSend').val()
        chatMessage.message = messageText
        socket.emit('chat-message',chatMessage)
    })

    $('#messageToSend').on('keyPress',()=>{
        socket.emit('typing','Rohini ')
    })

}
chatSocket()