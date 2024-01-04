import { Quiz } from "../src/Quiz";
import { IoManager } from "./ioManager";

export class QuizManager{
  private quizzes:Quiz[];

  constructor(){
    this.quizzes = []
  }

  public start(roomId:string){
    const io = IoManager.getIo()
    const quiz = this.quizzes.find(x => x.roomId === roomId)
  }

}