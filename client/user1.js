

const socket =io('http://localhost:3000/chat')
const authToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6ImRTYlRucGZWdCIsImlhdCI6MTYzODAyMjkzMzA1NCwiZXhwIjoxNjM4MTA5MzMzLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6ImUzNm5IaS1VZSIsImZpcnN0TmFtZSI6IlJvaGluaSIsImxhc3ROYW1lIjoiUmFqdSIsImVtYWlsIjoicm9uQGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6NTU1NjY1NjV9fQ.5GXw9BiIa5qyXP97Vr_b3R17_eut6cugueevQd0-Msk"
const userId = "e36nHi-Ue"

let chatMessage = {
    createdOn : Date.now(),
    receiverId : "e5Xid1_R_",
    receiverName : 'sonu',
    senderId : userId,
    senderName : 'Rohini '
}

let chatSocket = () =>{
    socket.on('verifyUser',(data)=>{
        console.log('socket trying to verifying user')
        socket.emit('set-user',authToken)
    })
    socket.on(userId , (data)=>{
        console.log('You recevied a message from '+data.senderName)
        console.log(data.message)
    })
    socket.on('online-user-list',(data)=>{
        console.log('Online users list is updated')
        console.log(data)
    })
    socket.on('typing',(data)=>{
        console.log(data+ 'is typing')
    })

    $('#send').on('click',()=>{
        let messageText = $('#messageToSend').val()
        chatMessage.message = messageText
        socket.emit('chat-message',chatMessage)
    })

    $('#messageToSend').on('keyPress',()=>{
        socket.emit('typing','Sonu')
    })
}

chatSocket()