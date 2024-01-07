import { Socket } from "socket.io";
import { QuizManager } from "./QuizManager";

const ADMIN_PASSWORD = "admin_op";

export class UserManager {
  private users: {
    roomId: string;
    socket: Socket;
  }[];
  private quizManager;

  constructor() {
    this.users = [];
    this.quizManager = new QuizManager();
  }

  addUser(socket: Socket) {
    this.createHandlers( socket);
  }

  private createHandlers( socket: Socket) {
    socket.on("join", (data) => {
      const userId = this.quizManager.addUser(data.roomId, data.name);
      socket.emit("userId", {
        userId,
        state: this.quizManager.getCurrentState(data.roomId),
      });
    });

    socket.on("join_admin", (data) => {
      const userId = this.quizManager.addUser(data.roomId, data.name);
      if (data.password != ADMIN_PASSWORD) {
        return;
      }
      socket.emit("adminInit", {
        userId,
        state: this.quizManager.getCurrentState,
      });

      socket.on("createQuiz",data=>{
        this.quizManager.addQuiz(data.roomId)
      })

      socket.on("createProblem", (data) => {
        this.quizManager.addProblem(data.roomId, data.problem);
      });
      socket.on("next", (data) => {
        this.quizManager.next(data.roomId);
      });
    });

    socket.on("submit", (data) => {
      const userId = data.userId;
      const problemid = data.problemId;
      const submission = data.submission;
      const roomId = data.roomId;
      if (
        submission != 0 ||
        submission != 1 ||
        submission != 2 ||
        submission != 3
      ) {
        console.error("Issue while getting input " + submission);
        return;
      }
      this.quizManager.submitAnswer(roomId, userId, problemid, submission);
    });
  }
}
