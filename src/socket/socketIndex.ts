import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

const rooms: { [key: string]: Set<string> } = {}; // 방 이름을 키로, 닉네임 집합을 값으로 저장

export const initializeSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // CORS 설정
        },
    });

    // socket.io 연결처리
    io.on('connection', (socket) => {
        console.log(`유저 연결: ${socket.id}`);

        // 방 참가
        socket.on('joinRoom', (room: string, nickName: string) => {
            if (!room || !nickName) {
                socket.emit('errorMessage', '방 이름과 닉네임은 필수입니다.');
                return;
            }

            socket.join(room);

            if (!rooms[room]) {
                rooms[room] = new Set();
            }
            rooms[room].add(nickName);

            console.log(`방 ${room}에 참가: ${nickName}`);
            io.to(room).emit('systemMessage', `${nickName}님이 방에 입장하셨습니다.`);
        });

        // 채팅 메시지 처리
        socket.on('chatMessage', (room: string, nickName: string, msg: string) => {
            try {
                if (!room || !nickName || !msg) {
                    socket.emit('errorMessage', '유효하지 않은 데이터입니다.');
                    return;
                }

                if (!rooms[room]?.has(nickName)) {
                    socket.emit('errorMessage', '해당 방에 참가하지 않았습니다.');
                    return;
                }

                console.log(`${nickName}이(가) 방 ${room}에 메시지 전송: ${msg}`);
                io.to(room).emit('chatMessage', { nickName, msg });
            } catch (err) {
                console.error('채팅 메시지 전송 중 오류:', err);
                socket.emit('errorMessage', '채팅 메시지 전송 중 오류가 발생했습니다.');
            }
        });

        // 채팅 종료
        socket.on('endChat', (room: string, nickName: string) => {
            try {
                if (!room || !nickName) {
                    socket.emit('errorMessage', '유효하지 않은 데이터입니다.');
                    return;
                }

                if (!rooms[room]?.has(nickName)) {
                    socket.emit('errorMessage', '해당 방에 참가하지 않았습니다.');
                    return;
                }

                socket.leave(room);
                rooms[room].delete(nickName);

                if (rooms[room].size === 0) {
                    delete rooms[room]; // 방에 아무도 없으면 삭제
                }

                console.log(`방 ${room}에서 나감: ${nickName}`);
                io.to(room).emit('endChat', `${nickName}님이 방에서 나갔습니다.`);
            } catch (err) {
                console.error('채팅 종료 중 오류:', err);
                socket.emit('errorMessage', '채팅 종료 중 오류가 발생했습니다.');
            }
        });

        // 연결 종료
        socket.on('disconnect', () => {
            console.log(`유저 연결종료: ${socket.id}`);
            // 연결 종료 시 필요한 추가 처리 가능
        });
    });
};
