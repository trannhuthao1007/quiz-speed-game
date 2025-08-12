const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// serve static client
app.use(express.static(path.join(__dirname, 'public')));

// trạng thái toàn cục
let teams = {}; // socketId -> {id (socket), name, score}
let currentQuestion = null; // {text, opts, answerIndex, startTime}
let questionOpen = false;
let firstCorrectAwarded = false;
let teacherSocket = null;

io.on('connection', socket => {
  console.log('conn', socket.id);

  socket.on('registerTeam', name => {
    teams[socket.id] = { id: socket.id, name, score: 0 };
    socket.emit('registered', teams[socket.id]);
    io.emit('leaderboard', Object.values(teams));
  });

  socket.on('registerTeacher', ()=>{ teacherSocket = socket; socket.emit('teacherOk'); });

  socket.on('publishQuestion', q => {
    currentQuestion = { ...q, startTime: null };
    questionOpen = true; firstCorrectAwarded = false;
    io.emit('questionPublished', { text: q.text, opts: q.opts });
    console.log('Published question:', q.text);
  });

  socket.on('startTimer', (ts) => {
    if(!currentQuestion) return;
    currentQuestion.startTime = ts || Date.now();
    firstCorrectAwarded = false;
    questionOpen = true;
    io.emit('timerStarted', currentQuestion.startTime);
    console.log('Timer started at', currentQuestion.startTime);
  });

  socket.on('submitAnswer', payload => {
    // payload: {choiceIndex, basePoints, bonusMax, bonusWindow}
    if(!questionOpen || !currentQuestion) return;
    const team = teams[socket.id]; if(!team) return;
    const now = Date.now();
    const elapsed = now - (currentQuestion.startTime || now);
    const correct = payload.choiceIndex === currentQuestion.answerIndex;

    if(correct && !firstCorrectAwarded){
      const base = payload.basePoints || 100;
      const bonusMax = payload.bonusMax || 50;
      const t = Math.min(elapsed, payload.bonusWindow || 10000);
      const bonus = Math.round(bonusMax * (1 - t / (payload.bonusWindow || 10000)));
      const points = base + bonus;
      team.score += points;
      firstCorrectAwarded = true;
      questionOpen = false;
      io.emit('award', { teamId: team.id, name: team.name, points, bonus, elapsed });
      io.emit('leaderboard', Object.values(teams));
      console.log('Awarded', team.name, points, 'bonus', bonus);
    } else {
      socket.emit('answerResult', { correct, allowed: !firstCorrectAwarded });
    }
  });

  socket.on('disconnect', ()=>{
    delete teams[socket.id]; io.emit('leaderboard', Object.values(teams));
    if(teacherSocket && teacherSocket.id === socket.id) teacherSocket = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log('Server listening', PORT));
