import { Server } from "socket.io";

export class IoManager {
  private static io: Server;

  public static getIo(){
    if(!this.io){
      const io = new Server();
      this.io = io;
    }
    return this.io
  }
}
