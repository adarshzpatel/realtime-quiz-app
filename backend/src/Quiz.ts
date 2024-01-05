import { IoManager } from "./managers/ioManager";

type AllowedSubmission = 0 | 1 | 2 | 3;
const PROBLEM_DURATION = 20;
interface Problem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  answer: AllowedSubmission;
  options: {
    id: number;
    title: string;
  }[];
  submissions: Submission[];
  startTime: number;
}

interface Submission {
  problemId: number;
  userId: string;
  isCorrect: boolean;
  optionSelected: AllowedSubmission;
}

interface User {
  id: string;
  name: string;
  score: number;
}

export class Quiz {
  public roomId: string;
  private hasStarted: boolean;
  private problems: Problem[];
  private activeProblem: number = 0;
  private users: User[];
  private currentState:"leaderboard" | "question" | "not_started" | "ended";

  constructor(roomId: string) {
    this.roomId = roomId;
    this.hasStarted = false;
    this.problems = [];
    this.users = [];
    this.currentState='not_started'
  }

  addProblem(problem: Problem) {
    this.problems.push(problem);
  }
  start() {
    this.hasStarted = true;
    const io = IoManager.getIo();
    io.emit("CHANGE_PROBLEM", {
      problem: this.problems[0],
    });
    this.setActiveProblem(this.problems[0]);
  }
  setActiveProblem(problem: Problem) {
    problem.startTime = new Date().getTime();
    problem.submissions = [];
    IoManager.getIo().emit("CHANGE_PROBLEM", {
      problem,
    });
    setTimeout(() => {
      this.sendLeaderboard();
    }, PROBLEM_DURATION * 1000);
  }
  sendLeaderboard() {
    const leaderboard = this.getLeaderboard().splice(0, 20);
    IoManager.getIo().to(this.roomId).emit("leaderboard", { leaderboard });
  }
  next() {
    this.activeProblem++;
    const problem = this.problems[this.activeProblem];
    if (problem) {
      this.setActiveProblem(problem);
    } else {
      IoManager.getIo().emit("QUIZ_FINISHED", {
        problem,
      });
    }
  }
  getRandomString(length: number) {
    let result = " ";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  addUser(name: string) {
    const id = this.getRandomString(7);
    this.users.push({
      id,
      name,
      score: 0,
    });
    return id;
  }

  submitAnswer(
    userId: string,
    roomId: string,
    problemId: number,
    submission: 0 | 1 | 2 | 3
  ) {
    const problem = this.problems.find((x) => x.id === problemId);
    const user = this.users.find((x) => x.id === userId);
    if (!problem || !user) return;

    const existingSubmission = problem.submissions.find(
      (x) => x.userId == userId
    );
    if (!existingSubmission) return;
    problem.submissions.push({
      problemId,
      userId,
      isCorrect: problem.answer === submission,
      optionSelected: submission,
    });
    user.score +=
      1000 -
      (500 * (new Date().getTime() - problem.startTime)) / PROBLEM_DURATION;
  }

  getLeaderboard() {
    return this.users.sort((a, b) => b.score - a.score);
  }
  getCurrentState(){
    if(this.currentState === "not_started"){
      return {
        type:"not_started"
      }
    }
    if(this.currentState === "ended"){
      return {
        type:"ended",
        leaderboard:this.getLeaderboard()
      }
    }
    
    if(this.currentState === "question"){
      return {
        type:"question",
        problem:this.problems[this.activeProblem]
      }
    }

    if(this.currentState === 'leaderboard'){
      return {
        type:"leaderboard",
        leaderboard:this.getLeaderboard()
      }
    }
  }
}
