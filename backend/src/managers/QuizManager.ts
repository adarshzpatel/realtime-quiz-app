import { Quiz } from "../Quiz";
import { IoManager } from "./ioManager";


let globalProblemId = 0 ;


export interface AddProblemParams {
  answer:0|1|2|3,
  title:string,
  description:string,
  image:string,
  options: {
    id: number;
    title: string;
  }[];
}

export class QuizManager{
  private quizzes:Quiz[];

  constructor(){
    this.quizzes = []
  }

  public start(roomId:string){
    const quiz = this.getQuiz(roomId)
    quiz?.start()
  }

  public addProblem(roomId:string,problem:AddProblemParams){
    const quiz = this.getQuiz(roomId)
    if(!quiz) return 
    quiz.addProblem({
      ...problem,
      startTime:new Date().getTime(),
      submissions:[],
      id:globalProblemId++,

    })
  }

  public next(roomId:string){
    const quiz = this.getQuiz(roomId)
    if(!quiz) return 
    quiz.next()
  }


  public addUser(roomId:string,name:string){
    const quiz = this.getQuiz(roomId)
    if(quiz){
      return quiz.addUser(name)
    } else {
    console.log("QUIZ NOT FOUND")
    }
  }

  public submitAnswer(roomId:string,userId:string,problemId:number,submission:0|1|2|3){
    this.getQuiz(roomId)?.submitAnswer(userId,roomId,problemId,submission) 
  }
  
  public getQuiz(roomId:string){
    return this.quizzes.find(x => x.roomId === roomId)
  }

  public getCurrentState(roomId:string){
    const quiz = this.quizzes.find(x=> x.roomId === roomId)
    if(!quiz) return null
    return quiz.getCurrentState();
  }

  public addQuiz(roomId:string){
    const quiz = new Quiz(roomId);
    this.quizzes.push(quiz)    
  }



}