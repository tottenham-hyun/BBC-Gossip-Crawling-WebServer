import {Server} from 'socket.io'
import {Server as HttpServer} from 'http'

const rooms = []

export const initializeSocket = (server : HttpServer)=>{
    const io = new Server(server, {
        cors:{
            origin : '*'
        }
    })

    // socket.io 연결처리
    io.on('connection', (socket)=>{
        console.log(`유저 연결: ${socket.id}`)

        // 방 참가
        socket.on('joinRoom',(room, nickName)=>{
            socket.join(room)
            rooms.push(nickName)
        })

        // 채팅 메시지 처리
        socket.on('chatMessage', (room, nickName, msg)=>{
            try {
                console.log(`${nickName}이(가) 방 ${room}에 메시지 전송: ${msg}`)
                // 해당 방에 메시지 전송(자신 제외)
                io.to(room).emit('chatMessage', { nickName, msg })
            } catch (err) {
                console.error('채팅 메시지 전송 중 오류:', err)
                socket.emit('errorMessage', '채팅 메시지 전송 중 오류가 발생했습니다.')
            }
        })

        // 채팅 종료
        socket.on('endChat',(room, nickName)=>{
            try{
                // 방에서 나가기
                socket.leave(room)
                console.log(`방 ${room}에서 나감`)
                io.to(room).emit('endChat', `Admin : ${nickName}이 방에서 나갔습니다.`)
            } catch(err){
                console.log(err)
                socket.emit('errorMessage', '채팅 종료 중 오류가 발생했습니다.')
            }
        })

        // 연결 종료
        socket.on('disconnect', ()=>{
            console.log(`유저 연결종료 : ${socket.id}`)
        })
    })
}